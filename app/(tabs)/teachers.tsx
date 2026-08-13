import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { EmptyState, IconButton } from "@/components/dars-ui";
import { MotionPressable } from "@/components/motion-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatTime } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initial = (name: string) => name.replace(/^(Shaykh|Ustadh)\s+/i, "").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export default function TeachersScreen() {
  const colors = useColors(); const { teachers, classes } = useDars(); const { locale } = useDisplayPreferences(); const insets = useSafeAreaInsets(); const { isRTL, language } = useI18n(); const list = useMemo(() => [...teachers].sort((a, b) => a.name.localeCompare(b.name)), [teachers]); const text = (color: string) => ({ color, textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const });
  const nextFor = (teacherId: string) => classes.filter((entry) => entry.teacherId === teacherId && entry.status === "upcoming").sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0];
  const header = <View style={styles.header}><View style={[styles.topLine, isRTL && styles.rowReverse]}><Text style={[styles.title, text(colors.text)]}>{language === "ar" ? "المعلمون" : "Teachers"}</Text><IconButton icon="add" label={language === "ar" ? "أضف معلماً" : "Add teacher"} onPress={() => router.push("/teacher/form" as never)} /></View></View>;
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={header} renderItem={({ item }) => { const next = nextFor(item.id); return <MotionPressable accessibilityRole="button" onPress={() => router.push(`/teacher/${item.id}` as never)} style={({ pressed }) => [styles.teacherCard, isRTL && styles.rowReverse, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: "#000", opacity: pressed ? 0.66 : 1 }]}><View style={[styles.avatar, { backgroundColor: colors.wash }]}><Text style={[styles.avatarText, { color: colors.tint }]}>{initial(item.name)}</Text></View><View style={styles.teacherCopy}><Text numberOfLines={1} style={[styles.teacherName, text(colors.text)]}>{item.name}</Text><Text numberOfLines={1} style={[styles.teacherSubjects, text(colors.muted)]}>{item.subjects.slice(0, 2).join(" · ")}</Text></View><View style={styles.nextCopy}><Text style={[styles.nextLabel, text(colors.muted)]}>{next ? (language === "ar" ? "الدرس القادم" : "Next Class") : (language === "ar" ? "لا يوجد قادم" : "No upcoming")}</Text>{next ? <Text style={[styles.nextTime, text(colors.text)]}>{formatTime(next.startTime, locale)}</Text> : null}</View><MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={18} color={colors.muted} /></MotionPressable>; }} ListEmptyComponent={<EmptyState icon="groups" title={language === "ar" ? "لا يوجد معلمون" : "No teachers yet"} message={language === "ar" ? "أضف معلماً للبدء." : "Add a teacher to begin."} actionLabel={language === "ar" ? "أضف معلماً" : "Add teacher"} onAction={() => router.push("/teacher/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 16 }, rowReverse: { flexDirection: "row-reverse" }, header: { marginBottom: 16, paddingTop: 6 }, topLine: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { fontSize: 21, fontWeight: "700", lineHeight: 27 }, teacherCard: { alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 12, marginBottom: 12, minHeight: 72, padding: 14, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, avatar: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, avatarText: { fontSize: 14, fontWeight: "600" }, teacherCopy: { flex: 1, gap: 2, minWidth: 0 }, teacherName: { fontSize: 14.5, fontWeight: "600", lineHeight: 20 }, teacherSubjects: { fontSize: 12, lineHeight: 17 }, nextCopy: { gap: 2, maxWidth: 80 }, nextLabel: { fontSize: 10.5, textAlign: "right" }, nextTime: { fontSize: 11.5, fontWeight: "600", textAlign: "right" } });
