<script lang="ts">
	import { ADMIN_EMAIL } from '$env/static/private';
	import { Pizza, LogOut } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import WeekInfoCard from './WeekInfoCard.svelte';
	import DemandIndicator from './DemandIndicator.svelte';

	const PIZZA_PRICE = 20; // Prix en CAD

	// Vérifier si l'utilisateur actuel est admin
	$: isAdmin = $authStore.user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

	async function handleSignOut() {
		const result = await authStore.signOut();
		if (result.success) {
			goto('/login');
		}
	}
</script>

<!-- HERO SECTION -->
<section class="bg-background text-foreground relative overflow-hidden">
	<!-- Background moderne avec pattern géométrique -->
	<div class="absolute inset-0">
		<!-- Gradient de base -->
		<div class="from-background via-card to-background absolute inset-0 bg-gradient-to-br"></div>
		<!-- Pattern géométrique subtil -->
		<div
			class="absolute inset-0 opacity-[0.02]"
			style="background-image: url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<!-- Éclairage ambiant -->
		<div
			class="bg-primary/5 absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl"
		></div>
	</div>

	<!-- Navigation/Header -->
	<nav class="relative z-20 flex items-center justify-between px-6 py-6 lg:px-8">
		<div class="flex items-center gap-3">
			<div
				class="border-primary/20 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl border"
			>
				<Pizza class="text-primary h-6 w-6" />
			</div>
			<span class="text-foreground text-xl font-bold">Croustimothy</span>
		</div>
		<div class="hidden items-center gap-6 sm:flex">
			<a href="#reservation" class="text-muted-foreground hover:text-foreground transition-colors"
				>Réserver</a
			>
			<a
				href="mailto:admin@croustimothy.com"
				class="text-muted-foreground hover:text-foreground transition-colors">Contact</a
			>
			{#if isAdmin}
				<a href="/admin" class="text-muted-foreground hover:text-foreground transition-colors"
					>Admin</a
				>
			{/if}
			<button
				on:click={handleSignOut}
				class="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
				title="Se déconnecter"
			>
				<LogOut class="h-4 w-4" />
				<span class="hidden lg:inline">Déconnexion</span>
			</button>
		</div>
	</nav>

	<!-- Contenu principal -->
	<div class="relative z-10 mx-auto px-6 pt-8 pb-16 lg:px-8 lg:pt-12 lg:pb-20">
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-16">
			<!-- Colonne gauche - Contenu principal -->
			<div class="lg:col-span-7">
				<!-- Badge de statut -->
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 ring-1 ring-green-200"
				>
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					Commandes ouvertes
				</div>

				<!-- Titre principal -->
				<h1 class="text-foreground mb-6 text-4xl font-bold tracking-tight lg:text-5xl">
					Croustimothy
					<span
						class="text-muted-foreground mt-2 block text-xl font-light tracking-wide lg:text-2xl"
					>
						Pizza artisanale premium
					</span>
				</h1>

				<!-- Description -->
				<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
					Chaque pizza est préparée à la main avec des ingrédients soigneusement sélectionnés.
					<span class="text-foreground font-medium">Une expérience culinaire authentique</span>
				</p>

				<!-- CTA principal -->
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
					<a
						href="#reservation"
						class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring focus:ring-offset-background inline-flex items-center justify-center rounded-xl px-8 py-3 text-lg font-semibold shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
					>
						Réserver maintenant
						<svg
							class="ml-2 h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
							/>
						</svg>
					</a>
					<a
						href="mailto:admin@croustimothy.com"
						class="border-border bg-card/50 text-card-foreground hover:border-border/80 hover:bg-card/80 hover:text-foreground inline-flex items-center justify-center rounded-xl border px-8 py-3 text-lg font-medium"
					>
						Contact
					</a>
				</div>
			</div>

			<!-- Colonne droite - Informations -->
			<div class="space-y-6 lg:col-span-5">
				<WeekInfoCard {PIZZA_PRICE} />
				<DemandIndicator />
			</div>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2">
		<div class="flex flex-col items-center gap-3">
			<div class="from-muted-foreground h-8 w-px bg-gradient-to-b to-transparent"></div>
		</div>
	</div>
</section>
