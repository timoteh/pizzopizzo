<script lang="ts">
	import { onMount } from 'svelte';
	import { getStripe } from '$lib/stripe';
	import { page } from '$app/stores';
	import { Pizza } from 'lucide-svelte';

	let status = 'loading';
	let message = 'Vérification du paiement en cours...';

	onMount(async () => {
		// Vérifier d'abord si on a un paramètre success=true (nouveau flux)
		const successParam = $page.url.searchParams.get('success');
		if (successParam === 'true') {
			status = 'success';
			message = 'Paiement réussi ! Votre réservation a été confirmée.';
			return;
		}

		// Sinon, utiliser l'ancien flux avec Stripe (pour compatibilité)
		const stripe = await getStripe();
		if (!stripe) {
			status = 'error';
			message = "Erreur lors de l'initialisation de Stripe";
			return;
		}

		const clientSecret = $page.url.searchParams.get('payment_intent_client_secret');
		if (!clientSecret) {
			status = 'error';
			message = 'Informations de paiement manquantes';
			return;
		}

		const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

		if (!paymentIntent) {
			status = 'error';
			message = 'Impossible de récupérer les informations de paiement';
			return;
		}

		switch (paymentIntent.status) {
			case 'succeeded':
				status = 'success';
				message = 'Paiement réussi ! Votre réservation a été confirmée.';
				break;
			case 'processing':
				status = 'processing';
				message = 'Votre paiement est en cours de traitement.';
				break;
			case 'requires_payment_method':
				status = 'error';
				message = "Votre paiement n'a pas abouti. Veuillez réessayer.";
				break;
			default:
				status = 'error';
				message = 'Une erreur est survenue lors du paiement.';
				break;
		}
	});
</script>

<div class="bg-background text-foreground relative min-h-screen overflow-hidden">
	<div class="absolute inset-0">
		<div class="from-background via-card to-background absolute inset-0 bg-gradient-to-br"></div>
		<div
			class="absolute inset-0 opacity-[0.02]"
			style="background-image: url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div
			class="bg-primary/5 absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
		></div>
	</div>

	<nav class="relative z-20 flex items-center justify-between px-6 py-6 lg:px-8">
		<div class="flex items-center gap-3">
			<div
				class="border-primary/20 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl border"
			>
				<Pizza class="text-primary h-6 w-6" />
			</div>
			<span class="text-foreground text-xl font-bold">Croustimothy</span>
		</div>
	</nav>

	<!-- Contenu principal -->
	<div class="relative z-10 flex min-h-[calc(100vh-120px)] items-center justify-center px-6 py-16">
		<div
			class="from-card/80 to-popover/60 ring-primary/20 w-full max-w-2xl rounded-2xl bg-gradient-to-br p-8 shadow-xl ring-1 backdrop-blur-lg sm:p-12"
		>
			{#if status === 'loading'}
				<div class="text-center">
					<div class="mb-6">
						<div
							class="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full"
						>
							<div
								class="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2"
							></div>
						</div>
					</div>
					<h2 class="text-foreground mb-4 text-2xl font-bold">Vérification en cours...</h2>
					<p class="text-muted-foreground text-lg">{message}</p>
				</div>
			{:else if status === 'success'}
				<div class="text-center">
					<div class="mb-6 flex justify-center gap-4 text-4xl">
						<span>🎉</span>
						<span>🍕</span>
						<span>✨</span>
					</div>

					<!-- Icône de succès -->
					<div class="mb-6">
						<div
							class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
						>
							<svg
								class="h-10 w-10 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						</div>
					</div>

					<h1 class="text-primary mb-4 text-3xl font-bold">Fantastique !</h1>
					<p class="text-foreground mb-8 text-xl">{message}</p>

					<div class="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6">
						<div class="space-y-4">
							<div class="flex items-center gap-3">
								<span class="text-xl">📧</span>
								<span class="text-sm text-green-800"
									>Un email de confirmation vous a été envoyé</span
								>
							</div>
							<div class="flex items-center gap-3">
								<span class="text-xl">📱</span>
								<span class="text-sm text-green-800">Vous recevrez un SMS de rappel</span>
							</div>
							<div class="flex items-center gap-3">
								<span class="text-xl">🕐</span>
								<span class="text-sm text-green-800"
									>N'oubliez pas votre créneau de récupération</span
								>
							</div>
						</div>
					</div>

					<div class="border-primary/20 bg-primary/10 rounded-xl border p-4">
						<p class="text-primary font-medium">Merci pour votre confiance ! ❤️</p>
					</div>
				</div>
			{:else if status === 'processing'}
				<div class="text-center">
					<div class="mb-6">
						<div
							class="bg-chart-3/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full"
						>
							<div
								class="border-chart-3/30 border-t-chart-3 h-8 w-8 animate-spin rounded-full border-2"
							></div>
						</div>
					</div>
					<h2 class="text-chart-3 mb-4 text-2xl font-bold">Paiement en cours</h2>
					<p class="text-muted-foreground mb-4 text-lg">{message}</p>
					<div class="border-chart-3/20 bg-chart-3/10 rounded-xl border p-4">
						<p class="text-chart-3 text-sm">Cela peut prendre quelques instants...</p>
					</div>
				</div>
			{:else}
				<div class="text-center">
					<div class="mb-6 text-4xl">😔</div>
					<div class="mb-6">
						<div
							class="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full"
						>
							<svg
								class="text-destructive h-10 w-10"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
						</div>
					</div>
					<h2 class="text-destructive mb-4 text-2xl font-bold">Oups ! Un problème...</h2>
					<p class="text-muted-foreground mb-6 text-lg">{message}</p>
					<div class="border-destructive/20 bg-destructive/10 rounded-xl border p-4">
						<p class="text-destructive text-sm">
							💬 Besoin d'aide ? Contactez-nous à
							<a href="mailto:admin@croustimothy.com" class="hover:underline">
								admin@croustimothy.com
							</a>
						</p>
					</div>
				</div>
			{/if}

			<div class="mt-8 text-center">
				<a
					href="/"
					class="from-primary via-chart-1 to-primary hover:shadow-primary/25 text-primary-foreground inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						></path>
					</svg>
					Retour à l'accueil
				</a>
			</div>
		</div>
	</div>
</div>
