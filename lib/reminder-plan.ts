import type { DarsClass } from "@/lib/types/dars";

export const getReminderTime = (item: DarsClass, leadMinutes: number) => { const [year, month, day] = item.date.split("-").map(Number); const [hour, minute] = item.startTime.split(":").map(Number); const date = new Date(year, month - 1, day, hour, minute, 0, 0); date.setMinutes(date.getMinutes() - leadMinutes); return date; };
export const getEffectiveReminderLead = (item: DarsClass, fallbackLeadMinutes: number) => item.reminderLeadMinutes ?? fallbackLeadMinutes;
export const getSchedulableClasses = (items: DarsClass[], leadMinutes: number, now = Date.now()) => items.filter((item) => { const time = getReminderTime(item, getEffectiveReminderLead(item, leadMinutes)).getTime(); return item.status === "upcoming" && Number.isFinite(time) && time > now; });
