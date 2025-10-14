import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email || typeof email !== 'string') {
			return json({ authorized: false, error: 'Email invalide' }, { status: 400 });
		}

		const normalizedEmail = email.toLowerCase().trim();

		try {
			const { data, error } = await supabase
				.from('email_whitelist')
				.select('email')
				.eq('email', normalizedEmail)
				.eq('active', true)
				.single();

			if (error && error.code !== 'PGRST116') {
				console.warn('Erreur DB whitelist, utilisation du fallback:', error);

				return json({
					authorized: false,
					message: 'Accès refusé'
				});
			}

			const authorized = !!data;
			return json({
				authorized,
				message: authorized ? 'Accès autorisé' : 'Accès refusé'
			});
		} catch (dbError) {
			console.warn('Erreur de connexion DB, utilisation du fallback:', dbError);

			return json({
				authorized: false,
				message: 'Accès refusé (fallback)'
			});
		}
	} catch (error) {
		console.error('Erreur lors de la vérification de la whitelist:', error);
		return json({ authorized: false, error: 'Erreur serveur' }, { status: 500 });
	}
};
