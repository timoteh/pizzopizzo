<script lang="ts">
	import { Pizza, LogOut } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	async function handleSignOut() {
		const result = await authStore.signOut();
		if (result.success) {
			goto('/login');
		}
	}
</script>

<svelte:head>
	<title>Accès refusé - Croustimothy</title>
</svelte:head>

<div class="bg-background text-foreground relative min-h-screen overflow-hidden py-12">
	<!-- Background moderne -->
	<div class="absolute inset-0">
		<div class="from-background via-card to-background absolute inset-0 bg-gradient-to-br"></div>
		<div
			class="absolute inset-0 opacity-[0.02]"
			style="background-image: url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div
			class="bg-destructive/5 absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
		></div>
	</div>

	<div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
		<!-- Logo et titre -->
		<div class="mb-8 text-center">
			<div class="mb-6 flex justify-center">
				<div
					class="border-destructive/20 bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-2xl border"
				>
					<Pizza class="text-destructive h-8 w-8" />
				</div>
			</div>
			<h1 class="text-foreground mb-2 text-3xl font-bold">Croustimothy</h1>
			<p class="text-muted-foreground text-lg">Pizza artisanale premium</p>
		</div>

		<!-- Carte d'accès refusé -->
		<div
			class="from-card/80 to-popover/60 ring-destructive/20 w-full max-w-md rounded-2xl bg-gradient-to-br p-8 shadow-xl ring-1 backdrop-blur-lg"
		>
			<div class="mb-6 text-center">
				<div class="mb-4 text-6xl">🚫</div>
				<h2 class="text-destructive mb-2 text-2xl font-bold">Accès refusé</h2>
				<p class="text-muted-foreground text-sm">
					Votre compte n'est pas autorisé à accéder à cette application
				</p>
			</div>

			<div
				class="border-destructive/30 from-destructive/20 to-destructive/10 mb-6 rounded-xl border bg-gradient-to-r p-4"
			>
				<div class="text-center">
					<p class="text-destructive mb-2 font-medium">Compte non autorisé</p>
					<p class="text-destructive-foreground text-sm">
						Cette application est réservée à un groupe restreint d'utilisateurs. Si vous pensez
						qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
					</p>
				</div>
			</div>

			<div class="space-y-3">
				<button
					on:click={handleSignOut}
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-medium transition-all duration-200"
				>
					<LogOut class="h-4 w-4" />
					Se déconnecter
				</button>

				<a
					href="mailto:admin@croustimothy.com?subject=Demande d'accès - Croustimothy"
					class="border-border bg-card/50 text-card-foreground hover:bg-card/80 flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-base font-medium transition-all duration-200"
				>
					📧 Demander l'accès
				</a>
			</div>
		</div>

		<!-- Information de contact -->
		<div class="mt-8 text-center">
			<p class="text-muted-foreground text-sm">
				Pour obtenir l'accès à cette application, contactez
				<a href="mailto:admin@croustimothy.com" class="text-primary hover:underline">
					admin@croustimothy.com
				</a>
			</p>
		</div>
	</div>
</div>
