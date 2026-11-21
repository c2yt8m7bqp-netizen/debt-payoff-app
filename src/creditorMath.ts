export const DEBT_KINDS = [
  'Credit card',
  'Medical',
  'Car',
  'Personal loan',
  'Other',
] as const;

export type DebtKind = (typeof DEBT_KINDS)[number];

export type Creditor = {
  id: string;
  name: string;
  amountCents: number;
  kind: DebtKind;
};

const MAX_NAME_LENGTH = 80;

export function parseDollarsToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }

  const [dollarsText, fraction = ''] = cleaned.split('.');
  const dollars = Number(dollarsText);
  const centsPart = Number((fraction + '00').slice(0, 2));
  if (!Number.isSafeInteger(dollars) || !Number.isSafeInteger(centsPart)) {
    return null;
  }

  const cents = dollars * 100 + centsPart;
  return Number.isSafeInteger(cents) ? cents : null;
}

export function formatCents(cents: number): string {
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${dollars.toLocaleString('en-US')}.${String(remainder).padStart(2, '0')}`;
}

export function totalCents(creditors: readonly Creditor[]): number {
  return creditors.reduce((sum, creditor) => sum + creditor.amountCents, 0);
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeCreditorName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
    return null;
  }
  return name;
}
