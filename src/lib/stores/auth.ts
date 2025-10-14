import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
	isAuthorized: boolean;
}

const initialState: AuthState = {
	user: null,
	session: null,
	loading: true,
	isAuthorized: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		
		async initialize() {
			try {
				// Récupérer la session actuelle
				const { data: { session } } = await supabase.auth.getSession();
				
				if (session?.user) {
					const isAuthorized = await checkEmailWhitelist(session.user.email);
					set({
						user: session.user,
						session,
						loading: false,
						isAuthorized
					});
				} else {
					set({
						user: null,
						session: null,
						loading: false,
						isAuthorized: false
					});
				}

				// Écouter les changements d'authentification
				supabase.auth.onAuthStateChange(async (event, session) => {
					if (session?.user) {
						const isAuthorized = await checkEmailWhitelist(session.user.email);
						set({
							user: session.user,
							session,
							loading: false,
							isAuthorized
						});
					} else {
						set({
							user: null,
							session: null,
							loading: false,
							isAuthorized: false
						});
					}
				});
			} catch (error) {
				console.error('Erreur lors de l\'initialisation de l\'auth:', error);
				set({
					user: null,
					session: null,
					loading: false,
					isAuthorized: false
				});
			}
		},

		async signInWithGoogle() {
			try {
				const { error } = await supabase.auth.signInWithOAuth({
					provider: 'google',
					options: {
						redirectTo: `${window.location.origin}/auth/callback`
					}
				});
				
				if (error) {
					console.error('Erreur lors de la connexion Google:', error);
					return { success: false, error: error.message };
				}
				
				return { success: true };
			} catch (error) {
				console.error('Erreur lors de la connexion Google:', error);
				return { success: false, error: 'Erreur de connexion' };
			}
		},

		async signOut() {
			try {
				const { error } = await supabase.auth.signOut();
				if (error) {
					console.error('Erreur lors de la déconnexion:', error);
					return { success: false, error: error.message };
				}
				return { success: true };
			} catch (error) {
				console.error('Erreur lors de la déconnexion:', error);
				return { success: false, error: 'Erreur de déconnexion' };
			}
		}
	};
}

// Fonction pour vérifier si l'email est dans la whitelist
async function checkEmailWhitelist(email: string | undefined): Promise<boolean> {
	if (!email) return false;
	
	try {
		// Appel à notre API pour vérifier la whitelist
		const response = await fetch('/api/check-whitelist', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email })
		});
		
		const result = await response.json();
		return result.authorized || false;
	} catch (error) {
		console.error('Erreur lors de la vérification de la whitelist:', error);
		return false;
	}
}

export const authStore = createAuthStore();
