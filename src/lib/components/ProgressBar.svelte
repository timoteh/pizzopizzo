<script lang="ts">
	import { reservationStore } from '$lib/stores/reservation';
</script>

<!-- BARRE DE PROGRESSION SIMPLE -->
<div class="mb-8 flex flex-col items-center gap-3">
	<div class="mb-2 text-center">
		<h3 class="text-card-foreground mb-1 text-lg font-semibold">Popularité de la semaine</h3>
		<p class="text-muted-foreground text-sm">
			Si le minimum n'est pas atteint, la semaine sera annulée et vous serez remboursé!
		</p>
	</div>
	<div class="bg-secondary relative h-3 w-full overflow-hidden rounded-full">
		<!-- Barre de progression simple -->
		<div
			class="from-chart-2 via-primary to-chart-1 absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r transition-all duration-500"
			style="width: {($reservationStore.totalReservations / $reservationStore.maxReservations) *
				100}%"
		></div>
		<!-- Marqueur seuil minimal -->
		<div
			class="bg-chart-2 absolute top-0 h-3 w-0.5 transition-all duration-500"
			style="left: {($reservationStore.minReservations / $reservationStore.maxReservations) * 100}%"
		></div>
	</div>
	<div class="flex w-full justify-between text-sm">
		<span class="text-chart-2 font-medium">
			{$reservationStore.totalReservations} pizza{$reservationStore.totalReservations > 1
				? 's'
				: ''} commandée{$reservationStore.totalReservations > 1 ? 's' : ''}
		</span>
		<div class="text-muted-foreground flex gap-4">
			<span>Min: {$reservationStore.minReservations}</span>
			<span>Max: {$reservationStore.maxReservations}</span>
		</div>
	</div>
</div>
