<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	let settings = $state({
		theme: 'dark',
		notifications: true,
		autoSave: true,
		gridSize: 20
	});

	let isSaving = $state(false);

	function saveSettings() {
		isSaving = true;
		// Simulate API call
		setTimeout(() => {
			isSaving = false;
			alert('Settings saved successfully!');
		}, 800);
	}
</script>

<div class="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
	<AppSidebar />

	<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<header
			class="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8"
		>
			<h1 class="text-xl font-bold text-white">Settings</h1>
			<Button variant="primary" size="sm" onclick={saveSettings} disabled={isSaving}>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</Button>
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-8">
			<div class="mx-auto max-w-2xl space-y-6">
				<!-- Profile Section -->
				<Card class="border-slate-800 bg-slate-900 p-6">
					<h2 class="mb-4 text-lg font-medium text-white">Profile</h2>
					<div class="flex items-center gap-6">
						<div class="relative">
							<Avatar initials="JD" size="lg" />
							<button
								class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm hover:bg-indigo-400"
							>
								<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</button>
						</div>
						<div class="flex-1 space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="mb-1 block text-sm font-medium text-slate-400">First Name</label>
									<Input value="John" />
								</div>
								<div>
									<label class="mb-1 block text-sm font-medium text-slate-400">Last Name</label>
									<Input value="Doe" />
								</div>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-400">Email</label>
								<Input value="john@example.com" disabled />
							</div>
						</div>
					</div>
				</Card>

				<!-- Preferences Section -->
				<Card class="border-slate-800 bg-slate-900 p-6">
					<h2 class="mb-4 text-lg font-medium text-white">Preferences</h2>
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-white">Theme</div>
								<div class="text-sm text-slate-500">Choose your interface appearance</div>
							</div>
							<select
								class="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none"
								bind:value={settings.theme}
							>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
								<option value="system">System</option>
							</select>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-white">Email Notifications</div>
								<div class="text-sm text-slate-500">Receive updates about activity</div>
							</div>
							<button
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none {settings.notifications
									? 'bg-indigo-500'
									: 'bg-slate-700'}"
								onclick={() => (settings.notifications = !settings.notifications)}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {settings.notifications
										? 'translate-x-6'
										: 'translate-x-1'}"
								></span>
							</button>
						</div>
					</div>
				</Card>

				<!-- Editor Settings -->
				<Card class="border-slate-800 bg-slate-900 p-6">
					<h2 class="mb-4 text-lg font-medium text-white">Editor</h2>
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-white">Auto-save</div>
								<div class="text-sm text-slate-500">Automatically save changes</div>
							</div>
							<button
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none {settings.autoSave
									? 'bg-indigo-500'
									: 'bg-slate-700'}"
								onclick={() => (settings.autoSave = !settings.autoSave)}
							>
								<span
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {settings.autoSave
										? 'translate-x-6'
										: 'translate-x-1'}"
								></span>
							</button>
						</div>
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium text-white">Grid Size</div>
								<div class="text-sm text-slate-500">Default grid snapping size</div>
							</div>
							<input
								type="number"
								class="w-20 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none"
								bind:value={settings.gridSize}
							/>
						</div>
					</div>
				</Card>
			</div>
		</div>
	</main>
</div>
