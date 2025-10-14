<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { reservationStore } from '$lib/stores/reservation';

	export let value: string;
	export let error: string | null = null;
	export let touched: boolean = false;
	export let icon: ComponentType;
	export let delay: number = 0;
	export let showFields: boolean = true;
	export let placeholder: string = 'Choisir votre créneau';

	const dispatch = createEventDispatcher();

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement;
		value = target.value;
		dispatch('change', value);
	}
</script>

<div
	class="relative transition-all duration-500"
	style="opacity: {showFields ? 1 : 0}; transform: translateY({showFields
		? 0
		: 20}px); transition-delay: {delay}ms;"
>
	<div class="relative">
		<svelte:component
			this={icon}
			class="text-primary absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2"
		/>
		<select
			{value}
			on:change={handleChange}
			class="bg-input text-foreground w-full rounded-xl py-3 pr-4 pl-12 text-base ring-2 {touched &&
			error
				? 'bg-destructive/5 ring-destructive/50'
				: 'ring-border hover:ring-primary/50 focus:ring-ring'} focus:bg-card cursor-pointer appearance-none shadow-lg transition-all duration-200 focus:outline-none"
		>
			<option value="" disabled selected>{placeholder}</option>
			{#each $reservationStore.timeSlots as slot}
				<option value={slot.id} disabled={!slot.available} class="bg-input text-foreground">
					{slot.time}
					{slot.available ? '- Disponible' : '- Complet'}
				</option>
			{/each}
		</select>
		{#if value}
			<div class="text-chart-2 absolute top-1/2 right-3 -translate-y-1/2">✓</div>
		{/if}
		<!-- Flèche personnalisée pour le select -->
		<div class="text-primary pointer-events-none absolute top-1/2 right-8 -translate-y-1/2">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
				></path>
			</svg>
		</div>
	</div>
	{#if touched && error}
		<p class="text-destructive mt-2 text-sm">{error}</p>
	{/if}
</div>
