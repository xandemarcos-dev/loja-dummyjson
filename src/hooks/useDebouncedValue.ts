import { useEffect, useState } from 'react';

/**
 * Atrasa a propagação de um valor (ex.: texto da busca) para não disparar
 * uma requisição a cada tecla. O cleanup cancela o timer anterior.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
