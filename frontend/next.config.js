import path from 'node:path';

const projectRoot = path.resolve('.');

const nextConfig = {
	reactStrictMode: true,
	webpack(config) {
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'@': projectRoot
		};
		return config;
	},
	turbopack: {
		resolveAlias: {
			'@': projectRoot
		}
	}
};

export default nextConfig;
