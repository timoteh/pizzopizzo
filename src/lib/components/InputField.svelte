<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let type: string = 'text';
	export let placeholder: string;
	export let value: string;
	export let error: string | null = null;
	export let touched: boolean = false;
	export let icon: ComponentType;
	export let delay: number = 0;
	export let showFields: boolean = true;

	const dispatch = createEventDispatcher();

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		value = target.value;
		dispatch('input', value);
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
		<input
			{type}
			{placeholder}
			{value}
			on:input={handleInput}
			class="bg-input text-foreground placeholder-muted-foreground w-full rounded-xl py-3 pr-4 pl-12 text-base ring-2 {touched &&
			error
				? 'bg-destructive/5 ring-destructive/50'
				: 'ring-border hover:ring-primary/50 focus:ring-ring'} focus:bg-card shadow-lg transition-all duration-200 focus:outline-none"
		/>
		{#if value && !error}
			<div class="text-chart-2 absolute top-1/2 right-3 -translate-y-1/2">✓</div>
		{/if}
	</div>
	{#if touched && error}
		<p class="text-destructive mt-2 text-sm">{error}</p>
	{/if}
</div>
