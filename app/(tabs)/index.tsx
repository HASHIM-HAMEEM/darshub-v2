import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, FilterChips, IconButton } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, getUpcomingClasses } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isoToday = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

export default function HomeScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { classes, teachers, books, locations, isHydrated } = useDars(); const { dateDisplay, locale } = useDisplayPreferences(); const { language, isRTL } = useI18n(); const [scope, setScope] = useState<"today" | "week" | "all">("today");
  const visible = useMemo(() => { const upcoming = getUpcomingClasses(classes); if (scope === "today") return upcoming.filter((item) => item.date === isoToday()); if (scope === "week") return upcoming.slice(0, 7); return classes; }, [classes, scope]);
  const hasReferences = Boolean(teachers.length && books.length && locations.length); const firstSetup = !teachers.length ? { route: "/teacher/form", label: language === "ar" ? "أضف معلماً" : "Add teacher" } : !books.length ? { route: "/book/form", label: language === "ar" ? "أضف كتاباً" : "Add book" } : { route: "/location/form", label: language === "ar" ? "أضف مكاناً" : "Add place" };
  const writing = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  if (!isHydrated) return <ScreenContainer edges={["top", "left", "right"]}><View style={styles.loading}><View style={[styles.loadTitle, { backgroundColor: colors.wash }]} /><View style={[styles.loadCard, { backgroundColor: colors.wash }]} /></View></ScreenContainer>;
  const labels = { today: language === "ar" ? "اليوم" : "Today", week: language === "ar" ? "هذا الأسبوع" : "This Week", all: language === "ar" ? "الكل" : "All" };
  const header = <View style={styles.header}><View style={[styles.headerTop, isRTL && styles.rowReverse]}><View style={styles.titleCopy}><Text style={[styles.title, { color: colors.text }, writing]}>{language === "ar" ? "السلام عليكم" : "Assalamu alaikum"}</Text><Text style={[styles.date, { color: colors.muted }, writing]}>{formatClassDate(isoToday(), dateDisplay, locale)}</Text></View><IconButton icon="search" label={language === "ar" ? "بحث" : "Search"} onPress={() => router.push("/search" as never)} /></View><FilterChips values={["today", "week", "all"]} selected={scope} onSelect={(value) => setScope(value as typeof scope)} labels={labels} /></View>;
  return <ScreenContainer edges={["top", "left", "right"]}><View style={styles.screen}><FlatList data={visible} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={header} renderItem={({ item }) => <View style={styles.item}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListEmptyComponent={<View style={styles.empty}>{hasReferences ? <EmptyState icon="event-available" title={language === "ar" ? "لا توجد دروس" : "No classes yet"} message={language === "ar" ? "أضف درساً جديداً لتبدأ." : "Add a new class to get started."} actionLabel={language === "ar" ? "أضف درساً" : "Add class"} onAction={() => router.push("/class/form" as never)} /> : <EmptyState icon="auto-stories" title={language === "ar" ? "ابدأ مكتبتك" : "Build your library"} message={language === "ar" ? "أضف معلماً وكتاباً ومكاناً." : "Add a teacher, book, and place."} actionLabel={firstSetup.label} onAction={() => router.push(firstSetup.route as never)} />}</View>} /></View></ScreenContainer>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, content: { paddingHorizontal: 16, paddingTop: 2 }, rowReverse: { flexDirection: "row-reverse" }, header: { gap: 16, paddingBottom: 16, paddingTop: 6 }, headerTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, titleCopy: { flex: 1, minWidth: 0 }, title: { fontSize: 21, fontWeight: "700", lineHeight: 27 }, date: { fontSize: 13, marginTop: 2 }, item: { marginBottom: 12 }, empty: { paddingTop: 8 }, loading: { gap: 18, padding: 16, paddingTop: 22 }, loadTitle: { borderRadius: 8, height: 28, width: 190 }, loadCard: { borderRadius: 16, height: 144, width: "100%" } });
