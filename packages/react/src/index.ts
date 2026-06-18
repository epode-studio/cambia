import type { Cambia, Observation, RoleValues } from '@epode/cambia-runtime';
import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';

const CambiaContext = createContext<Cambia | null>(null);

/** Provide a live Cambia engine to the tree. `value` is a `createCambia(...)` instance. */
export const CambiaProvider = CambiaContext.Provider;

export interface UseCambiaResult {
  /** The born-adapted-then-personalized trait values, keyed by trait. */
  values: RoleValues;
  /** Feed a usage signal back. Conserved traits are ignored by construction. */
  observe: (obs: Observation) => void;
}

/**
 * Read a role's adapted values and feed usage signals back.
 *
 * `values` holds the born-adapted-then-personalized trait values; conserved traits never
 * appear, so they cannot be adapted. Re-renders only when an adapted value actually changes.
 */
export function useCambia(roleName: string): UseCambiaResult {
  const cambia = useContext(CambiaContext);
  if (!cambia) {
    throw new Error('useCambia must be used within a <CambiaProvider value={createCambia(...)}>.');
  }
  const role = cambia.role(roleName);

  const values = useSyncExternalStore(
    useCallback((onChange) => role.subscribe(onChange), [role]),
    () => role.values(),
    () => role.values()
  );

  const observe = useCallback((obs: Observation) => role.observe(obs), [role]);

  return { values, observe };
}

export type { Cambia, Observation, RoleValues } from '@epode/cambia-runtime';
