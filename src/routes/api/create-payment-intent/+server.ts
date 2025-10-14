import { json } from '@sveltejs/kit';
import { createPaymentIntent } from '$lib/stripe';

export async function POST({ request }) {
	try {
		const { amount } = await request.json();

		if (!amount || amount <= 0) {
			return json({ error: 'Montant invalide' }, { status: 400 });
		}

		const paymentIntent = await createPaymentIntent(amount);

		return json({
			clientSecret: paymentIntent.client_secret
		});
	} catch (error) {
		console.error('Erreur lors de la création du paiement:', error);
		return json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
	}
}
