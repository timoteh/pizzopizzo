import { writable } from 'svelte/store';

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	timeSlot: string;
}

interface FormErrors {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	timeSlot?: string;
}

interface FormState {
	data: FormData;
	errors: FormErrors;
	isValid: boolean;
	isSubmitting: boolean;
	touched: {
		firstName: boolean;
		lastName: boolean;
		email: boolean;
		phone: boolean;
		timeSlot: boolean;
	};
}

const initialFormData: FormData = {
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	timeSlot: ''
};

const initialFormState: FormState = {
	data: initialFormData,
	errors: {},
	isValid: false,
	isSubmitting: false,
	touched: {
		firstName: false,
		lastName: false,
		email: false,
		phone: false,
		timeSlot: false
	}
};

function validateField(field: keyof FormData, value: string): string | undefined {
	switch (field) {
		case 'firstName':
		case 'lastName':
			if (!value) return 'Ce champ est requis';
			if (value.length < 2) return 'Minimum 2 caractères';
			if (value.length > 50) return 'Maximum 50 caractères';
			break;
		case 'email':
			if (!value) return 'Ce champ est requis';
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email invalide';
			break;
		case 'phone':
			if (!value) return 'Ce champ est requis';
			if (!/^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/.test(value)) {
				return 'Format de téléphone invalide (ex: (XXX) XXX-XXXX)';
			}
			break;
		case 'timeSlot':
			if (!value) return 'Veuillez sélectionner un créneau';
			break;
	}
	return undefined;
}

function validateForm(data: FormData, touched: FormState['touched']): FormErrors {
	const errors: FormErrors = {};
	let hasErrors = false;

	Object.keys(data).forEach((key) => {
		const field = key as keyof FormData;
		if (touched[field]) {
			const error = validateField(field, data[field]);
			if (error) {
				errors[field] = error;
				hasErrors = true;
			}
		}
	});

	return errors;
}

function validateAllFields(data: FormData): { errors: FormErrors; isValid: boolean } {
	const errors: FormErrors = {};
	let hasErrors = false;

	Object.keys(data).forEach((key) => {
		const field = key as keyof FormData;
		const error = validateField(field, data[field]);
		if (error) {
			errors[field] = error;
			hasErrors = true;
		}
	});

	return { errors, isValid: !hasErrors };
}

function createFormStore() {
	const { subscribe, set, update } = writable<FormState>(initialFormState);

	return {
		subscribe,
		updateField: (field: keyof FormData, value: string) => {
			update((state) => {
				const newData = { ...state.data, [field]: value };
				const newTouched = { ...state.touched, [field]: true };
				const errors = validateForm(newData, newTouched);
				// Pour isValid, on vérifie que tous les champs sont valides
				const allFieldsValidation = validateAllFields(newData);
				const isValid = allFieldsValidation.isValid;

				return {
					...state,
					data: newData,
					errors,
					isValid,
					touched: newTouched
				};
			});
		},
		setSubmitting: (isSubmitting: boolean) => {
			update((state) => ({ ...state, isSubmitting }));
		},
		validateAllFields: () => {
			update((state) => {
				const allFieldsValidation = validateAllFields(state.data);
				const allTouched = {
					firstName: true,
					lastName: true,
					email: true,
					phone: true,
					timeSlot: true
				};

				return {
					...state,
					errors: allFieldsValidation.errors,
					isValid: allFieldsValidation.isValid,
					touched: allTouched
				};
			});
		},
		reset: () => set(initialFormState)
	};
}

export const formStore = createFormStore();
