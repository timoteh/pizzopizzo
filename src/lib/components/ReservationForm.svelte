<script lang="ts">
	import { User, Mail, Phone, Clock, Info } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { reservationStore } from '$lib/stores/reservation';
	import { formStore } from '$lib/stores/form';
	import { formatWeekRange, formatDeliveryDay } from '$lib/utils/date';
	import PaymentForm from './PaymentForm.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import InputField from './InputField.svelte';
	import SelectField from './SelectField.svelte';

	export let PIZZA_PRICE: number;

	let showFields = false;
	let formError: string | null = null;
	let formSuccess: string | null = null;
	let showPayment = false;

	onMount(() => {
		setTimeout(() => (showFields = true), 500);
	});

	async function handleSubmit() {
		// Valider tous les champs et marquer comme touchés
		formStore.validateAllFields();

		// Attendre un tick pour que le store soit mis à jour
		await new Promise((resolve) => setTimeout(resolve, 0));

		if (!$formStore.isValid) {
			formError = 'Veuillez remplir tous les champs obligatoires avant de procéder au paiement.';

			// Faire défiler vers le premier champ avec une erreur
			setTimeout(() => {
				const firstErrorField = document.querySelector('.ring-destructive\\/50');
				if (firstErrorField) {
					firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
					(firstErrorField as HTMLElement).focus();
				}
			}, 100);

			return;
		}

		formStore.setSubmitting(true);
		formError = null;
		formSuccess = null;
		showPayment = true;

		// Faire défiler vers le formulaire de paiement
		setTimeout(() => {
			const paymentContainer = document.querySelector('#payment-form-container');
			if (paymentContainer) {
				paymentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100); // Délai réduit car on cible le container qui existe immédiatement
	}

	async function handlePaymentSuccess() {
		try {
			const result = await reservationStore.addReservation({
				firstName: $formStore.data.firstName,
				lastName: $formStore.data.lastName,
				email: $formStore.data.email,
				phone: $formStore.data.phone,
				timeSlotId: $formStore.data.timeSlot,
				weekStart: $reservationStore.weekInfo.startDate
			});

			if (result.success) {
				formStore.reset();
				// Rediriger vers la page de confirmation après succès
				window.location.href = '/confirmation?success=true';
			} else {
				formError = result.error?.message || 'Une erreur est survenue lors de la réservation.';
				showPayment = false;
			}
		} catch (error) {
			formError = 'Une erreur est survenue lors de la réservation.';
			showPayment = false;
		} finally {
			formStore.setSubmitting(false);
		}
	}

	function handlePaymentError(error: string) {
		formError = error;
		showPayment = false;
		formStore.setSubmitting(false);
	}
</script>

<!-- FORMULAIRE SECTION -->
<section
	id="reservation"
	class="from-card to-muted text-card-foreground relative flex flex-col items-center bg-gradient-to-b px-6 py-12"
>
	<div
		class="from-card/80 to-popover/60 ring-primary/20 relative z-10 w-full max-w-[700px] rounded-2xl bg-gradient-to-br p-8 shadow-xl ring-1 backdrop-blur-lg sm:p-12"
	>
		<!-- En-tête simple -->
		<div class="mb-8 text-center">
			<div class="mb-4 text-4xl">🍕</div>
			<h2 class="text-primary mb-2 text-3xl font-bold tracking-wide">Réservez votre pizza !</h2>
			<div class="mb-4 flex items-center justify-center gap-2">
				<span
					class="from-chart-2/20 to-chart-3/20 text-chart-2 ring-chart-2/30 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium ring-1"
				>
					✨ Nouvelle semaine disponible !
				</span>
			</div>
			<p class="text-muted-foreground text-lg">
				Seulement <span class="text-primary font-bold">{PIZZA_PRICE}$ CAD</span> par pizza
			</p>
		</div>

		<div
			class="border-chart-3/20 from-chart-3/10 to-chart-5/10 mb-8 rounded-xl border bg-gradient-to-r p-4"
		>
			<p class="text-card-foreground text-center text-base">
				📅 Semaine du <span class="text-chart-3 font-bold">
					{formatWeekRange(
						$reservationStore.weekInfo.startDate,
						$reservationStore.weekInfo.endDate
					)}
				</span>
			</p>
			<p class="text-card-foreground mt-1 text-center text-base">
				🏪 Retrait sur place le <span class="text-chart-5 font-bold">
					{formatDeliveryDay($reservationStore.weekInfo.deliveryDay)}
				</span>
			</p>
		</div>

		<ProgressBar />

		<!-- Encart info simple -->
		<div class="mb-8">
			<div
				class="border-chart-3/20 from-chart-3/10 to-chart-4/10 rounded-xl border bg-gradient-to-r p-4"
			>
				<div class="flex items-start gap-3">
					<Info class="text-chart-3 mt-1 h-5 w-5" />
					<div class="text-muted-foreground text-sm">
						<p class="text-chart-3 mb-1 font-medium">Conditions d'annulation</p>
						<p>
							Annulation gratuite jusqu'à <span class="text-chart-3 font-bold">48h</span> avant
							retrait<br />
							<span class="text-primary font-medium">50% remboursé</span> si annulation de dernière minute
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- FORMULAIRE -->
		{#if formSuccess}
			<div class="flex flex-col items-center gap-4 text-center">
				<div class="text-4xl">🎉</div>
				<div
					class="border-chart-2/30 from-chart-2/20 to-chart-3/20 rounded-xl border bg-gradient-to-r p-6 shadow-lg"
				>
					<h3 class="text-chart-2 mb-2 text-xl font-bold">Fantastique !</h3>
					<p class="text-chart-2 text-lg">{formSuccess}</p>
				</div>
				<p class="text-muted-foreground text-sm">
					Vous recevrez un email de confirmation sous peu !
				</p>
			</div>
		{:else}
			<form class="flex flex-col gap-6" on:submit|preventDefault={handleSubmit}>
				{#if formError}
					<div
						class="border-destructive/30 from-destructive/20 to-destructive/10 rounded-xl border bg-gradient-to-r p-4"
					>
						<div class="flex items-start gap-3">
							<div class="text-xl">⚠️</div>
							<div>
								<p class="text-destructive mb-1 font-medium">Oups ! Un petit problème...</p>
								<p class="text-destructive-foreground text-sm">{formError}</p>
							</div>
						</div>
					</div>
				{/if}

				<div class="mb-4 text-center">
					<h3 class="text-card-foreground mb-2 text-xl font-semibold">👤 Vos informations</h3>
					<p class="text-muted-foreground text-sm">
						Quelques détails pour votre délicieuse pizza !
					</p>
				</div>

				<InputField
					type="text"
					placeholder="Votre prénom"
					value={$formStore.data.firstName}
					error={$formStore.errors.firstName}
					touched={$formStore.touched.firstName}
					icon={User}
					delay={0}
					{showFields}
					on:input={(e) => formStore.updateField('firstName', e.detail)}
				/>

				<InputField
					type="text"
					placeholder="Votre nom de famille"
					value={$formStore.data.lastName}
					error={$formStore.errors.lastName}
					touched={$formStore.touched.lastName}
					icon={User}
					delay={100}
					{showFields}
					on:input={(e) => formStore.updateField('lastName', e.detail)}
				/>

				<InputField
					type="email"
					placeholder="votre.email@exemple.com"
					value={$formStore.data.email}
					error={$formStore.errors.email}
					touched={$formStore.touched.email}
					icon={Mail}
					delay={200}
					{showFields}
					on:input={(e) => formStore.updateField('email', e.detail)}
				/>

				<InputField
					type="tel"
					placeholder="Votre numéro de téléphone"
					value={$formStore.data.phone}
					error={$formStore.errors.phone}
					touched={$formStore.touched.phone}
					icon={Phone}
					delay={300}
					{showFields}
					on:input={(e) => formStore.updateField('phone', e.detail)}
				/>

				<div class="my-6 text-center">
					<h3 class="text-foreground mb-2 text-xl font-semibold">⏰ Heure de récupération</h3>
					<p class="text-muted-foreground text-sm">Quand souhaitez-vous récupérer votre pizza ?</p>
				</div>

				<SelectField
					value={$formStore.data.timeSlot}
					error={$formStore.errors.timeSlot}
					touched={$formStore.touched.timeSlot}
					icon={Clock}
					delay={400}
					{showFields}
					on:change={(e) => formStore.updateField('timeSlot', e.detail)}
				/>

				{#if showPayment}
					<div
						id="payment-form-container"
						class="relative transition-all delay-500 duration-1000"
						style="opacity: {showFields ? 1 : 0}; transform: translateY({showFields ? 0 : 20}px);"
					>
						<PaymentForm
							amount={PIZZA_PRICE}
							onSuccess={handlePaymentSuccess}
							onError={handlePaymentError}
						/>
					</div>
				{:else}
					<div class="my-8 text-center">
						<div class="mb-4 text-3xl">💳</div>
						<h3 class="text-foreground mb-2 text-xl font-semibold">Finaliser votre commande</h3>
						<p class="text-muted-foreground mb-6 text-sm">
							Un dernier clic et votre pizza sera réservée !
						</p>

						<button
							type="submit"
							disabled={!$formStore.isValid || $formStore.isSubmitting}
							class="group bg-primary text-foreground hover:bg-primary/90 relative overflow-hidden rounded-2xl px-12 py-4 text-lg font-bold transition-all duration-300 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span class="relative z-10 flex items-center gap-3">
								{#if $formStore.isSubmitting}
									<div class="animate-spin">⏳</div>
									Traitement en cours...
								{:else}
									🍕 Payer {PIZZA_PRICE}$ et réserver !
								{/if}
							</span>
						</button>

						{#if !$formStore.isValid}
							<div class="mt-4 text-center">
								<div class="flex flex-wrap justify-center gap-2 text-xs">
									{#if $formStore.errors.firstName}
										<span class="bg-destructive/10 text-destructive rounded-full px-2 py-1"
											>Prénom</span
										>
									{/if}
									{#if $formStore.errors.lastName}
										<span class="bg-destructive/10 text-destructive rounded-full px-2 py-1"
											>Nom</span
										>
									{/if}
									{#if $formStore.errors.email}
										<span class="bg-destructive/10 text-destructive rounded-full px-2 py-1"
											>Email</span
										>
									{/if}
									{#if $formStore.errors.phone}
										<span class="bg-destructive/10 text-destructive rounded-full px-2 py-1"
											>Téléphone</span
										>
									{/if}
									{#if $formStore.errors.timeSlot}
										<span class="bg-destructive/10 text-destructive rounded-full px-2 py-1"
											>Créneau</span
										>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</form>
		{/if}
	</div>
</section>
