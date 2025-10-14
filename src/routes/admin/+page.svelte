<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Trash2, Mail, Shield, ArrowLeft, Pizza, LogOut } from 'lucide-svelte';
	import { authStore } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { ADMIN_EMAIL } from '$env/static/private';

	interface WhitelistEntry {
		id: number;
		email: string;
		created_at: string;
		active: boolean;
	}

	let emails: WhitelistEntry[] = [];
	let newEmail = '';
	let loading = false;
	let error = '';
	let success = '';

	// Vérifier si l'utilisateur actuel est admin
	$: isAdmin = $authStore.user?.email?.toLowerCase().trim() === ADMIN_EMAIL;

	async function handleSignOut() {
		const result = await authStore.signOut();
		if (result.success) {
			goto('/login');
		}
	}

	onMount(() => {
		if (isAdmin) {
			loadEmails();
		}
	});

	async function loadEmails() {
		try {
			const { data, error: fetchError } = await supabase
				.from('email_whitelist')
				.select('*')
				.order('created_at', { ascending: false });

			if (fetchError) {
				console.error('Erreur Supabase:', fetchError);
				throw fetchError;
			}

			emails = data || [];
		} catch (err) {
			error =
				'Erreur lors du chargement des emails. Vérifiez que la table existe et que vous êtes connecté.';
			console.error('Erreur complète:', err);
		}
	}

	async function addEmail() {
		if (!newEmail.trim()) return;

		loading = true;
		error = '';
		success = '';

		try {
			const { error: insertError } = await supabase
				.from('email_whitelist')
				.insert([{ email: newEmail.toLowerCase().trim() }]);

			if (insertError) {
				console.error("Erreur Supabase lors de l'insertion:", insertError);

				if (insertError.code === '23505') {
					error = 'Cet email est déjà dans la liste';
				} else if (insertError.code === '42P01') {
					error = "La table email_whitelist n'existe pas. Veuillez exécuter la migration.";
				} else if (insertError.code === '42501' || insertError.message?.includes('policy')) {
					error = 'Permissions insuffisantes. Vérifiez que vous êtes connecté et autorisé.';
				} else {
					error = `Erreur lors de l'ajout: ${insertError.message}`;
				}
				return;
			}

			success = 'Email ajouté avec succès';
			newEmail = '';
			await loadEmails();
		} catch (err: any) {
			console.error("Erreur lors de l'ajout:", err);
			error = "Erreur lors de l'ajout de l'email";
		} finally {
			loading = false;
		}
	}

	async function toggleEmail(id: number, currentActive: boolean) {
		try {
			const { error: updateError } = await supabase
				.from('email_whitelist')
				.update({ active: !currentActive })
				.eq('id', id);

			if (updateError) {
				console.error('Erreur Supabase lors de la mise à jour:', updateError);
				error = `Erreur lors de la modification: ${updateError.message}`;
				return;
			}

			await loadEmails();
			success = currentActive ? 'Email désactivé' : 'Email activé';
		} catch (err) {
			error = 'Erreur lors de la modification';
			console.error(err);
		}
	}

	async function deleteEmail(id: number, email: string) {
		if (!confirm('Êtes-vous sûr de vouloir supprimer cet email ?')) return;

		try {
			const { error: deleteError } = await supabase.from('email_whitelist').delete().eq('id', id);

			if (deleteError) {
				console.error('Erreur Supabase lors de la suppression:', deleteError);
				error = `Erreur lors de la suppression: ${deleteError.message}`;
				return;
			}

			await loadEmails();
			success = 'Email supprimé avec succès';
		} catch (err) {
			error = 'Erreur lors de la suppression';
			console.error(err);
		}
	}
</script>

<svelte:head>
	<title>Administration - Croustimothy</title>
</svelte:head>

{#if !isAdmin}
	<div class="bg-background flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="mb-4 text-6xl">🚫</div>
			<h2 class="text-destructive mb-2 text-2xl font-bold">Accès refusé</h2>
			<p class="text-muted-foreground">Vous n'avez pas les permissions d'administrateur</p>
		</div>
	</div>
{:else}
	<div class="bg-background min-h-screen">
		<!-- Navigation -->
		<nav class="border-border bg-card/50 border-b px-6 py-4 backdrop-blur-sm">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<div class="flex items-center gap-6">
					<a
						href="/"
						class="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
					>
						<ArrowLeft class="h-4 w-4" />
						<span>Retour à l'app</span>
					</a>
					<div class="flex items-center gap-3">
						<div
							class="border-primary/20 bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg border"
						>
							<Pizza class="text-primary h-4 w-4" />
						</div>
						<span class="text-foreground font-semibold">Croustimothy Admin</span>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<span class="text-muted-foreground text-sm">
						Connecté en tant que <span class="text-foreground font-medium"
							>{$authStore.user?.email}</span
						>
					</span>
					<button
						on:click={handleSignOut}
						class="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
						title="Se déconnecter"
					>
						<LogOut class="h-4 w-4" />
						<span class="hidden sm:inline">Déconnexion</span>
					</button>
				</div>
			</div>
		</nav>

		<div class="mx-auto max-w-4xl p-6">
			<!-- En-tête -->
			<div class="mb-8">
				<div class="mb-4 flex items-center gap-3">
					<Shield class="text-primary h-8 w-8" />
					<h1 class="text-foreground text-3xl font-bold">Administration</h1>
				</div>
				<p class="text-muted-foreground">Gestion de la whitelist des emails autorisés</p>
			</div>

			<!-- Messages -->
			{#if error}
				<div
					class="border-destructive/30 from-destructive/20 to-destructive/10 mb-6 rounded-xl border bg-gradient-to-r p-4"
				>
					<p class="text-destructive font-medium">{error}</p>
				</div>
			{/if}

			{#if success}
				<div
					class="border-chart-2/30 from-chart-2/20 to-chart-3/20 mb-6 rounded-xl border bg-gradient-to-r p-4"
				>
					<p class="text-chart-2 font-medium">{success}</p>
				</div>
			{/if}

			<!-- Formulaire d'ajout -->
			<div
				class="from-card/80 to-popover/60 ring-border mb-8 rounded-2xl bg-gradient-to-br p-6 shadow-lg ring-1"
			>
				<h2 class="text-card-foreground mb-4 text-xl font-semibold">Ajouter un email</h2>
				<div class="flex gap-3">
					<div class="relative flex-1">
						<Mail class="text-primary absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
						<input
							type="email"
							placeholder="email@exemple.com"
							bind:value={newEmail}
							on:keydown={(e) => e.key === 'Enter' && addEmail()}
							class="bg-input text-foreground placeholder-muted-foreground ring-border hover:ring-primary/50 focus:ring-ring focus:bg-card w-full rounded-xl py-3 pr-4 pl-12 text-base shadow-lg ring-2 transition-all duration-200 focus:outline-none"
						/>
					</div>
					<button
						on:click={addEmail}
						disabled={loading || !newEmail.trim()}
						class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Plus class="h-4 w-4" />
						Ajouter
					</button>
				</div>
			</div>

			<!-- Liste des emails -->
			<div
				class="from-card/80 to-popover/60 ring-border rounded-2xl bg-gradient-to-br p-6 shadow-lg ring-1"
			>
				<h2 class="text-card-foreground mb-4 text-xl font-semibold">
					Emails autorisés ({emails.length})
				</h2>

				{#if emails.length === 0}
					<p class="text-muted-foreground py-8 text-center">Aucun email dans la whitelist</p>
				{:else}
					<div class="space-y-3">
						{#each emails as email (email.id)}
							<div class="bg-background/50 flex items-center justify-between rounded-lg p-4">
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full {email.active
											? 'bg-chart-2/20 text-chart-2'
											: 'bg-muted text-muted-foreground'}"
									>
										<Mail class="h-4 w-4" />
									</div>
									<div>
										<p class="text-foreground font-medium {!email.active ? 'opacity-50' : ''}">
											{email.email}
										</p>
										<p class="text-muted-foreground text-sm">
											Ajouté le {new Date(email.created_at).toLocaleDateString('fr-FR')}
											{#if !email.active}
												<span class="text-destructive ml-2">(Désactivé)</span>
											{/if}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<button
										on:click={() => toggleEmail(email.id, email.active)}
										class="text-muted-foreground hover:text-foreground rounded-lg p-2 transition-colors"
										title={email.active ? 'Désactiver' : 'Activer'}
									>
										{email.active ? '🔓' : '🔒'}
									</button>
									<button
										on:click={() => deleteEmail(email.id, email.email)}
										class="text-destructive hover:text-destructive/80 rounded-lg p-2 transition-colors"
										title="Supprimer"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
