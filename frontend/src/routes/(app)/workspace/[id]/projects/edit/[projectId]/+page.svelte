<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { projectsApi } from '$lib/api/projects';
	import { workspacesApi } from '$lib/api/workspaces';
	import type { Project, Workspace } from '$lib/api/types';
	import { showToast } from '$lib/utils/toast';
	import { getApiErrorMessage, type ValidationErrors } from '$lib/utils/validation';

	let loading = $state(true);
	let submitting = $state(false);
	let workspace = $state<Workspace | null>(null);
	let project = $state<Project | null>(null);
	let form = $state({
		name: '',
		description: ''
	});
	let errors = $state<ValidationErrors>({});

	onMount(async () => {
		const workspaceId = $page.params.id ?? '';
		const projectId = $page.params.projectId ?? '';

		if (!workspaceId || !projectId) {
			showToast('Parameter project tidak lengkap.', 'error');
			loading = false;
			return;
		}

		try {
			const [workspaceResponse, projectResponse] = await Promise.all([
				workspacesApi.list({ per_page: 100 }),
				projectsApi.listByWorkspace(workspaceId, { per_page: 100 })
			]);

			workspace = workspaceResponse.data.find((item) => item.id === workspaceId) ?? null;
			project = projectResponse.data.find((item) => item.id === projectId) ?? null;

			if (project) {
				form.name = project.name;
				form.description = project.description ?? '';
			}
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal memuat data project.'), 'error');
		} finally {
			loading = false;
		}
	});

	function validateForm(): boolean {
		const nextErrors: ValidationErrors = {};

		if (!form.name.trim()) nextErrors.name = 'Nama project wajib diisi.';
		else if (form.name.trim().length < 3) nextErrors.name = 'Nama project minimal 3 karakter.';
		else if (form.name.trim().length > 100) nextErrors.name = 'Nama project maksimal 100 karakter.';

		if (form.description.trim().length > 500) {
			nextErrors.description = 'Deskripsi maksimal 500 karakter.';
		}

		errors = nextErrors;
		return Object.keys(nextErrors).length === 0;
	}

	async function handleSubmit() {
		if (!project) return;
		if (!validateForm()) {
			showToast('Periksa kembali data project yang akan diubah.', 'error');
			return;
		}

		submitting = true;
		try {
			await projectsApi.update(project.id, {
				name: form.name.trim(),
				description: form.description.trim() || undefined
			});
			showToast('Project berhasil diperbarui.', 'success');
			await goto(`/workspace/${$page.params.id}/projects/${project.id}`);
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal memperbarui project.'), 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex min-h-screen bg-slate-950 text-slate-200">
	<AppSidebar />

	<main class="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
		<div class="mx-auto max-w-3xl">
			<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Edit Data</p>
					<h1 class="mt-2 text-3xl font-bold text-white">Edit Project</h1>
					<p class="mt-2 text-sm text-slate-400">
						Perbarui informasi project tanpa mengubah struktur tema aplikasi.
					</p>
				</div>
				<Button href={`/workspace/${$page.params.id}/projects/${$page.params.projectId}`} variant="ghost">
					Kembali ke Detail
				</Button>
			</div>

			<Card class="p-6">
				{#if loading}
					<div class="flex items-center justify-center py-14">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div>
						<span class="ml-3 text-sm text-slate-500">Memuat form edit...</span>
					</div>
				{:else if !project}
					<div class="py-10 text-center">
						<h2 class="text-lg font-semibold text-white">Project tidak ditemukan</h2>
						<p class="mt-2 text-sm text-slate-400">
							Data project tidak tersedia untuk diedit pada workspace ini.
						</p>
					</div>
				{:else}
					<form
						class="space-y-5"
						onsubmit={(event) => {
							event.preventDefault();
							handleSubmit();
						}}
					>
						<Input label="Workspace" value={workspace?.name ?? '-'} disabled />

						<Input
							label="Nama Project"
							placeholder="Contoh: Perancangan Sistem Akademik"
							bind:value={form.name}
							error={errors.name}
						/>

						<div>
							<label for="description" class="mb-1.5 block text-sm font-medium text-slate-300">
								Deskripsi
							</label>
							<textarea
								id="description"
								bind:value={form.description}
								rows={5}
								placeholder="Perbarui ringkasan project"
								class="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
							></textarea>
							<div class="mt-1 flex items-center justify-between text-xs">
								<span class="text-red-400">{errors.description}</span>
								<span class="text-slate-500">{form.description.length}/500</span>
							</div>
						</div>

						<div class="flex flex-wrap justify-end gap-3">
							<Button
								href={`/workspace/${$page.params.id}/projects/${$page.params.projectId}`}
								variant="ghost"
								disabled={submitting}
							>
								Batal
							</Button>
							<Button type="submit" variant="primary" disabled={submitting}>
								{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
							</Button>
						</div>
					</form>
				{/if}
			</Card>
		</div>
	</main>
</div>
