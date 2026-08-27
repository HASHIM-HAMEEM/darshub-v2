import { router } from "expo-router";
import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { AgendaRow, EmptyState, IconButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { WeekStrip } from "@/components/week-strip";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, getUpcomingClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { useI18n } from "@/lib/i18n";
import type { DarsClass } from "@/lib/types/dars";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScheduleGroup = { title: string; data: DarsClass[] };
const isoToday = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
const offsetIso = (anchor: string, days: number) => { const value = new Date(`${anchor}T12:00:00`); value.setDate(value.getDate() + days); return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; };

export default function ScheduleScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { classes, teachers, books, locations } = useDars(); const { dateDisplay, locale } = useDisplayPreferences(); const { language, isRTL } = useI18n(); const today = isoToday(); const [selectedDate, setSelectedDate] = useState(today); const sections = useMemo<ScheduleGroup[]>(() => { const start = offsetIso(selectedDate, -3); const end = offsetIso(selectedDate, 3); const grouped = getUpcomingClasses(classes).filter((item) => item.date >= start && item.date <= end).reduce<Record<string, DarsClass[]>>((acc, item) => { (acc[item.date] ??= []).push(item); return acc; }, {}); return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, data]) => ({ title: date === today ? (language === "ar" ? "اليوم" : "Today") : formatClassDate(date, dateDisplay, locale), data })); }, [classes, dateDisplay, language, locale, selectedDate, today]); const writing = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  const header = <View style={styles.header}><ScreenTitle eyebrow={language === "ar" ? "هذا الأسبوع" : "This week"} title={language === "ar" ? "الجدول" : "Schedule"} action={<IconButton icon="today" label={language === "ar" ? "اليوم" : "Today"} onPress={() => setSelectedDate(today)} />} /><WeekStrip selectedDate={selectedDate} classes={classes} onSelect={setSelectedDate} /></View>;
  return <ScreenContainer edges={["top", "left", "right"]}><SectionList sections={sections} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={header} renderSectionHeader={({ section }) => <Text style={[styles.dateLabel, { color: colors.muted }, writing]}>{section.title}</Text>} renderItem={({ item }) => <AgendaRow item={item} teachers={teachers} books={books} locations={locations} />} ListEmptyComponent={<EmptyState icon="event-available" title={language === "ar" ? "لا دروس في هذا الأسبوع" : "No classes this week"} message={language === "ar" ? "اختر أسبوعاً آخر أو أضف درساً." : "Pick another week or add a class."} actionLabel={language === "ar" ? "إضافة درس" : "Add class"} onAction={() => router.push("/class/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 22, paddingTop: 8 }, header: { gap: 8, paddingBottom: 12 }, dateLabel: { fontFamily: "monospace", fontSize: 10.5, fontWeight: "500", letterSpacing: 0.7, marginTop: 12, textTransform: "uppercase" } });
