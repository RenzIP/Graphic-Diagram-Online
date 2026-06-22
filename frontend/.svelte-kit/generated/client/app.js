export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17')
];

export const server_loads = [];

export const dictionary = {
		"/": [4],
		"/auth/callback": [16],
		"/(app)/dashboard": [5,[2]],
		"/demo": [~17],
		"/(app)/editor/[id]": [6,[2]],
		"/(auth)/login": [14,[3]],
		"/(auth)/register": [15,[3]],
		"/(app)/settings": [7,[2]],
		"/(app)/team": [8,[2]],
		"/(app)/workspace/[id]": [9,[2]],
		"/(app)/workspace/[id]/projects/create": [10,[2]],
		"/(app)/workspace/[id]/projects/delete/[projectId]": [11,[2]],
		"/(app)/workspace/[id]/projects/edit/[projectId]": [12,[2]],
		"/(app)/workspace/[id]/projects/[projectId]": [13,[2]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';