import AppSidebar from '../../../components/layout/AppSidebar.js';
import Card from '../../../components/ui/Card.js';

export default function TeamPage() {
	return (
		<div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
			<AppSidebar />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
					<h1 className="text-xl font-bold text-white">Team Members</h1>
				</header>
				<div className="flex-1 overflow-y-auto p-8">
					<Card className="flex flex-col items-center justify-center border-dashed p-16 text-center">
						<h2 className="mb-2 text-lg font-semibold text-white">Team management</h2>
						<p className="text-sm text-slate-500">Workspace team members will appear here.</p>
					</Card>
				</div>
			</main>
		</div>
	);
}
