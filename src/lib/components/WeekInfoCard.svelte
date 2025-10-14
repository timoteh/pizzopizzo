<script lang="ts">
	import { reservationStore } from '$lib/stores/reservation';
	import { formatWeekRange, formatDeliveryDay } from '$lib/utils/date';

	export let PIZZA_PRICE: number;
</script>

<!-- Planning de la semaine -->
<div class="border-border bg-card/50 rounded-2xl border p-6 backdrop-blur-xl">
	<h3 class="text-card-foreground mb-4 text-lg font-semibold">Cette semaine</h3>

	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-muted-foreground text-sm">Période de commande</p>
				<p class="text-card-foreground font-medium">
					{formatWeekRange(
						$reservationStore.weekInfo.startDate,
						$reservationStore.weekInfo.endDate
					)}
				</p>
			</div>
			<div class="text-chart-3">
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5"
					/>
				</svg>
			</div>
		</div>

		<div class="flex items-center justify-between">
			<div>
				<p class="text-muted-foreground text-sm">Retrait sur place</p>
				<p class="text-card-foreground font-medium">
					{formatDeliveryDay($reservationStore.weekInfo.deliveryDay)}
				</p>
			</div>
			<div class="text-chart-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-5 w-5"
					><path d="M12.127 22H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.125" /><path
						d="M14.62 18.8A2.25 2.25 0 1 1 18 15.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"
					/><path d="M16 2v4" /><path d="M3 10h18" /><path d="M8 2v4" /></svg
				>
			</div>
		</div>

		<div class="flex items-center justify-between">
			<div>
				<p class="text-muted-foreground text-sm">Prix par pizza</p>
				<p class="text-primary text-lg font-bold">{PIZZA_PRICE}$ CAD</p>
			</div>
			<div class="text-chart-3">
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
		</div>
	</div>
</div>
