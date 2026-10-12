import { useEffect, useState, type DependencyList } from 'react';
import { errorMessage } from '../services/api';

export type AsyncState<T> =
  | { status: 'loading'; data: T | null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | null; error: string };

/**
 * Executa uma chamada assíncrona e expõe os três estados (carregando, sucesso, erro).
 * Cada nova execução aborta a anterior, evitando que uma resposta atrasada
 * sobrescreva a mais recente (condição de corrida comum em buscas).
 */
export function useAsync<T>(
  task: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ status: 'loading', data: previous.data, error: null }));

    task(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((previous) => ({ status: 'error', data: previous.data, error: errorMessage(error) }));
      });

    return () => controller.abort();
    // `task` é recriada a cada render; quem chama declara as dependências reais em `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  return { ...state, reload: () => setAttempt((n) => n + 1) };
}
