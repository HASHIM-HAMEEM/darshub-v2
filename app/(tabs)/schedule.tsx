import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ClassCard, EmptyState, FilterChips, ScreenTitle } from "@/components/dars-ui";
import { useColors } from "@/hooks/use-colors";
import { dayDifference, formatClassDate, getUpcomingClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import type { DarsClass } from "@/lib/types/dars";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScheduleGroup = { title: string; data: DarsClass[] };

export default function ScheduleScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets();
  const { classes, teachers, books, locations } = useDars();
  const [view, setView] = useState("Today");
  const sections = useMemo<ScheduleGroup[]>(() => {
    const items = getUpcomingClasses(classes).filter((item) => view === "Today" ? dayDifference(item.date) === 0 : dayDifference(item.date) >= 0 && dayDifference(item.date) <= 7);
    return Object.entries(items.reduce<Record<string, DarsClass[]>>((acc, item) => { (acc[item.date] ??= []).push(item); return acc; }, {})).map(([date, data]) => ({ title: dayDifference(date) === 0 ? "Today" : formatClassDate(date), data }));
  }, [classes, view]);

  return <ScreenContainer edges={["top", "left", "right"]}><SectionList sections={sections} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Keep time for knowledge" title="Schedule" /><FilterChips values={["Today", "Week"]} selected={view} onSelect={setView} /></View>} renderSectionHeader={({ section }) => <Text style={[styles.sectionTitle, { color: colors.tint }]}>{section.title}</Text>} renderItem={({ item }) => <View style={styles.classWrap}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListEmptyComponent={<EmptyState icon="calendar-today" title="A clear schedule" message={view === "Today" ? "There are no classes planned today." : "There are no upcoming classes this week."} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20 }, header: { gap: 16, paddingBottom: 18 }, sectionTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, marginBottom: 9, textTransform: "uppercase" }, classWrap: { marginBottom: 10 } });
