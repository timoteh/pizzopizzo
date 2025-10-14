<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';

	export let requireAuth = true;

	let mounted = false;

	onMount(async () => {
		// Initialiser le store d'authentification
		await authStore.initialize();
		mounted = true;
	});

	// Réaction aux changements d'état d'authentification
	$: if (mounted && requireAuth) {
		if ($authStore.loading) {
			// En cours de chargement, ne rien faire
		} else if (!$authStore.user) {
			// Pas d'utilisateur connecté, rediriger vers login
			goto('/login');
		} else if (!$authStore.isAuthorized) {
			// Utilisateur connecté mais pas autorisé
			goto('/access-denied');
		}
	}
</script>

{#if $authStore.loading}
	<!-- Écran de chargement -->
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div class="text-center">
			<div class="mb-4 text-4xl animate-pulse">🍕</div>
			<h2 class="text-foreground mb-2 text-xl font-semibold">Chargement...</h2>
			<p class="text-muted-foreground">Vérification de vos autorisations</p>
		</div>
	</div>
{:else if !requireAuth || ($authStore.user && $authStore.isAuthorized)}
	<!-- Utilisateur autorisé ou protection désactivée -->
	<slot />
{:else}
	<!-- État de transition - ne devrait pas être visible longtemps -->
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div class="text-center">
			<div class="mb-4 text-4xl">🔄</div>
			<h2 class="text-foreground mb-2 text-xl font-semibold">Redirection...</h2>
		</div>
	</div>
{/if}
