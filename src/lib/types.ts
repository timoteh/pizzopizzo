export interface TimeSlot {
	id: string;
	time: string;
	available: boolean;
}

export interface WeekInfo {
	startDate: Date;
	endDate: Date;
	deliveryDay: Date;
}

export interface ReservationStore {
	timeSlots: TimeSlot[];
	reservations: number;
	totalReservations: number;
	minReservations: number;
	maxReservations: number;
	weekInfo: WeekInfo;
	updateTimeSlot: (slotId: string, available: boolean) => void;
	updateReservations: (count: number) => void;
	updateWeekInfo: (weekInfo: WeekInfo) => void;
	updateTimeSlots: (slots: TimeSlot[]) => void;
	addReservation: (reservation: Reservation) => Promise<ReservationResult>;
	processPayment: (
		amount: number
	) => Promise<{ success: boolean; error?: string; clientSecret?: string }>;
	reset: () => void;
}

export interface Reservation {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	timeSlotId: string;
	weekStart: Date;
}

export interface ReservationError {
	type: 'email_exists' | 'phone_exists' | 'slot_unavailable' | 'database_error';
	message: string;
}

export interface ReservationResult {
	success: boolean;
	error?: ReservationError;
}
