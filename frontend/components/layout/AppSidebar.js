'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Avatar from '../ui/Avatar.js';
import Button from '../ui/Button.js';
import { workspacesApi } from '../../lib/api/workspaces.js';
import { currentUserStore, logout } from '../../lib/stores/auth.js';
import { useStore } from '../../hooks/useStore.js';

export default function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const user = useStore(useMemo(() => currentUserStore(), []));
	const [workspaces, setWorkspaces] = useState([]);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const wsColors = ['indigo', 'orange', 'emerald', 'pink', 'cyan', 'amber'];

	const initials = user?.full_name
		? user.full_name
				.split(' ')
				.map((name) => name[0])
				.join('')
				.toUpperCase()
				.slice(0, 2)
		: (user?.email?.slice(0, 2).toUpperCase() ?? '??');

	useEffect(() => {
		workspacesApi
			.list({ per_page: 50 })
			.then((res) => setWorkspaces(res.data ?? []))
			.catch(() => setWorkspaces([]));
	}, []);

	useEffect(() => {
		const close = () => setShowUserMenu(false);
		window.addEventListener('click', close);
		return () => window.removeEventListener('click', close);
	}, []);

	async function handleLogout() {
		await logout();
		router.push('/login');
	}

	return (
		<aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900">
			<div className="flex h-16 items-center border-b border-slate-800 px-6">
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
						<svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
					</div>
					<span className="text-lg font-bold tracking-tight text-white">GraDiOl</span>
				</div>
			</div>

			<div className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
				<div>
					<h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">Platform</h3>
					<div className="space-y-1">
						<Button variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start" href="/dashboard">Dashboard</Button>
						<Button variant={pathname.startsWith('/team') ? 'secondary' : 'ghost'} className="w-full justify-start" href="/team">Team Members</Button>
						<Button variant={pathname.startsWith('/settings') ? 'secondary' : 'ghost'} className="w-full justify-start" href="/settings">Settings</Button>
					</div>
				</div>

				<div>
					<div className="mb-2 flex items-center justify-between px-3">
						<h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Workspaces</h3>
						<a href="/dashboard" className="text-slate-500 transition-colors hover:text-white" aria-label="Create Workspace">+</a>
					</div>
					<div className="space-y-1">
						{workspaces.length === 0 ? (
							<p className="px-3 text-xs text-slate-600">No workspaces yet</p>
						) : (
							workspaces.map((ws, i) => (
								<Button key={ws.id} variant={pathname === `/workspace/${ws.id}` ? 'secondary' : 'ghost'} className="w-full justify-start pl-3 text-sm" href={`/workspace/${ws.id}`}>
									<span className={`mr-3 h-2 w-2 shrink-0 rounded-full bg-${wsColors[i % wsColors.length]}-500`}></span>
									<span className="truncate">{ws.name}</span>
								</Button>
							))
						)}
					</div>
				</div>
			</div>

			<div className="border-t border-slate-800 p-4">
				<div className="relative">
					<button className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800" onClick={(e) => { e.stopPropagation(); setShowUserMenu((v) => !v); }}>
						<Avatar size="sm" initials={initials} />
						<div className="min-w-0 flex-1 text-left">
							<div className="truncate text-sm font-medium text-white">{user?.full_name || 'User'}</div>
							<div className="truncate text-xs text-slate-500">{user?.email || ''}</div>
						</div>
					</button>
					{showUserMenu ? (
						<div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl" onClick={(e) => e.stopPropagation()}>
							<a href="/settings" className="block px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">Settings</a>
							<hr className="my-1 border-slate-700" />
							<button className="block w-full px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-slate-700 hover:text-red-300" onClick={handleLogout}>Sign out</button>
						</div>
					) : null}
				</div>
			</div>
		</aside>
	);
}
