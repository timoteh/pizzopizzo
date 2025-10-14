import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type {
	TimeSlot,
	WeekInfo,
	ReservationStore,
	Reservation,
	ReservationResult,
	ReservationError
} from '$lib/types';

// Créneaux horaires disponibles
const timeSlots = [
	'17:00',
	'17:30',
	'18:00',
	'18:30',
	'19:00',
	'19:30',
	'20:00',
	'20:30',
	'21:00',
	'21:30'
];

// Les types sont importés de $lib/types

// État initial
const initialWeekInfo: WeekInfo = {
	startDate: new Date(),
	endDate: new Date(),
	deliveryDay: new Date()
};

const initialTimeSlots: TimeSlot[] = [];

// Fonction pour synchroniser les réservations
async function syncReservations(weekStart: Date) {
	const { data: reservations, error } = await supabase
		.from('reservations')
		.select('*')
		.eq('week_start', weekStart.toISOString().split('T')[0]);

	if (error) {
		console.error('Erreur lors de la récupération des réservations:', error);
		return;
	}

	if (reservations) {
		reservationStore.updateReservations(reservations.length);
	}
}

// Créer le store
const store = writable<
	Omit<
		ReservationStore,
		| 'updateTimeSlot'
		| 'updateReservations'
		| 'updateWeekInfo'
		| 'updateTimeSlots'
		| 'addReservation'
		| 'processPayment'
		| 'reset'
	>
>({
	timeSlots: [],
	reservations: 3,
	totalReservations: 3,
	minReservations: 5,
	maxReservations: 10,
	weekInfo: getWeekInfo(new Date())
});

// Fonctions du store
export const reservationStore = {
	subscribe: store.subscribe,

	updateTimeSlot: (slotId: string, available: boolean) => {
		store.update((state) => ({
			...state,
			timeSlots: state.timeSlots.map((slot) => (slot.id === slotId ? { ...slot, available } : slot))
		}));
	},

	updateReservations: (count: number) => {
		store.update((state) => ({
			...state,
			reservations: count,
			totalReservations: count
		}));
	},

	updateWeekInfo: (weekInfo: WeekInfo) => {
		const newWeekInfo = getWeekInfo(weekInfo.startDate);
		store.update((state) => ({ ...state, weekInfo: newWeekInfo }));
		// Synchroniser les réservations lors du changement de semaine
		syncReservations(newWeekInfo.startDate);
	},

	updateTimeSlots: (slots: TimeSlot[]) => {
		store.update((state) => ({ ...state, timeSlots: slots }));
		// Synchroniser les réservations lors de la mise à jour des créneaux
		syncReservations(get(store).weekInfo.startDate);
	},

	addReservation: async (reservation: Reservation): Promise<ReservationResult> => {
		try {
			// Vérifier si le créneau est toujours disponible
			const { data: timeSlot, error: timeSlotError } = await supabase
				.from('time_slots')
				.select('*')
				.eq('id', reservation.timeSlotId)
				.single();

			if (timeSlotError) {
				return {
					success: false,
					error: {
						type: 'database_error',
						message: 'Erreur lors de la vérification du créneau horaire.'
					}
				};
			}

			if (timeSlot.max_reservations <= 0) {
				return {
					success: false,
					error: {
						type: 'slot_unavailable',
						message: "Ce créneau horaire n'est plus disponible."
					}
				};
			}

			// Créer la réservation
			console.log('Création de la réservation avec les données:', {
				first_name: reservation.firstName,
				last_name: reservation.lastName,
				email: reservation.email,
				phone: reservation.phone,
				time_slot_id: reservation.timeSlotId,
				slot_time: timeSlot.slot_time, // Ajout du slot_time manquant
				week_start: reservation.weekStart.toISOString().split('T')[0],
				status: 'confirmed'
			});

			const { data: reservationData, error: reservationError } = await supabase
				.from('reservations')
				.insert([
					{
						first_name: reservation.firstName,
						last_name: reservation.lastName,
						email: reservation.email,
						phone: reservation.phone,
						time_slot_id: reservation.timeSlotId,
						slot_time: timeSlot.slot_time, // Ajout du slot_time manquant
						week_start: reservation.weekStart.toISOString().split('T')[0],
						status: 'confirmed' // La réservation est directement confirmée car le paiement est déjà effectué
					}
				])
				.select()
				.single();

			if (reservationError) {
				console.error('Erreur lors de la création de la réservation:', reservationError);
				console.error("Détails de l'erreur:", {
					code: reservationError.code,
					message: reservationError.message,
					details: reservationError.details,
					hint: reservationError.hint
				});
				return {
					success: false,
					error: {
						type: 'database_error',
						message: `Erreur lors de la création de la réservation: ${reservationError.message}`
					}
				};
			}

			console.log('Réservation créée avec succès:', reservationData);

			// Mettre à jour la disponibilité du créneau (décrémenter max_reservations)
			const { error: updateError } = await supabase
				.from('time_slots')
				.update({ max_reservations: Math.max(0, timeSlot.max_reservations - 1) })
				.eq('id', reservation.timeSlotId);

			if (updateError) {
				console.error('Erreur lors de la mise à jour du créneau:', updateError);
				// On ne retourne pas d'erreur ici car la réservation a été créée
			}

			// Rafraîchir les créneaux
			await syncTimeSlots();

			return {
				success: true
			};
		} catch (error) {
			console.error('Erreur lors de la réservation:', error);
			return {
				success: false,
				error: {
					type: 'database_error',
					message: 'Une erreur est survenue lors de la réservation.'
				}
			};
		}
	},

	processPayment: async (
		amount: number
	): Promise<{ success: boolean; error?: string; clientSecret?: string }> => {
		try {
			const response = await fetch('/api/create-payment-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ amount })
			});

			if (!response.ok) {
				const error = await response.json();
				return {
					success: false,
					error: error.message || 'Erreur lors du paiement'
				};
			}

			const { clientSecret } = await response.json();
			return { success: true, clientSecret };
		} catch (error) {
			console.error('Erreur lors du traitement du paiement:', error);
			return {
				success: false,
				error: "Une erreur s'est produite lors du traitement du paiement"
			};
		}
	},

	reset: () => {
		store.set({
			timeSlots: [],
			reservations: 0,
			totalReservations: 0,
			minReservations: 5,
			maxReservations: 10,
			weekInfo: getWeekInfo(new Date())
		});
	}
};

// Fonction pour initialiser la semaine
export async function initializeWeek() {
	const weekInfo = getWeekInfo(new Date());
	reservationStore.updateWeekInfo(weekInfo);
	await syncTimeSlots();
}

// Variable pour éviter les conditions de course
let syncInProgress = false;

// Fonction pour synchroniser les créneaux horaires
async function syncTimeSlots() {
	// Éviter les appels simultanés
	if (syncInProgress) {
		console.log('Synchronisation déjà en cours, ignoré...');
		return;
	}

	syncInProgress = true;

	try {
		const weekStart = get(store).weekInfo.startDate;
		let { data: existingSlots, error: fetchError } = await supabase
			.from('time_slots')
			.select('*')
			.eq('week_start', weekStart.toISOString().split('T')[0]);

		if (fetchError) {
			console.error('Erreur lors de la récupération des créneaux:', fetchError);
			return;
		}

		if (!existingSlots || existingSlots.length === 0) {
			// Créer les créneaux pour la semaine
			const slots = timeSlots.map((slot_time) => ({
				week_start: weekStart.toISOString().split('T')[0],
				slot_time: slot_time,
				max_reservations: 1
			}));

			const { error: insertError } = await supabase.from('time_slots').insert(slots);

			if (insertError) {
				console.error('Erreur lors de la création des créneaux:', insertError);
				// Vérifier si l'erreur est due à une duplication (violation de contrainte unique)
				if (insertError.code === '23505') {
					console.log('Les créneaux existent déjà, récupération...');
				} else {
					return;
				}
			}

			// Récupérer les créneaux (nouvellement créés ou existants)
			const { data: newSlots, error: refetchError } = await supabase
				.from('time_slots')
				.select('*')
				.eq('week_start', weekStart.toISOString().split('T')[0]);

			if (refetchError) {
				console.error('Erreur lors de la récupération des nouveaux créneaux:', refetchError);
				return;
			}

			existingSlots = newSlots;
		}

		// Mettre à jour le store avec les créneaux de la base de données
		if (existingSlots && existingSlots.length > 0) {
			reservationStore.updateTimeSlots(
				existingSlots.map((slot) => ({
					id: slot.id,
					time: slot.slot_time,
					available: slot.max_reservations > 0
				}))
			);
		}
	} finally {
		syncInProgress = false;
	}
}

// Initialiser la semaine au chargement
initializeWeek().then(() => {
	// Synchroniser les réservations après l'initialisation
	const currentWeekInfo = get(store).weekInfo;
	syncReservations(currentWeekInfo.startDate);
});

// Fonction pour mettre à jour un créneau après une réservation
async function updateTimeSlotAvailability(slotId: string, isAvailable: boolean) {
	const { error } = await supabase
		.from('time_slots')
		.update({ max_reservations: isAvailable ? 1 : 0 })
		.eq('id', slotId);

	if (error) {
		console.error('Erreur lors de la mise à jour du créneau:', error);
		return false;
	}

	return true;
}

// Fonction pour récupérer le nombre total de réservations
async function fetchTotalReservations() {
	const { data, error } = await supabase.from('reservations').select('id', { count: 'exact' });

	if (error) {
		console.error('Erreur lors de la récupération des réservations:', error);
		return 0;
	}

	return data?.length || 0;
}

// Fonction pour réserver un créneau
export async function reserveTimeSlot(slotId: string) {
	const { error } = await supabase
		.from('time_slots')
		.update({ max_reservations: 0 })
		.eq('id', slotId);

	if (error) {
		console.error('Erreur lors de la mise à jour du créneau:', error);
		return false;
	}

	// Mettre à jour le store
	store.update((state) => ({
		...state,
		timeSlots: state.timeSlots.map((slot) =>
			slot.id === slotId ? { ...slot, available: false } : slot
		)
	}));

	return true;
}

// Fonction pour obtenir les informations de la semaine
function getWeekInfo(date: Date): WeekInfo {
	// Obtenir le jour actuel (0 = dimanche, 1 = lundi, ..., 6 = samedi)
	const currentDay = date.getDay();

	// Calculer le nombre de jours depuis le lundi de cette semaine
	// Si nous sommes dimanche (0), le lundi était il y a 6 jours
	// Si nous sommes lundi (1), le lundi est aujourd'hui (0 jours)
	// Si nous sommes mardi (2), le lundi était hier (-1 jour)
	// etc.
	const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

	// Créer une nouvelle date pour le lundi de cette semaine
	const monday = new Date(date);
	monday.setDate(date.getDate() - daysSinceMonday);
	monday.setHours(0, 0, 0, 0);

	// Créer une nouvelle date pour le dimanche de cette semaine
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	sunday.setHours(23, 59, 59, 999);

	// Créer une nouvelle date pour le jour de livraison (vendredi de cette semaine)
	const deliveryDay = new Date(monday);
	deliveryDay.setDate(monday.getDate() + 4);
	deliveryDay.setHours(0, 0, 0, 0);

	return {
		startDate: monday,
		endDate: sunday,
		deliveryDay
	};
}
