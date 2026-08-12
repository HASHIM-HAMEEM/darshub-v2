import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState, IconButton, PrimaryButton, ScreenTitle, SubjectBadge } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime, getRef } from "@/lib/dars-utils";
import { useDars } from "@/lib/dars-context";

function DetailLine({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; value: string }) {
  const colors = useColors();
  return <View style={styles.detailLine}><View style={[styles.detailIcon, { backgroundColor: colors.surface }]}><MaterialIcons name={icon} size={19} color={colors.tint} /></View><View style={styles.detailCopy}><Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text><Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text></View></View>;
}

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { classes, teachers, books, locations, completeClass, deleteClass } = useDars();
  const item = classes.find((entry) => entry.id === id);
  if (!item) return <ScreenContainer><EmptyState title="Class not found" message="It may have been removed from your local schedule." actionLabel="Back to home" onAction={() => router.replace("/" as never)} /></ScreenContainer>;
  const teacher = getRef(teachers, item.teacherId);
  const book = getRef(books, item.bookId);
  const location = getRef(locations, item.locationId);
  const markComplete = () => { completeClass(item.id); Alert.alert("Marked completed", "This class is now recorded in your completed schedule."); };
  const remove = () => Alert.alert("Delete this class?", "This removes the dars from this device.", [{ text: "Keep class", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { deleteClass(item.id); router.replace("/" as never); } }]);
  const openMap = () => location?.mapLink ? Linking.openURL(location.mapLink) : Alert.alert("Map unavailable", "Add a map link to this location when map support is connected.");
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content}><ScreenTitle eyebrow={item.status === "completed" ? "Completed class" : item.status === "cancelled" ? "Cancelled class" : "Upcoming class"} title="Class details" action={<IconButton icon="close" label="Close details" onPress={() => router.back()} />} /><View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.heroTitleRow}><Text style={[styles.heroTitle, { color: colors.text }]}>{item.title}</Text><SubjectBadge label={item.subject} /></View><Text style={[styles.heroSubtitle, { color: colors.muted }]}>{teacher?.name ?? "Teacher pending"} · {book?.name ?? "Book pending"}</Text><View style={[styles.status, { backgroundColor: item.status === "completed" ? colors.success : item.status === "cancelled" ? colors.error : colors.tint }]}><Text style={[styles.statusText, { color: colors.background }]}>{item.status.toUpperCase()}</Text></View></View><View style={styles.details}><DetailLine icon="calendar-today" label="Date" value={formatClassDate(item.date)} /><DetailLine icon="schedule" label="Time" value={`${formatTime(item.startTime)}${item.endTime ? ` – ${formatTime(item.endTime)}` : ""}`} /><DetailLine icon="location-on" label="Location" value={`${location?.name ?? "Location pending"} · ${location?.area ?? item.city}`} /><DetailLine icon="person" label="Teacher" value={teacher?.name ?? "Teacher pending"} /><DetailLine icon="menu-book" label="Book" value={book?.name ?? "Book pending"} /><DetailLine icon="repeat" label="Class type" value={item.type === "recurring" ? item.recurrenceRule ?? "Recurring" : "One-time class"} /></View>{item.notes ? <View style={[styles.notes, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.notesLabel, { color: colors.tint }]}>NOTES</Text><Text style={[styles.notesText, { color: colors.text }]}>{item.notes}</Text></View> : null}<View style={styles.actions}><PrimaryButton label="Edit class" icon="edit" onPress={() => router.push({ pathname: "/class/form", params: { id: item.id } } as never)} /><View style={styles.actionRow}><IconButton icon="map" label="Open map" onPress={openMap} /><IconButton icon="share" label="Share class" onPress={() => Alert.alert("Sharing prepared", "Public class links are planned for a future version.")} /><IconButton icon="delete-outline" label="Delete class" onPress={remove} />{item.status === "upcoming" ? <View style={styles.completeWrap}><PrimaryButton label="Mark completed" icon="check-circle" onPress={markComplete} /></View> : null}</View></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 }, hero: { borderRadius: 22, borderWidth: 1, gap: 10, padding: 18 }, heroTitleRow: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between" }, heroTitle: { flex: 1, fontSize: 22, fontWeight: "800", lineHeight: 29 }, heroSubtitle: { fontSize: 14, lineHeight: 20 }, status: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 }, statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 }, details: { gap: 18, paddingHorizontal: 3, paddingVertical: 24 }, detailLine: { alignItems: "center", flexDirection: "row", gap: 12 }, detailIcon: { alignItems: "center", borderRadius: 14, height: 42, justifyContent: "center", width: 42 }, detailCopy: { flex: 1, gap: 2 }, detailLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" }, detailValue: { fontSize: 15, fontWeight: "600", lineHeight: 20 }, notes: { borderRadius: 18, borderWidth: 1, gap: 7, padding: 16 }, notesLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.75 }, notesText: { fontSize: 14, lineHeight: 21 }, actions: { gap: 12, marginTop: 24 }, actionRow: { alignItems: "center", flexDirection: "row", gap: 10 }, completeWrap: { flex: 1 },
});
