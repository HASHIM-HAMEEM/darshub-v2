import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatClassDate, formatTime, getRef } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import type { Book, DarsClass, Location, Teacher } from "@/lib/types/dars";

type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

export function IconButton({ icon, label, onPress, tone = "quiet" }: { icon: MaterialIcon; label: string; onPress: () => void; tone?: "quiet" | "primary" }) {
  const colors = useColors(); const primary = tone === "primary";
  const closeStyleAction = icon === "close" || label.toLowerCase().startsWith("close");
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { haptic.light(); if (closeStyleAction && !router.canGoBack()) { router.replace("/" as never); return; } onPress(); }} style={({ pressed }) => [styles.iconButton, { backgroundColor: primary ? colors.tint : colors.surface, borderColor: primary ? colors.tint : colors.border, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }]}><MaterialIcons name={icon} size={20} color={primary ? colors.background : colors.tint} /></Pressable>;
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  const colors = useColors();
  return <View style={styles.header}><View style={styles.headerCopy}>{eyebrow ? <Text style={[styles.eyebrow, { color: colors.muted }]}>{eyebrow}</Text> : null}<Text style={[styles.title, { color: colors.text }]}>{title}</Text></View>{action}</View>;
}

export function SearchField({ value, onChangeText, placeholder = "Search" }: { value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  const colors = useColors();
  return <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={19} color={colors.muted} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text }]} returnKeyType="done" /></View>;
}

export function FilterChips({ values, selected, onSelect }: { values: string[]; selected: string; onSelect: (value: string) => void }) {
  const colors = useColors();
  return <View style={styles.chips}>{values.map((item) => <Pressable key={item} onPress={() => { haptic.selection(); onSelect(item); }} style={({ pressed }) => [styles.chip, { backgroundColor: selected === item ? colors.tint : colors.surface, borderColor: selected === item ? colors.tint : colors.border, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}><Text style={[styles.chipText, { color: selected === item ? colors.background : colors.muted }]}>{item}</Text></Pressable>)}</View>;
}

export function SubjectBadge({ label }: { label: string }) {
  const colors = useColors();
  return <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.badgeText, { color: colors.tint }]}>{label}</Text></View>;
}

export function ClassCard({ item, teachers, books, locations, onPress, compact = false }: { item: DarsClass; teachers: Teacher[]; books: Book[]; locations: Location[]; onPress?: () => void; compact?: boolean }) {
  const colors = useColors(); const teacher = getRef(teachers, item.teacherId); const book = getRef(books, item.bookId); const location = getRef(locations, item.locationId); const [weekday, , number] = formatClassDate(item.date).split(" "); const navigate = onPress ?? (() => router.push(`/class/${item.id}` as never));
  return <Pressable accessibilityRole="button" onPress={() => { haptic.light(); navigate(); }} style={({ pressed }) => [styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.987 : 1 }] }]}>
    <View style={[styles.dateColumn, { backgroundColor: colors.wash }]}><Text style={[styles.dateDay, { color: colors.muted }]}>{weekday}</Text><Text style={[styles.dateNumber, { color: colors.text }]}>{number}</Text><Text style={[styles.dateTime, { color: colors.muted }]}>{formatTime(item.startTime)}</Text></View>
    <View style={styles.classCopy}><View style={styles.cardTopLine}><Text numberOfLines={2} style={[styles.classTitle, { color: colors.text }]}>{item.title}</Text>{!compact ? <MaterialIcons name="chevron-right" size={18} color={colors.muted} /> : null}</View><View style={styles.metaRow}><MaterialIcons name="person-outline" size={13} color={colors.muted} /><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{teacher?.name ?? "Teacher pending"}</Text></View><View style={styles.metaRow}><MaterialIcons name="location-on" size={13} color={colors.muted} /><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{location?.name ?? item.city}</Text></View>{book ? <Text numberOfLines={1} style={[styles.bookMeta, { color: colors.tint }]}>{book.name}</Text> : null}</View>
  </Pressable>;
}

export function DirectoryRow({ icon, title, subtitle, onPress, tag }: { icon: MaterialIcon; title: string; subtitle: string; onPress: () => void; tag?: string }) {
  const colors = useColors();
  return <Pressable onPress={() => { haptic.light(); onPress(); }} style={({ pressed }) => [styles.directoryRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.987 : 1 }] }]}><View style={[styles.directoryIcon, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={19} color={colors.tint} /></View><View style={styles.directoryCopy}><View style={styles.directoryTop}><Text numberOfLines={1} style={[styles.directoryTitle, { color: colors.text }]}>{title}</Text>{tag ? <Text style={[styles.directoryTag, { color: colors.tint }]}>{tag}</Text> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{subtitle}</Text></View><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>;
}

export function EmptyState({ icon = "event-busy", title, message, actionLabel, onAction }: { icon?: MaterialIcon; title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={28} color={colors.tint} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.emptyText, { color: colors.muted }]}>{message}</Text>{actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}</View>;
}

export function PrimaryButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: MaterialIcon; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable disabled={disabled} onPress={() => { haptic.medium(); onPress(); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.tint, opacity: disabled ? 0.4 : pressed ? 0.74 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>{icon ? <MaterialIcons name={icon} size={18} color={colors.background} /> : null}<Text style={[styles.primaryButtonText, { color: colors.background }]}>{label}</Text></Pressable>;
}

export const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }, headerCopy: { flex: 1, gap: 2 }, eyebrow: { fontSize: 12, fontWeight: "600", letterSpacing: 0.1 }, title: { fontSize: 27, fontWeight: "700", letterSpacing: -0.7, lineHeight: 34 }, iconButton: { alignItems: "center", borderRadius: 15, borderWidth: 1, height: 44, justifyContent: "center", marginLeft: 14, width: 44 },
  search: { alignItems: "center", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 9, height: 46, paddingHorizontal: 13 }, searchInput: { flex: 1, fontSize: 15, height: "100%" }, chips: { flexDirection: "row", gap: 8 }, chip: { borderRadius: 999, borderWidth: 1, minHeight: 31, paddingHorizontal: 13, paddingVertical: 7 }, chipText: { fontSize: 12, fontWeight: "700" },
  badge: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 }, badgeText: { fontSize: 10.5, fontWeight: "700" }, classCard: { borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 102, overflow: "hidden" }, dateColumn: { alignItems: "center", justifyContent: "center", paddingHorizontal: 8, width: 61 }, dateDay: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" }, dateNumber: { fontSize: 20, fontWeight: "800", lineHeight: 24 }, dateTime: { fontSize: 10, fontWeight: "600", marginTop: 2 }, classCopy: { flex: 1, gap: 4, justifyContent: "center", minWidth: 0, paddingRight: 12, paddingVertical: 12 }, cardTopLine: { alignItems: "flex-start", flexDirection: "row", gap: 5, justifyContent: "space-between" }, classTitle: { flex: 1, fontSize: 14, fontWeight: "700", lineHeight: 19 }, metaRow: { alignItems: "center", flexDirection: "row", gap: 4 }, metadata: { flex: 1, fontSize: 11.5, lineHeight: 16 }, bookMeta: { fontSize: 10.5, fontWeight: "600", marginTop: 1 },
  directoryRow: { alignItems: "center", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 11, marginBottom: 10, minHeight: 70, paddingHorizontal: 12, paddingVertical: 10, shadowColor: "#183C30", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.045, shadowRadius: 6 }, directoryIcon: { alignItems: "center", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, directoryCopy: { flex: 1, gap: 3, minWidth: 0 }, directoryTop: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" }, directoryTitle: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 20 }, directoryTag: { fontSize: 10.5, fontWeight: "700" },
  empty: { alignItems: "center", gap: 8, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 52 }, emptyIcon: { alignItems: "center", borderRadius: 20, height: 52, justifyContent: "center", width: 52 }, emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" }, emptyText: { fontSize: 14, lineHeight: 20, maxWidth: 280, textAlign: "center" }, primaryButton: { alignItems: "center", alignSelf: "stretch", borderRadius: 13, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 49, paddingHorizontal: 20 }, primaryButtonText: { fontSize: 15, fontWeight: "800" },
});
