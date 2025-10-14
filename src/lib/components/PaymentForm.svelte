<script lang="ts">
	import { onMount } from 'svelte';
	import { getStripe } from '$lib/stripe';
	import { reservationStore } from '$lib/stores/reservation';
	import { loadStripe } from '@stripe/stripe-js';
	import { dev } from '$app/environment';

	export let amount: number;
	export let onSuccess: () => void = () => {};
	export let onError: (error: string) => void = () => {};

	let stripe: any;
	let elements: any;
	let paymentElement: any;
	let loading = false;
	let errorMessage = '';
	let cardComplete = false;

	onMount(async () => {
		try {
			stripe = await getStripe();
			if (!stripe) {
				throw new Error("Stripe n'a pas pu être initialisé");
			}

			const { success, error, clientSecret } = await reservationStore.processPayment(amount);

			if (!success || !clientSecret) {
				throw new Error(error || 'Erreur lors de la création du paiement');
			}

			elements = stripe.elements({
				clientSecret,
				appearance: {
					theme: 'night',
					variables: {
						colorPrimary: 'hsl(var(--primary))',
						colorBackground: 'hsl(var(--card))',
						colorText: 'hsl(var(--foreground))',
						colorDanger: 'hsl(var(--destructive))',
						fontFamily: 'Montserrat, sans-serif',
						spacingUnit: '4px',
						borderRadius: '8px'
					}
				}
			});

			paymentElement = elements.create('payment', {
				layout: 'tabs',
				paymentMethodOrder: ['card']
			});
			paymentElement.mount('#payment-element');

			// Écouter les changements d'état des champs de paiement
			paymentElement.on('change', (event: any) => {
				cardComplete = event.complete;
			});
		} catch (error) {
			console.error("Erreur lors de l'initialisation du paiement:", error);
			onError(error instanceof Error ? error.message : 'Une erreur est survenue');
		}
	});

	async function handleSubmit() {
		if (!stripe || !elements || !cardComplete) {
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				redirect: 'if_required'
			});

			if (error) {
				errorMessage = error.message || 'Une erreur est survenue lors du paiement';
				onError(errorMessage);
			} else if (paymentIntent && paymentIntent.status === 'succeeded') {
				// Paiement réussi, appeler onSuccess pour sauvegarder la réservation
				onSuccess();
			} else {
				errorMessage = "Le paiement n'a pas pu être confirmé";
				onError(errorMessage);
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
			onError(errorMessage);
		} finally {
			loading = false;
		}
	}
</script>

<!-- Container principal -->
<div>
	<!-- En-tête -->
	<div class="relative mb-8 text-center">
		<!-- Icône principale -->
		<div class="relative mb-4">
			<div
				class="bg-primary/10 border-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-sm"
			>
				<div class="text-3xl">💳</div>
			</div>
		</div>

		<!-- Badge de sécurité -->
		<div
			class="bg-chart-2/10 text-chart-2 ring-chart-2/20 mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1"
		>
			<div class="bg-chart-2 h-2 w-2 rounded-full"></div>
			<span>🔒 Paiement 100% sécurisé</span>
		</div>
	</div>

	<!-- Affichage du montant -->
	<div
		class="border-primary/20 from-primary/5 via-chart-1/5 to-primary/5 relative mb-8 rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-sm"
	>
		<div class="text-center">
			<p class="text-muted-foreground text-sm font-medium">Total à payer</p>
			<div class="flex items-baseline justify-center gap-1">
				<span class="text-primary text-4xl font-bold">{amount.toFixed(2)}</span>
				<span class="text-muted-foreground text-lg font-semibold">$ CAD</span>
			</div>
		</div>
	</div>

	<!-- Élément de paiement Stripe avec style amélioré -->
	<div class="relative mb-6">
		<div
			class="from-primary/10 to-chart-1/10 absolute inset-0 rounded-2xl bg-gradient-to-r blur-xl"
		></div>
		<div
			id="payment-element"
			class="border-border/50 bg-card/80 relative rounded-2xl border p-6 backdrop-blur-sm"
		>
			<!-- Stripe Elements sera monté ici -->
		</div>
	</div>

	<!-- Message d'erreur -->
	{#if errorMessage}
		<div
			class="border-destructive/30 from-destructive/10 to-destructive/5 mb-6 rounded-2xl border bg-gradient-to-r p-4 backdrop-blur-sm"
		>
			<div class="flex items-start gap-3">
				<div class="bg-destructive/20 flex h-8 w-8 items-center justify-center rounded-full">
					<span class="text-lg">⚠️</span>
				</div>
				<div class="flex-1">
					<p class="text-destructive font-semibold">Oups ! Un problème est survenu</p>
					<p class="text-destructive/80 text-sm">{errorMessage}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Bouton de paiement -->
	<button
		on:click={handleSubmit}
		disabled={loading || !cardComplete}
		class="from-primary via-chart-1 to-primary hover:shadow-primary/25 text-primary-foreground w-full rounded-2xl bg-gradient-to-r px-8 py-4 transition-all duration-300 hover:shadow-xl disabled:opacity-50"
	>
		<span class="flex items-center justify-center gap-3 text-lg font-bold">
			{#if loading}
				<div
					class="border-primary-foreground/30 border-t-primary-foreground h-6 w-6 animate-spin rounded-full border-2"
				></div>
				<span>Traitement en cours...</span>
			{:else}
				<span>Finaliser le paiement</span>
			{/if}
		</span>
	</button>

	<!-- Badges de sécurité -->
	<div class="border-border/50 mt-8 border-t pt-6">
		<div class="text-muted-foreground flex items-center justify-center gap-6 text-xs">
			<!-- Stripe Badge -->
			<div class="bg-chart-3/10 flex items-center gap-2 rounded-full px-3 py-2">
				<div class="bg-chart-3 h-2 w-2 rounded-full"></div>
				<span class="font-medium">Stripe</span>
			</div>

			<!-- Sécurisé Badge -->
			<div class="bg-chart-1/10 flex items-center gap-2 rounded-full px-3 py-2">
				<div class="bg-chart-1 h-2 w-2 rounded-full"></div>
				<span class="font-medium">Sécurisé</span>
			</div>
		</div>

		<!-- Texte de confiance -->
		<p class="text-muted-foreground mt-4 text-center text-xs">
			Vos informations bancaires sont protégées et ne sont jamais stockées
		</p>
	</div>
</div>

<!-- Styles globaux pour les éléments Stripe -->
<style>
	/* Styles pour les éléments Stripe */
	:global(#payment-element .ElementsApp) {
		background: transparent !important;
		border-radius: 12px !important;
		padding: 0 !important;
	}

	:global(#payment-element input),
	:global(#payment-element select) {
		background: hsl(var(--input)) !important;
		color: hsl(var(--foreground)) !important;
		border: 2px solid hsl(var(--border)) !important;
		border-radius: 12px !important;
		padding: 14px !important;
		font-size: 16px !important;
		transition: all 0.3s ease !important;
		font-family: 'Montserrat', sans-serif !important;
	}

	:global(#payment-element input:focus),
	:global(#payment-element select:focus) {
		border-color: hsl(var(--ring)) !important;
		box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2) !important;
		outline: none !important;
	}

	:global(#payment-element label) {
		color: hsl(var(--muted-foreground)) !important;
		font-weight: 600 !important;
		margin-bottom: 8px !important;
		font-size: 14px !important;
		font-family: 'Montserrat', sans-serif !important;
	}

	:global(#payment-element .Error) {
		color: hsl(var(--destructive)) !important;
		font-size: 14px !important;
		margin-top: 8px !important;
		font-family: 'Montserrat', sans-serif !important;
	}

	/* Style pour les onglets de méthodes de paiement */
	:global(#payment-element .Tab) {
		background: hsl(var(--muted)) !important;
		color: hsl(var(--muted-foreground)) !important;
		border: 2px solid hsl(var(--border)) !important;
		border-radius: 8px !important;
		padding: 12px 16px !important;
		margin-right: 8px !important;
		font-weight: 500 !important;
		transition: all 0.2s ease !important;
	}

	:global(#payment-element .Tab--selected) {
		background: hsl(var(--primary)) !important;
		color: hsl(var(--primary-foreground)) !important;
		border-color: hsl(var(--primary)) !important;
	}
</style>
