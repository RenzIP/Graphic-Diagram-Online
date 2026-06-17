import './globals.css';
import AuthInit from '../components/layout/AuthInit.js';

export const metadata = {
	title: 'GraDiOl',
	description: 'Graphic Diagram Online',
	icons: {
		icon: '/favicon.svg'
	}
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<AuthInit />
				{children}
			</body>
		</html>
	);
}
