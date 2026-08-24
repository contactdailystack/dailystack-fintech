/**
 * AlertsRuntime.tsx — headless bridge that triggers behavioral-alert
 * evaluation whenever real app data changes (transactions, balance, subs).
 * Must be rendered inside <AlertsProvider>.
 */

import { useEffect, useRef } from 'react';
import type { Transaction } from '../../types';
import type { AlertRuntimeContext } from './alertEngine';
import { useAlerts } from './AlertsContext';

interface AlertsRuntimeProps extends AlertRuntimeContext {
  transactions: Transaction[];
  /** Debounce so bulk loads / rapid edits don't spam evaluations */
  debounceMs?: number;
}

export function AlertsRuntime({
  balance,
  transactions,
  subscriptions,
  debounceMs = 4000,
}: AlertsRuntimeProps) {
  const { evaluateAlerts, preferences } = useAlerts();

  // Keep latest args in refs so the debounced call sees fresh data
  const argsRef = useRef({ balance, transactions, subscriptions });
  argsRef.current = { balance, transactions, subscriptions };

  // Re-run when the transaction list materially changes (count or newest id)
  const lastTxId = transactions.length > 0 ? transactions[0].id : '';
  const txSignature = `${transactions.length}:${lastTxId}`;

  useEffect(() => {
    if (!preferences) return;
    if (argsRef.current.transactions.length === 0) return;

    const timer = setTimeout(() => {
      void evaluateAlerts(argsRef.current.transactions, {
        balance: argsRef.current.balance,
        subscriptions: argsRef.current.subscriptions,
      });
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences, txSignature, balance, debounceMs, evaluateAlerts]);

  return null;
}
