import { URL } from 'url';

import { userScopes, groupScopes } from '../utils/constants';

/**
 * Returns the entire permission bit mask
 */
export const getAllUsersPermissions = (): number => (
	Array.from(userScopes.values()).reduce((previous, current) => (
		previous + current
	), 0)
);

/**
 * Returns the entire permission bit mask
 */
export const getAllGroupsPermissions = (): number => (
	Array.from(groupScopes.values()).reduce((previous, current) => (
		previous + current
	), 0)
);

/**
 * Returns the bit mask of the user permission by name
 */
export const getUsersPermissionsByName = (rawScope: string | string[]): number => {
	const scope = !Array.isArray(rawScope)
		? rawScope.split(/,\s{0,}/)
		: rawScope;

	let bitMask = 0;

	for (const name of scope) {
		if (userScopes.has(name)) {
			bitMask += userScopes.get(name);
		}
	}

	return bitMask;
};

/**
 * Returns the bit mask of the group permission by name
 */
export const getGroupsPermissionsByName = (rawScope: string | string[]): number => {
	const scope = !Array.isArray(rawScope)
		? rawScope.split(/,\s{0,}/)
		: rawScope;

	let bitMask = 0;

	for (const name of scope) {
		if (groupScopes.has(name)) {
			bitMask += groupScopes.get(name);
		}
	}

	return bitMask;
};

/**
 * Parse form
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseFormField = ($: any): { action: string; fields: Record<string, any> } => {
	const $form = $('form[action][method]');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const fields: Record<string, any> = {};

	for (const { name, value } of $form.serializeArray()) {
		fields[name] = value;
	}

	return {
		action: $form.attr('action'),
		fields
	};
};

/**
 * Returns full URL use Response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFullURL = (action: string, { url }: { url: string }): URL => {
	if (action.startsWith('https://')) {
		return new URL(action);
	}

	const { protocol, host } = new URL(url);

	return new URL(action, `${protocol}//${host}`);
};
