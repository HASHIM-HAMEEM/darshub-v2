import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { formatTime } from "@/lib/dars-utils";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeachersScreen() {
  const { teachers, classes } = useDars(); const { locale } = useDisplayPreferences(); const { language } = useI18n(); const insets = useSafeAreaInsets(); const list = useMemo(() => [...teachers].sort((a, b) => a.name.localeCompare(b.name)), [teachers]); const nextFor = (teacherId: string) => classes.filter((entry) => entry.teacherId === teacherId && entry.status === "upcoming").sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0];
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle title={language === "ar" ? "المعلمون" : "Teachers"} action={<IconButton icon="add" label={language === "ar" ? "أضف معلماً" : "Add teacher"} onPress={() => router.push("/teacher/form" as never)} />} /></View>} renderItem={({ item }) => { const next = nextFor(item.id); const subtitle = [item.subjects.slice(0, 2).join(" · "), next ? `${language === "ar" ? "القادم" : "Next"}: ${next.title}` : language === "ar" ? "لا يوجد درس قادم" : "No upcoming class"].filter(Boolean).join("  ·  "); return <DirectoryRow icon="groups" title={item.name} subtitle={subtitle} tag={next ? formatTime(next.startTime, locale) : undefined} onPress={() => router.push(`/teacher/${item.id}` as never)} />; }} ListEmptyComponent={<EmptyState icon="groups" title={language === "ar" ? "لا يوجد معلمون" : "No teachers yet"} message={language === "ar" ? "أضف معلماً للبدء." : "Add a teacher to begin."} actionLabel={language === "ar" ? "أضف معلماً" : "Add teacher"} onAction={() => router.push("/teacher/form" as never)} />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, header: { marginBottom: 1 } });
