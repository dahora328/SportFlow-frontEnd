// URL base dos arquivos servidos pelo storage do backend (ex.: logos de empresa).
// Configurável por ambiente (ex.: variável VITE_STORAGE_URL no painel da Vercel),
// com fallback para o mesmo host da API e, por último, o localhost de desenvolvimento.
// Evita URLs http://localhost hardcoded, que quebram e causam mixed-content em produção.
function storageBase(): string {
  const explicit = import.meta.env.VITE_STORAGE_URL as string | undefined;
  if (explicit) return explicit.replace(/\/+$/, '');

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    const origin = apiUrl.replace(/\/?api\/?$/i, '').replace(/\/+$/, '');
    return `${origin}/storage`;
  }

  return 'http://localhost:8080/storage';
}

export function storageUrl(path: string, bustCache = true): string {
  const base = storageBase();
  const clean = String(path).replace(/^\/+/, '');
  const suffix = bustCache ? `?t=${Date.now()}` : '';
  return `${base}/${clean}${suffix}`;
}
