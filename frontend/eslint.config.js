import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
	...nextVitals,
	{
		rules: {
			'react-hooks/immutability': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'@next/next/no-html-link-for-pages': 'off',
			'react/no-unescaped-entities': 'off'
		}
	},
	globalIgnores(['.next/**', 'node_modules/**', 'out/**'])
]);
