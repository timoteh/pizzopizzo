<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Pizza } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';

	let loading = false;
	let error = '';

	onMount(() => {
		// Vérifier les paramètres d'erreur dans l'URL
		const errorParam = $page.url.searchParams.get('error');
		if (errorParam === 'auth_failed') {
			error = "Échec de l'authentification. Veuillez réessayer.";
		} else if (errorParam === 'callback_failed') {
			error = 'Erreur lors de la connexion. Veuillez réessayer.';
		}
	});

	async function handleGoogleSignIn() {
		loading = true;
		error = '';

		try {
			const result = await authStore.signInWithGoogle();

			if (!result.success) {
				error = result.error || 'Erreur lors de la connexion';
			}
			// Si succès, l'utilisateur sera redirigé automatiquement par Google
		} catch (err) {
			error = 'Erreur lors de la connexion. Veuillez réessayer.';
			console.error('Erreur de connexion:', err);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Connexion - Croustimothy</title>
</svelte:head>

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

	<div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
		<div class="mb-8 text-center">
			<div class="mb-6 flex justify-center">
				<div
					class="border-primary/20 bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl border"
				>
					<Pizza class="text-primary h-8 w-8" />
				</div>
			</div>
			<h1 class="text-foreground mb-2 text-3xl font-bold">Croustimothy</h1>
			<p class="text-muted-foreground text-lg">Pizza artisanale</p>
		</div>

		<div
			class="from-card/80 to-popover/60 ring-primary/20 w-full max-w-md rounded-2xl bg-gradient-to-br p-8 shadow-xl ring-1 backdrop-blur-lg"
		>
			<div class="mb-6 text-center">
				<h2 class="text-card-foreground mb-2 text-2xl font-bold">Connexion requise</h2>
				<p class="text-muted-foreground text-sm">
					Connectez-vous avec votre compte Google pour accéder à l'application
				</p>
			</div>

			{#if error}
				<div
					class="border-destructive/30 from-destructive/20 to-destructive/10 mb-6 rounded-xl border bg-gradient-to-r p-4"
				>
					<div class="flex items-start gap-3">
						<div class="text-xl">⚠️</div>
						<div>
							<p class="text-destructive mb-1 font-medium">Erreur de connexion</p>
							<p class="text-destructive-foreground text-sm">{error}</p>
						</div>
					</div>
				</div>
			{/if}

			<button
				on:click={handleGoogleSignIn}
				disabled={loading}
				class="bg-card text-card-foreground hover:bg-card/80 ring-border hover:ring-primary/50 group relative w-full overflow-hidden rounded-xl px-6 py-3 text-base font-medium ring-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<div class="flex items-center justify-center gap-3">
					{#if loading}
						<div class="animate-spin text-xl">⏳</div>
						<span>Connexion en cours...</span>
					{:else}
						<!-- Icône Google -->
						<svg class="h-5 w-5" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						<span>Se connecter avec Google</span>
					{/if}
				</div>
			</button>

			<div class="mt-6 text-center">
				<p class="text-muted-foreground text-xs">
					Seuls les utilisateurs autorisés peuvent accéder à cette application
				</p>
			</div>
		</div>

		<!-- Information supplémentaire -->
		<div class="mt-8 text-center">
			<p class="text-muted-foreground text-sm">
				Besoin d'un accès ? Contactez
				<a href="mailto:admin@croustimothy.com" class="text-primary hover:underline">
					admin@croustimothy.com
				</a>
			</p>
		</div>
	</div>
</div>
