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
	import type { Workspace } from '$lib/api/types';
	import { showToast } from '$lib/utils/toast';
	import { getApiErrorMessage, type ValidationErrors } from '$lib/utils/validation';

	let loading = $state(true);
	let submitting = $state(false);
	let workspaces = $state<Workspace[]>([]);
	let form = $state({
		workspace_id: '',
		name: '',
		description: ''
	});
	let errors = $state<ValidationErrors>({});

	onMount(async () => {
		try {
			const response = await workspacesApi.list({ per_page: 100 });
			workspaces = response.data;
			form.workspace_id = $page.params.id || response.data[0]?.id || '';
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal memuat workspace.'), 'error');
		} finally {
			loading = false;
		}
	});

	function validateForm(): boolean {
		const nextErrors: ValidationErrors = {};

		if (!form.workspace_id) nextErrors.workspace_id = 'Workspace wajib dipilih.';
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
		if (!validateForm()) {
			showToast('Periksa kembali form project.', 'error');
			return;
		}

		submitting = true;
		try {
			await projectsApi.create({
				workspace_id: form.workspace_id,
				name: form.name.trim(),
				description: form.description.trim() || undefined
			});

			showToast('Project berhasil ditambahkan.', 'success');
			await goto(`/workspace/${form.workspace_id}`);
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal menambahkan project.'), 'error');
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
					<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Tambah Data</p>
					<h1 class="mt-2 text-3xl font-bold text-white">Tambah Project Baru</h1>
					<p class="mt-2 text-sm text-slate-400">
						Form tambah data project utama dengan validasi frontend lengkap.
					</p>
				</div>
				<Button href={`/workspace/${$page.params.id}`} variant="ghost">Kembali ke List</Button>
			</div>

			<Card class="p-6">
				{#if loading}
					<div class="flex items-center justify-center py-14">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div>
						<span class="ml-3 text-sm text-slate-500">Memuat form project...</span>
					</div>
				{:else}
					<form
						class="space-y-5"
						onsubmit={(event) => {
							event.preventDefault();
							handleSubmit();
						}}
					>
						<div>
							<label for="workspace_id" class="mb-1.5 block text-sm font-medium text-slate-300">
								Workspace
							</label>
							<select
								id="workspace_id"
								bind:value={form.workspace_id}
								class="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
							>
								<option value="" disabled>Pilih workspace</option>
								{#each workspaces as workspace}
									<option value={workspace.id}>{workspace.name}</option>
								{/each}
							</select>
							{#if errors.workspace_id}
								<p class="mt-1 text-xs text-red-400">{errors.workspace_id}</p>
							{/if}
						</div>

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
								placeholder="Tuliskan ringkasan project"
								class="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
							></textarea>
							<div class="mt-1 flex items-center justify-between text-xs">
								<span class="text-red-400">{errors.description}</span>
								<span class="text-slate-500">{form.description.length}/500</span>
							</div>
						</div>

						<div class="flex flex-wrap justify-end gap-3">
							<Button href={`/workspace/${$page.params.id}`} variant="ghost" disabled={submitting}>
								Batal
							</Button>
							<Button type="submit" variant="primary" disabled={submitting}>
								{submitting ? 'Menyimpan...' : 'Simpan Project'}
							</Button>
						</div>
					</form>
				{/if}
			</Card>
		</div>
	</main>
</div>
