import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, IconButton, ScreenTitle, SubjectBadge } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { goBackOrHome } from "@/lib/navigation";

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const colors = useColors(); const { teachers, classes, books, locations } = useDars(); const teacher = teachers.find((item) => item.id === id); const linked = classes.filter((item) => item.teacherId === id);
  if (!teacher) return <ScreenContainer><EmptyState title="Teacher not found" message="This teacher is no longer in your directory." actionLabel="Back to teachers" onAction={() => router.replace("/(tabs)/teachers" as never)} /></ScreenContainer>;
  return <ScreenContainer><FlatList data={linked} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <View style={styles.item}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Teacher profile" title={teacher.name} action={<IconButton icon="close" label="Close teacher" onPress={goBackOrHome} />} /><View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.subjects}>{teacher.subjects.map((subject) => <SubjectBadge key={subject} label={subject} />)}</View>{teacher.mainLocation ? <Text style={[styles.location, { color: colors.muted }]}>{teacher.mainLocation}</Text> : null}{teacher.bio ? <Text style={[styles.bio, { color: colors.text }]}>{teacher.bio}</Text> : null}</View><Text style={[styles.heading, { color: colors.text }]}>Classes with {teacher.title ?? ""} {teacher.name}</Text></View>} ListEmptyComponent={<EmptyState title="No linked classes" message="When a class is scheduled with this teacher, it will appear here." />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, paddingBottom: 36 }, header: { gap: 16, paddingBottom: 8 }, hero: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 12, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, subjects: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, location: { fontSize: 13 }, bio: { fontSize: 13.5, lineHeight: 20 }, heading: { fontSize: 14, fontWeight: "600", marginTop: 2 }, item: { marginTop: 12 } });
