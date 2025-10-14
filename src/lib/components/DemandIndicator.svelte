<script lang="ts">
	import { reservationStore } from '$lib/stores/reservation';
</script>

<!-- Indicateur de demande -->
<div class="border-border bg-card/50 rounded-2xl border p-6 backdrop-blur-xl">
	<div class="mb-4 flex items-center justify-between">
		<h4 class="text-card-foreground font-semibold">Demande</h4>
		<span class="text-primary text-sm font-semibold">
			{$reservationStore.totalReservations}/{$reservationStore.maxReservations}
		</span>
	</div>
	<div class="bg-muted h-3 overflow-hidden rounded-full">
		<div
			class="from-chart-2 via-primary to-chart-1 h-full rounded-full bg-gradient-to-r transition-all duration-500"
			style="width: {($reservationStore.totalReservations / $reservationStore.maxReservations) *
				100}%"
		></div>
	</div>
	<div class="text-muted-foreground mt-2 flex justify-between text-xs">
		<span>Min: {$reservationStore.minReservations}</span>
		<span>Max: {$reservationStore.maxReservations}</span>
	</div>
</div>
