<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import AuthGuard from '$lib/components/AuthGuard.svelte';

	let { children } = $props();

	// Pages qui ne nécessitent pas d'authentification
	const publicRoutes = ['/login', '/auth/callback', '/access-denied'];
	const requireAuth = $derived(!publicRoutes.includes($page.route.id || ''));
</script>

<svelte:head>
	<title>Croustimothy - Pizza artisanale</title>
</svelte:head>

<AuthGuard {requireAuth}>
	{@render children()}
</AuthGuard>
