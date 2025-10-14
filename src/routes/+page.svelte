<script lang="ts">
	import HeroSection from '$lib/components/HeroSection.svelte';
	import ReservationForm from '$lib/components/ReservationForm.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const PIZZA_PRICE = 20; // CAD PRICE
</script>

<HeroSection />
<ReservationForm {PIZZA_PRICE} />
<Footer />

<style>
	:global(body) {
		background-color: #0f172a;
	}
</style>
