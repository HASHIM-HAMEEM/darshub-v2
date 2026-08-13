import { router } from "expo-router";
import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, FilterChips, IconButton } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { dayDifference, formatClassDate, getUpcomingClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { useI18n } from "@/lib/i18n";
import type { DarsClass } from "@/lib/types/dars";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScheduleGroup = { title: string; data: DarsClass[] };

export default function ScheduleScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { classes, teachers, books, locations, isHydrated } = useDars(); const { dateDisplay, locale } = useDisplayPreferences(); const { language, isRTL } = useI18n(); const [view, setView] = useState<"today" | "week">("today");
  const sections = useMemo<ScheduleGroup[]>(() => { const items = getUpcomingClasses(classes).filter((item) => view === "today" ? dayDifference(item.date) === 0 : dayDifference(item.date) <= 6); const groups = items.reduce<Record<string, DarsClass[]>>((acc, item) => { (acc[item.date] ??= []).push(item); return acc; }, {}); return Object.entries(groups).map(([date, data]) => ({ title: dayDifference(date) === 0 ? (language === "ar" ? "اليوم" : formatClassDate(date, dateDisplay, locale)) : formatClassDate(date, dateDisplay, locale), data })); }, [classes, dateDisplay, language, locale, view]);
  const writing = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  if (!isHydrated) return <ScreenContainer edges={["top", "left", "right"]}><View style={styles.loading}><View style={[styles.loadTitle, { backgroundColor: colors.wash }]} /><View style={[styles.loadCard, { backgroundColor: colors.wash }]} /></View></ScreenContainer>;
  const header = <View style={styles.header}><View style={[styles.headerTop, isRTL && styles.rowReverse]}><Text style={[styles.title, { color: colors.text }, writing]}>{language === "ar" ? "الجدول" : "Schedule"}</Text><IconButton icon="calendar-today" label={language === "ar" ? "التقويم" : "Calendar"} onPress={() => setView("today")} /></View><FilterChips values={["today", "week"]} selected={view} onSelect={(value) => setView(value as typeof view)} labels={{ today: language === "ar" ? "اليوم" : "Today", week: language === "ar" ? "الأسبوع" : "Week" }} /></View>;
  return <ScreenContainer edges={["top", "left", "right"]}><SectionList sections={sections} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={header} renderSectionHeader={({ section }) => <Text style={[styles.dateLabel, { color: colors.muted }, writing]}>{section.title}</Text>} renderItem={({ item }) => <View style={styles.item}><ClassCard item={item} teachers={teachers} books={books} locations={locations} compact /></View>} ListEmptyComponent={<EmptyState icon="event-available" title={language === "ar" ? "لا دروس هنا" : "No classes here"} message={language === "ar" ? "أضف درساً جديداً لتبدأ." : "Add a class to get started."} actionLabel={language === "ar" ? "أضف درساً" : "Add class"} onAction={() => router.push("/class/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 16, paddingTop: 6 }, rowReverse: { flexDirection: "row-reverse" }, header: { gap: 16, paddingBottom: 17 }, headerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { fontSize: 21, fontWeight: "700", lineHeight: 27 }, dateLabel: { fontSize: 13, fontWeight: "500", marginBottom: 8, marginTop: 4 }, item: { marginBottom: 12 }, loading: { gap: 16, padding: 16, paddingTop: 24 }, loadTitle: { borderRadius: 8, height: 28, width: 120 }, loadCard: { borderRadius: 16, height: 124, width: "100%" } });
