'use client';

import { useState } from 'react';
import AppSidebar from '../../../components/layout/AppSidebar.js';
import Button from '../../../components/ui/Button.js';
import Card from '../../../components/ui/Card.js';

export default function SettingsPage() {
	const [isSaving, setIsSaving] = useState(false);
	const [settings, setSettings] = useState({
		theme: 'dark',
		notifications: true,
		autoSave: true,
		gridSize: 20
	});

	function saveSettings() {
		setIsSaving(true);
		setTimeout(() => setIsSaving(false), 800);
	}

	return (
		<div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
			<AppSidebar />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
					<h1 className="text-xl font-bold text-white">Settings</h1>
					<Button variant="primary" size="sm" onClick={saveSettings} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
				</header>
				<div className="flex-1 overflow-y-auto p-8">
					<div className="max-w-3xl space-y-6">
						<Card className="p-6">
							<h2 className="mb-4 text-lg font-semibold text-white">Preferences</h2>
							<div className="space-y-5">
								<div>
									<label className="mb-2 block text-sm text-slate-400">Theme</label>
									<select value={settings.theme} onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none">
										<option value="dark">Dark</option>
										<option value="system">System</option>
									</select>
								</div>
								<label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4">
									<span><span className="block text-sm font-medium text-slate-200">Notifications</span><span className="text-xs text-slate-500">Receive collaboration updates</span></span>
									<input type="checkbox" checked={settings.notifications} onChange={() => setSettings((s) => ({ ...s, notifications: !s.notifications }))} />
								</label>
								<label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4">
									<span><span className="block text-sm font-medium text-slate-200">Auto Save</span><span className="text-xs text-slate-500">Save diagrams automatically</span></span>
									<input type="checkbox" checked={settings.autoSave} onChange={() => setSettings((s) => ({ ...s, autoSave: !s.autoSave }))} />
								</label>
								<div>
									<label className="mb-2 block text-sm text-slate-400">Grid Size</label>
									<input type="range" min="10" max="50" value={settings.gridSize} onChange={(e) => setSettings((s) => ({ ...s, gridSize: Number(e.target.value) }))} className="w-full accent-indigo-500" />
								</div>
							</div>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
