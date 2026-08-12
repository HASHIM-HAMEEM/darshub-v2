import { router } from "expo-router";
import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, FilterChips, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { dayDifference, formatClassDate, getUpcomingClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import type { DarsClass } from "@/lib/types/dars";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScheduleGroup = { title: string; date: string; data: DarsClass[] };

export default function ScheduleScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { classes, teachers, books, locations, isHydrated } = useDars(); const { dateDisplay, locale } = useDisplayPreferences(); const [view, setView] = useState("Today");
  const sections = useMemo<ScheduleGroup[]>(() => { const items = getUpcomingClasses(classes).filter((item) => view === "Today" ? dayDifference(item.date) === 0 : dayDifference(item.date) >= 0 && dayDifference(item.date) <= 7); return Object.entries(items.reduce<Record<string, DarsClass[]>>((acc, item) => { (acc[item.date] ??= []).push(item); return acc; }, {})).map(([date, data]) => ({ date, title: dayDifference(date) === 0 ? "Today" : formatClassDate(date, dateDisplay, locale), data })); }, [classes, dateDisplay, locale, view]);
  const header = <View style={styles.header}><ScreenTitle eyebrow="PLAN WITH INTENTION" title="Schedule" /><View style={styles.controls}><FilterChips values={["Today", "Week"]} selected={view} onSelect={setView} /><Text style={[styles.count, { color: colors.muted }]}>{sections.reduce((total, section) => total + section.data.length, 0)} {sections.reduce((total, section) => total + section.data.length, 0) === 1 ? "class" : "classes"}</Text></View></View>;
  if (!isHydrated) return <ScreenContainer edges={["top", "left", "right"]}><View style={styles.loading}><View style={[styles.loadingBar, { backgroundColor: colors.wash }]} /><View style={[styles.loadingLine, { backgroundColor: colors.wash }]} /></View></ScreenContainer>;
  return <ScreenContainer edges={["top", "left", "right"]}><SectionList sections={sections} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }]} ListHeaderComponent={header} renderSectionHeader={({ section }) => <View style={styles.sectionHead}><Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text><View style={[styles.sectionCount, { backgroundColor: colors.wash }]}><Text style={[styles.sectionCountText, { color: colors.tint }]}>{section.data.length}</Text></View></View>} renderItem={({ item }) => <View style={styles.classWrap}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListEmptyComponent={<EmptyState icon="calendar-today" title={view === "Today" ? "No class today" : "A clear week ahead"} message={view === "Today" ? "Nothing is planned for today. Add a class whenever you are ready." : "There are no upcoming classes in the next seven days."} actionLabel="Add a class" onAction={() => router.push("/class/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 18, paddingTop: 10 }, header: { gap: 15, paddingBottom: 26 }, controls: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, count: { fontSize: 12, fontWeight: "700" }, sectionHead: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 9, marginTop: 4 }, sectionTitle: { flex: 1, fontSize: 15.5, fontWeight: "800", lineHeight: 21 }, sectionCount: { alignItems: "center", borderRadius: 10, height: 22, justifyContent: "center", minWidth: 22, paddingHorizontal: 6 }, sectionCountText: { fontSize: 11, fontWeight: "800" }, classWrap: { marginBottom: 10 }, loading: { gap: 20, padding: 20, paddingTop: 33 }, loadingBar: { borderRadius: 8, height: 21, width: 135 }, loadingLine: { borderRadius: 12, height: 92, width: "100%" } });
