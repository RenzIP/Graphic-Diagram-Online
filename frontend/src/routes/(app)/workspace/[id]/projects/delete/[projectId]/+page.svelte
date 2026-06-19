<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { projectsApi } from '$lib/api/projects';
	import { workspacesApi } from '$lib/api/workspaces';
	import type { Project } from '$lib/api/types';
	import { showToast } from '$lib/utils/toast';
	import { getApiErrorMessage } from '$lib/utils/validation';

	let loading = $state(true);
	let deleting = $state(false);
	let project = $state<Project | null>(null);
	let confirmationInput = $state('');
	let confirmationError = $state('');

	onMount(async () => {
		const workspaceId = $page.params.id ?? '';
		const projectId = $page.params.projectId ?? '';

		if (!workspaceId || !projectId) {
			showToast('Parameter project tidak lengkap.', 'error');
			loading = false;
			return;
		}

		try {
			const response = await projectsApi.listByWorkspace(workspaceId, { per_page: 100 });
			project = response.data.find((item) => item.id === projectId) ?? null;
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal memuat data project.'), 'error');
		} finally {
			loading = false;
		}
	});

	async function handleDelete() {
		if (!project) return;
		if (confirmationInput.trim() !== project.name) {
			confirmationError = 'Ketik nama project dengan tepat untuk mengonfirmasi penghapusan.';
			showToast(confirmationError, 'error');
			return;
		}

		confirmationError = '';
		deleting = true;
		try {
			await projectsApi.delete(project.id);
			showToast('Project berhasil dihapus.', 'success');
			await goto(`/workspace/${$page.params.id}`);
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal menghapus project.'), 'error');
		} finally {
			deleting = false;
		}
	}
</script>

<div class="flex min-h-screen bg-slate-950 text-slate-200">
	<AppSidebar />

	<main class="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
		<div class="mx-auto max-w-2xl">
			<div class="mb-6">
				<p class="text-sm uppercase tracking-[0.3em] text-red-400">Konfirmasi Hapus</p>
				<h1 class="mt-2 text-3xl font-bold text-white">Hapus Project</h1>
				<p class="mt-2 text-sm text-slate-400">
					Aksi ini tidak bisa dibatalkan dan akan menghapus seluruh dokumen di dalam project.
				</p>
			</div>

			<Card class="border-red-500/20 p-6">
				{#if loading}
					<div class="flex items-center justify-center py-14">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-red-400"></div>
						<span class="ml-3 text-sm text-slate-500">Memuat data penghapusan...</span>
					</div>
				{:else if !project}
					<div class="py-10 text-center">
						<h2 class="text-lg font-semibold text-white">Project tidak ditemukan</h2>
						<p class="mt-2 text-sm text-slate-400">
							Project yang ingin dihapus tidak tersedia pada workspace ini.
						</p>
					</div>
				{:else}
					<div class="space-y-5">
						<div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
							<p class="font-semibold">Project yang akan dihapus:</p>
							<p class="mt-2 text-lg font-bold">{project.name}</p>
							<p class="mt-2 text-red-100/80">{project.description || 'Tanpa deskripsi'}</p>
						</div>

						<div>
							<label for="confirm-name" class="mb-1.5 block text-sm font-medium text-slate-300">
								Ketik nama project untuk konfirmasi
							</label>
							<input
								id="confirm-name"
								bind:value={confirmationInput}
								placeholder={project.name}
								class="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/30 focus:outline-none"
							/>
							{#if confirmationError}
								<p class="mt-1 text-xs text-red-400">{confirmationError}</p>
							{/if}
						</div>

						<div class="flex flex-wrap justify-end gap-3">
							<Button href={`/workspace/${$page.params.id}/projects/${$page.params.projectId}`} variant="ghost" disabled={deleting}>
								Batal
							</Button>
							<Button variant="danger" onclick={handleDelete} disabled={deleting}>
								{deleting ? 'Menghapus...' : 'Ya, Hapus Project'}
							</Button>
						</div>
					</div>
				{/if}
			</Card>
		</div>
	</main>
</div>
