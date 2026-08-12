import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime, getRef } from "@/lib/dars-utils";
import type { Book, DarsClass, Location, Teacher } from "@/lib/types/dars";

type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

export function IconButton({ icon, label, onPress, tone = "quiet" }: { icon: MaterialIcon; label: string; onPress: () => void; tone?: "quiet" | "primary" }) {
  const colors = useColors();
  const primary = tone === "primary";
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: primary ? colors.tint : colors.surface, opacity: pressed ? 0.72 : 1 }]}>
    <MaterialIcons name={icon} size={20} color={primary ? colors.background : colors.text} />
  </Pressable>;
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  const colors = useColors();
  return <View style={styles.header}><View style={styles.headerCopy}>{eyebrow ? <Text style={[styles.eyebrow, { color: colors.tint }]}>{eyebrow}</Text> : null}<Text style={[styles.title, { color: colors.text }]}>{title}</Text></View>{action}</View>;
}

export function SearchField({ value, onChangeText, placeholder = "Search classes" }: { value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  const colors = useColors();
  return <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={20} color={colors.muted} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} returnKeyType="done" /></View>;
}

export function FilterChips({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (value: string) => void }) {
  const colors = useColors();
  return <View style={styles.chips}>{values.map((item) => <Pressable key={item} onPress={() => onSelect(item)} style={({ pressed }) => [styles.chip, { backgroundColor: selected === item ? colors.tint : colors.surface, borderColor: selected === item ? colors.tint : colors.border, opacity: pressed ? 0.74 : 1 }]}><Text style={[styles.chipText, { color: selected === item ? colors.background : colors.muted }]}>{item}</Text></Pressable>)}</View>;
}

export function SubjectBadge({ label }: { label: string }) {
  const colors = useColors();
  return <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.badgeText, { color: colors.tint }]}>{label}</Text></View>;
}

export function ClassCard({ item, teachers, books, locations, onPress, compact = false }: { item: DarsClass; teachers: Teacher[]; books: Book[]; locations: Location[]; onPress?: () => void; compact?: boolean }) {
  const colors = useColors();
  const teacher = getRef(teachers, item.teacherId);
  const book = getRef(books, item.bookId);
  const location = getRef(locations, item.locationId);
  const statusColor = item.status === "completed" ? colors.success : item.status === "cancelled" ? colors.error : colors.tint;
  return <Pressable accessibilityRole="button" onPress={onPress ?? (() => router.push(`/class/${item.id}` as never))} style={({ pressed }) => [styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
    <View style={[styles.datePill, { backgroundColor: statusColor }]}><Text style={[styles.datePillDay, { color: colors.background }]}>{formatClassDate(item.date).split(" ")[0]}</Text><Text style={[styles.datePillNumber, { color: colors.background }]}>{formatClassDate(item.date).split(" ").slice(-1)[0]}</Text></View>
    <View style={styles.classCopy}><View style={styles.cardTopLine}><Text numberOfLines={1} style={[styles.classTitle, { color: colors.text }]}>{item.title}</Text>{!compact ? <SubjectBadge label={item.subject} /> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{teacher?.name ?? "Teacher pending"} · {book?.name ?? "Book pending"}</Text><View style={styles.metaRow}><MaterialIcons name="schedule" size={15} color={colors.muted} /><Text style={[styles.metadata, { color: colors.muted }]}>{formatTime(item.startTime)}{item.endTime ? ` – ${formatTime(item.endTime)}` : ""}</Text><View style={styles.metaDivider} /><MaterialIcons name="location-on" size={15} color={colors.muted} /><Text numberOfLines={1} style={[styles.metadata, styles.locationText, { color: colors.muted }]}>{location?.name ?? item.city}</Text></View></View>
    <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
  </Pressable>;
}

export function DirectoryRow({ icon, title, subtitle, onPress, tag }: { icon: MaterialIcon; title: string; subtitle: string; onPress: () => void; tag?: string }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.directoryRow, { borderBottomColor: colors.border, opacity: pressed ? 0.68 : 1 }]}><View style={[styles.directoryIcon, { backgroundColor: colors.surface }]}><MaterialIcons name={icon} size={21} color={colors.tint} /></View><View style={styles.directoryCopy}><View style={styles.directoryTop}>{<Text numberOfLines={1} style={[styles.directoryTitle, { color: colors.text }]}>{title}</Text>}{tag ? <Text style={[styles.directoryTag, { color: colors.tint }]}>{tag}</Text> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{subtitle}</Text></View><MaterialIcons name="chevron-right" size={21} color={colors.muted} /></Pressable>;
}

export function EmptyState({ icon = "event-busy", title, message, actionLabel, onAction }: { icon?: MaterialIcon; title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}><MaterialIcons name={icon} size={30} color={colors.tint} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.emptyText, { color: colors.muted }]}>{message}</Text>{actionLabel && onAction ? <Pressable onPress={onAction} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.tint, opacity: pressed ? 0.74 : 1 }]}><Text style={[styles.primaryButtonText, { color: colors.background }]}>{actionLabel}</Text></Pressable> : null}</View>;
}

export function PrimaryButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: MaterialIcon; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.tint, opacity: disabled ? 0.45 : pressed ? 0.74 : 1 }]}>{icon ? <MaterialIcons name={icon} size={20} color={colors.background} /> : null}<Text style={[styles.primaryButtonText, { color: colors.background }]}>{label}</Text></Pressable>;
}

export const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }, headerCopy: { flex: 1, gap: 2 }, eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" }, title: { fontSize: 30, fontWeight: "700", letterSpacing: -0.7, lineHeight: 37 }, iconButton: { alignItems: "center", borderRadius: 18, height: 42, justifyContent: "center", marginLeft: 12, width: 42 },
  search: { alignItems: "center", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, height: 48, paddingHorizontal: 14 }, searchInput: { flex: 1, fontSize: 15, height: "100%" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderRadius: 16, borderWidth: 1, minHeight: 34, paddingHorizontal: 13, paddingVertical: 8 }, chipText: { fontSize: 13, fontWeight: "700" },
  badge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 }, badgeText: { fontSize: 11, fontWeight: "700" }, classCard: { alignItems: "center", borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 108, padding: 13 }, datePill: { alignItems: "center", borderRadius: 14, height: 61, justifyContent: "center", width: 48 }, datePillDay: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" }, datePillNumber: { fontSize: 21, fontWeight: "800", lineHeight: 24 }, classCopy: { flex: 1, gap: 5, minWidth: 0 }, cardTopLine: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" }, classTitle: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 20 }, metadata: { fontSize: 12.5, lineHeight: 18 }, metaRow: { alignItems: "center", flexDirection: "row", gap: 4 }, metaDivider: { backgroundColor: "#B9C2BA", height: 13, marginHorizontal: 3, width: 1 }, locationText: { flex: 1 },
  directoryRow: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 77, paddingVertical: 10 }, directoryIcon: { alignItems: "center", borderRadius: 15, height: 46, justifyContent: "center", width: 46 }, directoryCopy: { flex: 1, gap: 3, minWidth: 0 }, directoryTop: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" }, directoryTitle: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 20 }, directoryTag: { fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", gap: 8, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 44 }, emptyIcon: { alignItems: "center", borderRadius: 24, height: 58, justifyContent: "center", marginBottom: 6, width: 58 }, emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" }, emptyText: { fontSize: 14, lineHeight: 20, maxWidth: 280, textAlign: "center" }, primaryButton: { alignItems: "center", alignSelf: "stretch", borderRadius: 16, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 50, paddingHorizontal: 18 }, primaryButtonText: { fontSize: 15, fontWeight: "800" },
});
