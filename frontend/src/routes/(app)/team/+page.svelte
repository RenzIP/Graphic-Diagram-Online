<script lang="ts">
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let members = [
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			role: 'Owner',
			initials: 'JD',
			status: 'active'
		},
		{
			id: '2',
			name: 'Alice Smith',
			email: 'alice@example.com',
			role: 'Editor',
			initials: 'AS',
			status: 'active'
		},
		{
			id: '3',
			name: 'Bob Jones',
			email: 'bob@example.com',
			role: 'Viewer',
			initials: 'BJ',
			status: 'invited'
		}
	];
</script>

<div class="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
	<AppSidebar />

	<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<header
			class="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8"
		>
			<h1 class="text-xl font-bold text-white">Team Members</h1>
			<div class="flex items-center gap-4">
				<Button variant="primary" size="sm">
					<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
						/>
					</svg>
					Invite Member
				</Button>
			</div>
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-8">
			<div class="mx-auto max-w-4xl space-y-6">
				<Card class="overflow-hidden border-slate-800 bg-slate-900">
					<div class="border-b border-slate-800 px-6 py-4">
						<h2 class="text-lg font-medium text-white">Manage Team</h2>
						<p class="mt-1 text-sm text-slate-400">
							Invite colleagues to collaborate on your diagrams.
						</p>
					</div>
					<div class="divide-y divide-slate-800">
						{#each members as member}
							<div class="flex items-center justify-between px-6 py-4">
								<div class="flex items-center gap-4">
									<Avatar initials={member.initials} size="md" />
									<div>
										<div class="font-medium text-white">{member.name}</div>
										<div class="text-sm text-slate-500">{member.email}</div>
									</div>
								</div>
								<div class="flex items-center gap-4">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {member.status ===
										'active'
											? 'bg-green-500/10 text-green-400'
											: 'bg-amber-500/10 text-amber-400'}"
									>
										{member.status}
									</span>
									<select
										class="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none"
										value={member.role}
									>
										<option value="Owner">Owner</option>
										<option value="Editor">Editor</option>
										<option value="Viewer">Viewer</option>
									</select>
									<button class="text-slate-500 hover:text-red-400" aria-label="Remove member">
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</Card>
			</div>
		</div>
	</main>
</div>
