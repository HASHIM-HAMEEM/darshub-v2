import type { DarsClass } from "@/lib/types/dars";

export const getReminderTime = (item: DarsClass, leadMinutes: number) => { const date = new Date(`${item.date}T${item.startTime}:00`); date.setMinutes(date.getMinutes() - leadMinutes); return date; };
export const getSchedulableClasses = (items: DarsClass[], leadMinutes: number, now = Date.now()) => items.filter((item) => item.status === "upcoming" && getReminderTime(item, leadMinutes).getTime() > now);
