import type { DateDisplay, DarsClass, Location, Teacher, Book } from "@/lib/types/dars";

export type DarsReferences = { teachers: Teacher[]; books: Book[]; locations: Location[] };
const toDate = (isoDate: string) => new Date(`${isoDate}T12:00:00`);

const hijriMonths = {
  en: ["Muharram", "Safar", "Rabiʻ I", "Rabiʻ II", "Jumada I", "Jumada II", "Rajab", "Shaʻban", "Ramadan", "Shawwal", "Dhuʻl-Qiʻdah", "Dhuʻl-Hijjah"],
  ar: ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
};

const UMM_AL_QURA_EPOCH = Date.UTC(1979, 10, 21);
const UMM_AL_QURA_FIRST_YEAR = 1400;
const UMM_AL_QURA_MONTHS = [2725,  2635,  1175,  2359,  694,  2421,  3433,  3410,  3221,  2347,  603,  1243,  2517,  1490,  3493,  3402,  2709,  1357,  2733,  938,  3026,  3012,  2953,  2709,  1325,  1453,  2922,  1748,  3529,  3474,  2726,  2390,  686,  1389,  874,  2901,  2730,  2381,  1181,  2397,  698,  1461,  1450,  3413,  2714,  2350,  622,  1373,  2778,  1748,  1701,  2855,  2637,  1197,  1389,  2906,  1876,  3913,  3730,  3366,  2646,  854,  1717,  2986,  2962,  2853,  1675,  2715,  1370,  2778,  1460,  3497,  2898,  2714,  1334,  630,  1397,  2802,  1748,  1705,  1365,  685,  1213,  2490,  1396,  2921,  2898,  2709,  1325,  2653,  1242,  2777,  1714,  3733,  3626,  3222,  2350,  2733,  1386,  3429];

const tabularHijri = (y: number, m: number, d: number) => {
  const a = Math.trunc((m - 14) / 12);
  const jd = Math.trunc((1461 * (y + 4800 + a)) / 4) + Math.trunc((367 * (m - 2 - 12 * a)) / 12) - Math.trunc((3 * Math.trunc((y + 4900 + a) / 100)) / 4) + d - 32075;
  let l = jd - 1948440 + 10632; const n = Math.trunc((l - 1) / 10631); l = l - 10631 * n + 354;
  const j = Math.trunc((10985 - l) / 5316) * Math.trunc((50 * l) / 17719) + Math.trunc(l / 5670) * Math.trunc((43 * l) / 15238);
  l = l - Math.trunc((30 - j) / 15) * Math.trunc((17719 * j) / 50) - Math.trunc(j / 16) * Math.trunc((15238 * j) / 43) + 29;
  const month = Math.trunc((24 * l) / 709);
  return { year: 30 * n + j - 30, month, day: l - Math.trunc((709 * month) / 24) };
};

export const hijriParts = (date: Date) => {
  const y = date.getFullYear(); const m = date.getMonth() + 1; const d = date.getDate();
  let remaining = Math.round((Date.UTC(y, m - 1, d) - UMM_AL_QURA_EPOCH) / 86_400_000);
  if (remaining >= 0) {
    for (let index = 0; index < UMM_AL_QURA_MONTHS.length; index += 1) {
      for (let month = 0; month < 12; month += 1) {
        const length = UMM_AL_QURA_MONTHS[index] & (1 << month) ? 30 : 29;
        if (remaining < length) return { year: UMM_AL_QURA_FIRST_YEAR + index, month: month + 1, day: remaining + 1 };
        remaining -= length;
      }
    }
  }
  return tabularHijri(y, m, d);
};

const formatHijri = (date: Date, hijriLocale: string) => {
  const formatter = new Intl.DateTimeFormat(hijriLocale, { day: "numeric", month: "long", year: "numeric" });
  if (formatter.resolvedOptions().calendar.startsWith("islamic")) return formatter.format(date);
  const { year, month, day } = hijriParts(date);
  if (hijriLocale.startsWith("ar")) { const digits = new Intl.NumberFormat("ar-EG", { useGrouping: false }); return `${digits.format(day)} ${hijriMonths.ar[month - 1]} ${digits.format(year)} هـ`; }
  return `${hijriMonths.en[month - 1]} ${day}, ${year} AH`;
};

export const formatClassDate = (isoDate: string, display: DateDisplay = "gregorian", locale = "en-EG") => {
  const date = toDate(isoDate); const gregorian = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(date); const hijriLocale = locale.startsWith("ar") ? "ar-EG-u-ca-islamic-umalqura" : "en-EG-u-ca-islamic-umalqura"; const hijri = formatHijri(date, hijriLocale);
  return display === "hijri" ? hijri : display === "dual" ? `${gregorian} · ${hijri}` : gregorian;
};
export const formatClassDateParts = (isoDate: string, locale = "en-EG") => {
  const parts = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).formatToParts(toDate(isoDate));
  return { weekday: parts.find((part) => part.type === "weekday")?.value ?? "", day: parts.find((part) => part.type === "day")?.value ?? "" };
};
export const formatTime = (time: string, locale = "en-EG") => { const [hours, minutes] = time.split(":").map(Number); const date = new Date(); date.setHours(hours, minutes, 0, 0); return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date); };
export const classDateTime = (item: DarsClass) => new Date(`${item.date}T${item.startTime}:00`).getTime();
export const sortClasses = (items: DarsClass[]) => [...items].sort((a, b) => classDateTime(a) - classDateTime(b));
export const getUpcomingClasses = (items: DarsClass[]) => sortClasses(items.filter((item) => item.status === "upcoming"));
export const classEndDateTime = (item: DarsClass) => new Date(`${item.date}T${item.endTime ?? item.startTime}:00`).getTime();
export const getNextClass = (items: DarsClass[], now = Date.now()) => getUpcomingClasses(items).find((item) => classEndDateTime(item) >= now);
export const getRef = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id);
export const classMatchesQuery = (item: DarsClass, refs: DarsReferences, query: string) => [item.title, item.subject, item.city, item.status, getRef(refs.teachers, item.teacherId)?.name ?? "", getRef(refs.books, item.bookId)?.name ?? "", getRef(refs.locations, item.locationId)?.name ?? ""].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
export const dayDifference = (isoDate: string) => { const start = new Date(); start.setHours(12, 0, 0, 0); return Math.round((toDate(isoDate).getTime() - start.getTime()) / 86400000); };

export function weekdayNames(locale: string) {
  const format = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, day) => format.format(new Date(2024, 0, 7 + day)));
}
