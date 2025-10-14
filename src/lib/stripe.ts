import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Initialiser le client Stripe côté serveur
export const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
	apiVersion: '2023-10-16'
});

// Initialiser le client Stripe côté client
export const getStripe = () => {
	const stripePromise = loadStripe(import.meta.env.VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
	return stripePromise;
};

// Types pour les paiements
export interface PaymentIntent {
	id: string;
	amount: number;
	status: string;
	client_secret: string;
}
// Fonction pour créer une intention de paiement
export async function createPaymentIntent(amount: number): Promise<PaymentIntent> {
	const paymentIntent = await stripe.paymentIntents.create({
		amount: amount * 100, // Stripe utilise les centimes
		currency: 'cad',
		automatic_payment_methods: {
			enabled: true
		}
	});

	return {
		id: paymentIntent.id,
		amount: paymentIntent.amount,
		status: paymentIntent.status,
		client_secret: paymentIntent.client_secret || ''
	};
}
