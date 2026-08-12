import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle, SearchField } from "@/components/dars-ui";
import { useDars } from "@/lib/dars-context";
import { getUpcomingClasses } from "@/lib/dars-utils";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeachersScreen() {
  const { teachers, classes } = useDars(); const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const list = useMemo(() => teachers.filter((teacher) => `${teacher.name} ${teacher.subjects.join(" ")}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [query, teachers]);
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Learn from your teachers" title="Scholars" action={<IconButton icon="person-add" label="Add teacher" tone="primary" onPress={() => router.push("/teacher/form" as never)} />} /><SearchField value={query} onChangeText={setQuery} placeholder="Search teachers or subjects" /></View>} renderItem={({ item }) => { const next = getUpcomingClasses(classes).find((entry) => entry.teacherId === item.id); return <DirectoryRow icon="school" title={item.name} subtitle={`${item.subjects.join(" · ")}${next ? ` · Next ${next.startTime}` : " · No class scheduled"}`} onPress={() => router.push(`/teacher/${item.id}` as never)} />; }} ListEmptyComponent={<EmptyState icon="school" title="No teachers found" message="Try another search, or add a new teacher to your directory." actionLabel="Add teacher" onAction={() => router.push("/teacher/form" as never)} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20 }, header: { gap: 16, marginBottom: 5 } });
