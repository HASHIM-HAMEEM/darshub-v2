import type { DarsClass } from "@/lib/types/dars";

export const MAX_SCHEDULED_REMINDERS = 60;

export type ReminderKind = "lead" | "start";

export type PlannedReminder = {
  identifier: string;
  classId: string;
  kind: ReminderKind;
  date: Date;
  leadMinutes: number;
};

export const getReminderTime = (item: DarsClass, leadMinutes: number) => { const [year, month, day] = item.date.split("-").map(Number); const [hour, minute] = item.startTime.split(":").map(Number); const date = new Date(year, month - 1, day, hour, minute, 0, 0); date.setMinutes(date.getMinutes() - leadMinutes); return date; };
export const getEffectiveReminderLead = (item: DarsClass, fallbackLeadMinutes: number) => item.reminderLeadMinutes ?? fallbackLeadMinutes;
export const getSchedulableClasses = (items: DarsClass[], leadMinutes: number, now = Date.now()) => items.filter((item) => { const time = getReminderTime(item, getEffectiveReminderLead(item, leadMinutes)).getTime(); return item.status === "upcoming" && Number.isFinite(time) && time > now; });

export const reminderIdentifier = (classId: string, kind: ReminderKind) => `darshub-class-${classId}-${kind}`;

export function planReminders(
  items: DarsClass[],
  options: { leadMinutes: number; alarmAtStart: boolean; limit?: number },
  now = Date.now(),
): PlannedReminder[] {
  const planned: PlannedReminder[] = [];
  for (const item of items) {
    if (item.status !== "upcoming") continue;
    const leadMinutes = getEffectiveReminderLead(item, options.leadMinutes);
    const leadAt = getReminderTime(item, leadMinutes);
    if (Number.isFinite(leadAt.getTime()) && leadAt.getTime() > now) {
      planned.push({ identifier: reminderIdentifier(item.id, "lead"), classId: item.id, kind: "lead", date: leadAt, leadMinutes });
    }
    if (options.alarmAtStart && leadMinutes > 0) {
      const startAt = getReminderTime(item, 0);
      if (Number.isFinite(startAt.getTime()) && startAt.getTime() > now) {
        planned.push({ identifier: reminderIdentifier(item.id, "start"), classId: item.id, kind: "start", date: startAt, leadMinutes: 0 });
      }
    }
  }
  return planned.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, options.limit ?? MAX_SCHEDULED_REMINDERS);
}

const leadLabel = (minutes: number, language: "en" | "ar") => {
  if (language === "ar") return minutes === 60 ? "بعد ساعة" : `بعد ${minutes} دقيقة`;
  return minutes === 60 ? "in 1 hour" : `in ${minutes} minutes`;
};

export function reminderCopy(
  item: Pick<DarsClass, "title" | "startTime">,
  reminder: Pick<PlannedReminder, "kind" | "leadMinutes">,
  language: "en" | "ar",
  place?: string,
) {
  const where = place ? ` · ${place}` : "";
  if (reminder.kind === "start") {
    return language === "ar"
      ? { title: `حان وقت الدرس: ${item.title}`, body: `يبدأ الآن (${item.startTime})${where}` }
      : { title: `Class time: ${item.title}`, body: `Starting now (${item.startTime})${where}` };
  }
  return language === "ar"
    ? { title: `تذكير: ${item.title}`, body: `يبدأ ${leadLabel(reminder.leadMinutes, "ar")} (${item.startTime})${where}` }
    : { title: `Reminder: ${item.title}`, body: `Starts ${leadLabel(reminder.leadMinutes, "en")} (${item.startTime})${where}` };
}
