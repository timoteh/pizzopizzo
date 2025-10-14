import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import type { RequestHandler } from './$types';
import { ADMIN_EMAIL } from '$env/static/private';

// Vérifier si l'utilisateur est admin
function isAdmin(email: string | undefined): boolean {
	return email?.toLowerCase().trim() === ADMIN_EMAIL;
}

// GET - Récupérer tous les emails
export const GET: RequestHandler = async ({ request }) => {
	try {
		// Vérifier l'authentification (vous devrez adapter selon votre système d'auth)
		const authHeader = request.headers.get('authorization');
		// Pour l'instant, on fait confiance au frontend (à améliorer en production)

		// Essayer d'abord avec la base de données
		try {
			const { data, error } = await supabase
				.from('email_whitelist')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			return json({
				success: true,
				emails: data,
				source: 'database'
			});
		} catch (dbError) {
			console.warn('DB non disponible, utilisation du fallback:', dbError);

			return json({
				success: true,
				emails: [],
				source: 'fallback'
			});
		}
	} catch (error) {
		console.error('Erreur lors de la récupération des emails:', error);
		return json({ success: false, error: 'Erreur serveur' }, { status: 500 });
	}
};

// POST - Ajouter un email
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, adminEmail } = await request.json();

		if (!isAdmin(adminEmail)) {
			return json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
		}

		if (!email || typeof email !== 'string') {
			return json({ success: false, error: 'Email invalide' }, { status: 400 });
		}

		const normalizedEmail = email.toLowerCase().trim();

		// Essayer d'abord avec la base de données
		try {
			const { error: insertError } = await supabase
				.from('email_whitelist')
				.insert([{ email: normalizedEmail }]);

			if (insertError) {
				if (insertError.code === '23505') {
					return json(
						{ success: false, error: 'Cet email est déjà dans la liste' },
						{ status: 400 }
					);
				}
				throw insertError;
			}

			return json({
				success: true,
				message: 'Email ajouté avec succès',
				source: 'database'
			});
		} catch (dbError) {
			console.warn('DB non disponible, utilisation du fallback:', dbError);

			return json({
				success: true,
				message: "Erreur lors de l'ajout de l'email",
				source: 'fallback'
			});
		}
	} catch (error) {
		console.error("Erreur lors de l'ajout de l'email:", error);
		return json({ success: false, error: 'Erreur serveur' }, { status: 500 });
	}
};

// DELETE - Supprimer un email
export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { id, email, adminEmail } = await request.json();

		if (!isAdmin(adminEmail)) {
			return json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
		}

		// Essayer d'abord avec la base de données
		try {
			const { error: deleteError } = await supabase.from('email_whitelist').delete().eq('id', id);

			if (deleteError) throw deleteError;

			return json({
				success: true,
				message: 'Email supprimé avec succès',
				source: 'database'
			});
		} catch (dbError) {
			console.warn('DB non disponible, utilisation du fallback:', dbError);

			return json({
				success: true,
				message: "Erreur lors de la suppression de l'email",
				source: 'fallback'
			});
		}
	} catch (error) {
		console.error("Erreur lors de la suppression de l'email:", error);
		return json({ success: false, error: 'Erreur serveur' }, { status: 500 });
	}
};

// PUT - Modifier un email (activer/désactiver)
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const { id, active, adminEmail } = await request.json();

		if (!isAdmin(adminEmail)) {
			return json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
		}

		// Essayer d'abord avec la base de données
		try {
			const { error: updateError } = await supabase
				.from('email_whitelist')
				.update({ active })
				.eq('id', id);

			if (updateError) throw updateError;

			return json({
				success: true,
				message: active ? 'Email activé' : 'Email désactivé',
				source: 'database'
			});
		} catch (dbError) {
			console.warn('DB non disponible, modification non supportée en fallback:', dbError);

			return json(
				{
					success: false,
					error: 'Modification non supportée sans base de données'
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Erreur lors de la modification de l'email:", error);
		return json({ success: false, error: 'Erreur serveur' }, { status: 500 });
	}
};
