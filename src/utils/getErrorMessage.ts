import { isAxiosError } from 'axios';

/**
 * Extrai uma mensagem de erro legível de qualquer erro capturado (unknown).
 * Prioriza os campos padronizados retornados pela API ({ message } / { error })
 * e cai para a mensagem do próprio Error, evitando o uso de `any` espalhado
 * pelos catch blocks.
 */
export function getErrorMessage(
  err: unknown,
  fallback = 'Ocorreu um erro inesperado. Tente novamente.',
): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || err.message || fallback;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'string' && err) {
    return err;
  }

  return fallback;
}
