import { isAxiosError } from 'axios';

/**
 * Formato dos erros retornados pela API (Laravel).
 * Em respostas 422 o corpo traz { message, errors: { campo: [msgs] } }.
 */
type ApiErrorData = {
  message?: string;
  error?: string;
  errors?: Record<string, string[] | string> | null;
};

/**
 * Junta todas as mensagens de validação por campo (objeto `errors`) numa
 * única string, uma por linha. Retorna null quando não há erros de campo.
 * O ModalBase renderiza com `whitespace-pre-line`, então as quebras de linha
 * aparecem como uma lista legível.
 */
function joinFieldErrors(
  errors?: Record<string, string[] | string> | null,
): string | null {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  const all = Object.values(errors)
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .filter(
      (msg): msg is string => typeof msg === 'string' && msg.trim().length > 0,
    );

  return all.length > 0 ? all.join('\n') : null;
}

/**
 * Extrai uma mensagem de erro legível (em português, vinda da API) de
 * qualquer erro capturado (unknown).
 *
 * Prioridade:
 *  1. Mensagens de validação por campo (422) — todas, uma por linha;
 *  2. `message` / `error` padronizados da API;
 *  3. Mensagem do próprio Error / string;
 *  4. Fallback.
 *
 * Funciona tanto com o AxiosError cru quanto com o objeto normalizado
 * ({ status, message, errors }) que alguns services lançam.
 */
export function getErrorMessage(
  err: unknown,
  fallback = 'Ocorreu um erro inesperado. Tente novamente.',
): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as ApiErrorData | undefined;
    return (
      joinFieldErrors(data?.errors) ||
      data?.message ||
      data?.error ||
      err.message ||
      fallback
    );
  }

  // Objeto normalizado lançado por alguns services (ex.: athletesService).
  if (err && typeof err === 'object') {
    const data = err as ApiErrorData;
    const joined = joinFieldErrors(data.errors);
    if (joined) {
      return joined;
    }
    if (typeof data.message === 'string' && data.message) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error) {
      return data.error;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'string' && err) {
    return err;
  }

  return fallback;
}
