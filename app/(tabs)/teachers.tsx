import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState, IconButton, ScreenTitle, SearchField } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { formatTime, getUpcomingClasses } from "@/lib/dars-utils";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initial = (name: string) => name.replace(/^(Shaykh|Ustadh)\s+/i, "").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

export default function TeachersScreen() {
  const colors = useColors(); const { teachers, classes } = useDars(); const insets = useSafeAreaInsets(); const [query, setQuery] = useState(""); const list = useMemo(() => teachers.filter((teacher) => `${teacher.name} ${teacher.subjects.join(" ")}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [query, teachers]);
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Learn with the best" title="Teachers" action={<IconButton icon="add" label="Add teacher" tone="primary" onPress={() => router.push("/teacher/form" as never)} />} /><SearchField value={query} onChangeText={setQuery} placeholder="Search teachers or subjects" /></View>} renderItem={({ item }) => { const next = getUpcomingClasses(classes).find((entry) => entry.teacherId === item.id); return <Pressable onPress={() => router.push(`/teacher/${item.id}` as never)} style={({ pressed }) => [styles.teacherCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.74 : 1, transform: [{ scale: pressed ? 0.987 : 1 }] }]}><View style={[styles.avatar, { backgroundColor: colors.background }]}><Text style={[styles.avatarText, { color: colors.tint }]}>{initial(item.name)}</Text></View><View style={styles.teacherCopy}><View style={styles.teacherTop}><Text style={[styles.teacherName, { color: colors.text }]}>{item.name}</Text><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></View><Text style={[styles.teacherSubjects, { color: colors.muted }]}>{item.subjects.join(", ")}</Text><Text style={[styles.nextText, { color: colors.tint }]}>{next ? `Next: ${next.title} · ${formatTime(next.startTime)}` : "No upcoming class"}</Text></View></Pressable>; }} ListEmptyComponent={<EmptyState icon="groups" title="No teachers found" message="Try another search, or add a teacher to your directory." actionLabel="Add teacher" onAction={() => router.push("/teacher/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 18 }, header: { gap: 15, marginBottom: 12 }, teacherCard: { alignItems: "center", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 12, marginBottom: 10, minHeight: 91, padding: 12 }, avatar: { alignItems: "center", borderRadius: 30, height: 58, justifyContent: "center", width: 58 }, avatarText: { fontSize: 17, fontWeight: "800" }, teacherCopy: { flex: 1, gap: 4, minWidth: 0 }, teacherTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, teacherName: { flex: 1, fontSize: 15, fontWeight: "800" }, teacherSubjects: { fontSize: 11.5, lineHeight: 16 }, nextText: { fontSize: 11.5, fontWeight: "600", lineHeight: 16 } });
