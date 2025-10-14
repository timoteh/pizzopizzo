<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	onMount(async () => {
		try {
			// Gérer le callback d'authentification
			const { data, error } = await supabase.auth.getSession();

			if (error) {
				console.error('Erreur lors du callback:', error);
				goto('/login?error=auth_failed');
				return;
			}

			if (data.session) {
				// Rediriger vers la page principale
				goto('/');
			} else {
				// Pas de session, rediriger vers login
				goto('/login');
			}
		} catch (error) {
			console.error('Erreur lors du callback:', error);
			goto('/login?error=callback_failed');
		}
	});
</script>

<div class="bg-background flex min-h-screen items-center justify-center">
	<div class="text-center">
		<div class="mb-4 text-4xl">🔄</div>
		<h2 class="text-foreground mb-2 text-xl font-semibold">Connexion en cours...</h2>
		<p class="text-muted-foreground">Veuillez patienter pendant que nous vous connectons.</p>
	</div>
</div>
