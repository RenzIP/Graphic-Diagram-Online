<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { documentsApi } from '$lib/api/documents';
	import { projectsApi } from '$lib/api/projects';
	import { workspacesApi } from '$lib/api/workspaces';
	import type { DocumentMeta, Project, Workspace } from '$lib/api/types';
	import { formatDateTime, truncateMiddle } from '$lib/utils/formatters';
	import { getApiErrorMessage } from '$lib/utils/validation';
	import { showToast } from '$lib/utils/toast';

	let loading = $state(true);
	let workspace = $state<Workspace | null>(null);
	let project = $state<Project | null>(null);
	let documents = $state<DocumentMeta[]>([]);

	onMount(async () => {
		const workspaceId = $page.params.id ?? '';
		const projectId = $page.params.projectId ?? '';

		if (!workspaceId || !projectId) {
			showToast('Parameter project tidak lengkap.', 'error');
			loading = false;
			return;
		}

		try {
			const [workspaceResponse, projectResponse, documentResponse] = await Promise.all([
				workspacesApi.list({ per_page: 100 }),
				projectsApi.listByWorkspace(workspaceId, { per_page: 100 }),
				documentsApi.listByProject(projectId, {
					per_page: 100,
					sort_by: 'updated_at',
					sort_order: 'desc'
				})
			]);

			workspace = workspaceResponse.data.find((item) => item.id === workspaceId) ?? null;
			project = projectResponse.data.find((item) => item.id === projectId) ?? null;
			documents = documentResponse.data;
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Gagal memuat detail project.'), 'error');
		} finally {
			loading = false;
		}
	});
</script>

<div class="flex min-h-screen bg-slate-950 text-slate-200">
	<AppSidebar />

	<main class="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
		<div class="mx-auto max-w-6xl">
			<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Detail Data</p>
					<h1 class="mt-2 text-3xl font-bold text-white">Detail Project</h1>
					<p class="mt-2 text-sm text-slate-400">
						Menampilkan ringkasan data utama dan daftar dokumen yang terkait.
					</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button href={`/workspace/${$page.params.id}`} variant="ghost">Kembali</Button>
					<Button href={`/workspace/${$page.params.id}/projects/edit/${$page.params.projectId}`} variant="secondary">
						Edit
					</Button>
					<Button href={`/workspace/${$page.params.id}/projects/delete/${$page.params.projectId}`} variant="danger">
						Hapus
					</Button>
				</div>
			</div>

			{#if loading}
				<Card class="p-10">
					<div class="flex items-center justify-center py-14">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div>
						<span class="ml-3 text-sm text-slate-500">Memuat detail project...</span>
					</div>
				</Card>
			{:else if !project}
				<Card class="p-10 text-center">
					<h2 class="text-xl font-semibold text-white">Project tidak ditemukan</h2>
					<p class="mt-2 text-sm text-slate-400">
						Data project ini tidak tersedia pada workspace yang dipilih.
					</p>
				</Card>
			{:else}
				<section class="grid grid-cols-1 gap-4 md:grid-cols-4">
					<Card class="p-5 md:col-span-2">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Nama Project</p>
						<h2 class="mt-3 text-2xl font-bold text-white">{project.name}</h2>
						<p class="mt-3 text-sm leading-6 text-slate-400">
							{project.description || 'Project ini belum memiliki deskripsi.'}
						</p>
					</Card>
					<Card class="p-5">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Workspace</p>
						<p class="mt-3 text-lg font-semibold text-white">{workspace?.name ?? '-'}</p>
						<p class="mt-2 text-sm text-slate-400">Role Anda: {workspace?.role ?? '-'}</p>
					</Card>
					<Card class="p-5">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Dokumen</p>
						<p class="mt-3 text-3xl font-bold text-white">{project.document_count}</p>
						<p class="mt-2 text-sm text-slate-400">Jumlah dokumen yang tersambung ke project ini.</p>
					</Card>
				</section>

				<section class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Card class="p-5">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">ID Project</p>
						<p class="mt-3 font-mono text-sm text-white">{project.id}</p>
					</Card>
					<Card class="p-5">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Creator</p>
						<p class="mt-3 font-mono text-sm text-white">
							{project.created_by ? truncateMiddle(project.created_by, 20) : '-'}
						</p>
					</Card>
					<Card class="p-5">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Dibuat</p>
						<p class="mt-3 text-sm text-white">{formatDateTime(project.created_at)}</p>
					</Card>
					<Card class="p-5">
						<p class="text-sm uppercase tracking-[0.3em] text-slate-500">Diupdate</p>
						<p class="mt-3 text-sm text-white">{formatDateTime(project.updated_at)}</p>
					</Card>
				</section>

				<section class="mt-6">
					<Card class="overflow-hidden p-0">
						<div class="border-b border-slate-800 px-5 py-4">
							<h3 class="text-lg font-semibold text-white">Dokumen Terkait</h3>
							<p class="mt-1 text-sm text-slate-400">
								Menampilkan data API dari resource relasi di dalam project ini.
							</p>
						</div>
						{#if documents.length === 0}
							<div class="px-5 py-10 text-center text-sm text-slate-400">
								Belum ada dokumen pada project ini.
							</div>
						{:else}
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-slate-800">
									<thead class="bg-slate-900/80 text-left text-xs uppercase tracking-[0.25em] text-slate-500">
										<tr>
											<th class="px-4 py-4">ID</th>
											<th class="px-4 py-4">Judul</th>
											<th class="px-4 py-4">Tipe</th>
											<th class="px-4 py-4">Versi</th>
											<th class="px-4 py-4">Diupdate</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-slate-800 text-sm">
										{#each documents as document}
											<tr class="hover:bg-slate-900/60">
												<td class="px-4 py-4 font-mono text-xs text-slate-400">
													{truncateMiddle(document.id, 18)}
												</td>
												<td class="px-4 py-4 text-white">
													<a class="hover:text-indigo-400" href={`/editor/${document.id}`}>
														{document.title}
													</a>
												</td>
												<td class="px-4 py-4 capitalize text-slate-300">{document.diagram_type}</td>
												<td class="px-4 py-4 text-slate-300">{document.version}</td>
												<td class="px-4 py-4 text-slate-400">{formatDateTime(document.updated_at)}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</Card>
				</section>
			{/if}
		</div>
	</main>
</div>
