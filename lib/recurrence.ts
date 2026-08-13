import type { ClassDraft, DarsClass } from "@/lib/types/dars";

export const recurringCadences = ["Weekly", "Every 2 weeks", "Monthly"] as const;
export type RecurringCadence = (typeof recurringCadences)[number];
export const defaultRecurringOccurrenceCount = 12;

function fromIso(iso: string) { const [year, month, day] = iso.split("-").map(Number); return new Date(year, month - 1, day); }
function toIso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function cadence(rule?: string): RecurringCadence { return recurringCadences.includes(rule as RecurringCadence) ? rule as RecurringCadence : "Weekly"; }

export function getOccurrenceDate(seedDate: string, rule: string | undefined, occurrenceIndex: number) {
  const date = fromIso(seedDate); const step = cadence(rule);
  if (step === "Monthly") date.setMonth(date.getMonth() + occurrenceIndex);
  else date.setDate(date.getDate() + occurrenceIndex * (step === "Every 2 weeks" ? 14 : 7));
  return toIso(date);
}

export function createRecurringOccurrences(draft: ClassDraft, seriesId: string, createId: () => string, count = defaultRecurringOccurrenceCount): DarsClass[] {
  const rule = cadence(draft.recurrenceRule); return Array.from({ length: count }, (_, occurrenceIndex) => ({ ...draft, id: createId(), date: getOccurrenceDate(draft.date, rule, occurrenceIndex), recurrenceRule: rule, type: "recurring", seriesId, occurrenceIndex }));
}
