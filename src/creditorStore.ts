import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Creditor,
  DEBT_KINDS,
  DebtKind,
} from './creditorMath';

const STORAGE_KEY = 'debt-payoff.creditors.v1';

function isDebtKind(value: unknown): value is DebtKind {
  return typeof value === 'string' && (DEBT_KINDS as readonly string[]).includes(value);
}

function isCreditor(value: unknown): value is Creditor {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    row.id.length > 0 &&
    typeof row.name === 'string' &&
    row.name.trim().length > 0 &&
    typeof row.amountCents === 'number' &&
    Number.isSafeInteger(row.amountCents) &&
    row.amountCents >= 0 &&
    isDebtKind(row.kind)
  );
}

export function parseCreditorList(raw: string | null): Creditor[] {
  if (raw === null || raw.trim() === '') {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isCreditor);
  } catch {
    return [];
  }
}

export async function loadCreditors(): Promise<Creditor[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseCreditorList(raw);
}

export async function saveCreditors(creditors: readonly Creditor[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(creditors));
}
