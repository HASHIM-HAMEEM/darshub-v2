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
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: primary ? colors.text : "transparent", borderColor: primary ? colors.text : colors.border, opacity: pressed ? 0.52 : 1 }]}><MaterialIcons name={icon} size={20} color={primary ? colors.background : colors.text} /></Pressable>;
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
  return <View style={styles.chips}>{values.map((item) => <Pressable key={item} onPress={() => onSelect(item)} style={({ pressed }) => [styles.chip, { borderBottomColor: selected === item ? colors.text : "transparent", opacity: pressed ? 0.52 : 1 }]}><Text style={[styles.chipText, { color: selected === item ? colors.text : colors.muted }]}>{item}</Text></Pressable>)}</View>;
}

export function SubjectBadge({ label }: { label: string }) {
  const colors = useColors();
  return <Text style={[styles.badgeText, { color: colors.muted }]}>{label}</Text>;
}

export function ClassCard({ item, teachers, books, locations, onPress, compact = false }: { item: DarsClass; teachers: Teacher[]; books: Book[]; locations: Location[]; onPress?: () => void; compact?: boolean }) {
  const colors = useColors();
  const teacher = getRef(teachers, item.teacherId);
  const book = getRef(books, item.bookId);
  const location = getRef(locations, item.locationId);
  const [weekday, month, number] = formatClassDate(item.date).split(" ");
  return <Pressable accessibilityRole="button" onPress={onPress ?? (() => router.push(`/class/${item.id}` as never))} style={({ pressed }) => [styles.classCard, { borderBottomColor: colors.border, opacity: pressed ? 0.54 : 1 }]}>
    <View style={styles.dateColumn}><Text style={[styles.dateDay, { color: colors.muted }]}>{weekday}</Text><Text style={[styles.dateNumber, { color: colors.text }]}>{number ?? month}</Text></View>
    <View style={styles.classCopy}><View style={styles.cardTopLine}><Text numberOfLines={1} style={[styles.classTitle, { color: colors.text }]}>{item.title}</Text>{!compact ? <SubjectBadge label={item.subject} /> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{teacher?.name ?? "Teacher pending"}{book ? ` · ${book.name}` : ""}</Text><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{formatTime(item.startTime)}{item.endTime ? ` — ${formatTime(item.endTime)}` : ""} · {location?.name ?? item.city}</Text></View>
    <MaterialIcons name="arrow-forward" size={17} color={colors.muted} />
  </Pressable>;
}

export function DirectoryRow({ icon, title, subtitle, onPress, tag }: { icon: MaterialIcon; title: string; subtitle: string; onPress: () => void; tag?: string }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.directoryRow, { borderBottomColor: colors.border, opacity: pressed ? 0.54 : 1 }]}><MaterialIcons name={icon} size={19} color={colors.text} /><View style={styles.directoryCopy}><View style={styles.directoryTop}><Text numberOfLines={1} style={[styles.directoryTitle, { color: colors.text }]}>{title}</Text>{tag ? <Text style={[styles.directoryTag, { color: colors.muted }]}>{tag}</Text> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted }]}>{subtitle}</Text></View><MaterialIcons name="chevron-right" size={20} color={colors.muted} /></Pressable>;
}

export function EmptyState({ icon = "event-busy", title, message, actionLabel, onAction }: { icon?: MaterialIcon; title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors();
  return <View style={styles.empty}><MaterialIcons name={icon} size={27} color={colors.muted} /><Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.emptyText, { color: colors.muted }]}>{message}</Text>{actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}</View>;
}

export function PrimaryButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: MaterialIcon; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.text, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 }]}>{icon ? <MaterialIcons name={icon} size={18} color={colors.background} /> : null}<Text style={[styles.primaryButtonText, { color: colors.background }]}>{label}</Text></Pressable>;
}

export const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }, headerCopy: { flex: 1, gap: 2 }, eyebrow: { fontSize: 12, fontWeight: "500", letterSpacing: 0.1 }, title: { fontSize: 28, fontWeight: "500", letterSpacing: -1.1, lineHeight: 34 }, iconButton: { alignItems: "center", borderRadius: 17, borderWidth: 1, height: 42, justifyContent: "center", marginLeft: 14, width: 42 },
  search: { alignItems: "center", borderRadius: 22, borderWidth: 1, flexDirection: "row", gap: 9, height: 44, paddingHorizontal: 14 }, searchInput: { flex: 1, fontSize: 15, height: "100%" }, chips: { alignItems: "center", flexDirection: "row", gap: 19 }, chip: { borderBottomWidth: 1.5, paddingBottom: 5 }, chipText: { fontSize: 13, fontWeight: "600" },
  badgeText: { fontSize: 11, fontWeight: "500" }, classCard: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", gap: 13, minHeight: 86, paddingVertical: 14 }, dateColumn: { alignItems: "flex-start", width: 35 }, dateDay: { fontSize: 10, fontWeight: "600", textTransform: "uppercase" }, dateNumber: { fontSize: 19, fontWeight: "500", letterSpacing: -0.3, lineHeight: 23 }, classCopy: { flex: 1, gap: 3, minWidth: 0 }, cardTopLine: { alignItems: "baseline", flexDirection: "row", gap: 8, justifyContent: "space-between" }, classTitle: { flex: 1, fontSize: 15, fontWeight: "600", lineHeight: 20 }, metadata: { fontSize: 12, lineHeight: 17 },
  directoryRow: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 72, paddingVertical: 12 }, directoryCopy: { flex: 1, gap: 3, minWidth: 0 }, directoryTop: { alignItems: "baseline", flexDirection: "row", gap: 8, justifyContent: "space-between" }, directoryTitle: { flex: 1, fontSize: 16, fontWeight: "500", lineHeight: 21 }, directoryTag: { fontSize: 11, fontWeight: "500" },
  empty: { alignItems: "center", gap: 9, justifyContent: "center", paddingHorizontal: 34, paddingVertical: 58 }, emptyTitle: { fontSize: 18, fontWeight: "500", textAlign: "center" }, emptyText: { fontSize: 14, lineHeight: 20, maxWidth: 280, textAlign: "center" }, primaryButton: { alignItems: "center", alignSelf: "flex-start", borderRadius: 999, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 48, paddingHorizontal: 20 }, primaryButtonText: { fontSize: 15, fontWeight: "700" },
});
