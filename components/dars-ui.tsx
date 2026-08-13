import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatClassDateParts, formatTime, getRef } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import type { Book, DarsClass, Location, Teacher } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { useI18n } from "@/lib/i18n";
import { MotionPressable } from "@/components/motion-pressable";

type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

export function IconButton({ icon, label, onPress, tone = "quiet", fallbackToHomeWhenCannotGoBack = false }: { icon: MaterialIcon; label: string; onPress: () => void; tone?: "quiet" | "primary"; fallbackToHomeWhenCannotGoBack?: boolean }) {
  const colors = useColors(); const primary = tone === "primary";
  return <MotionPressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { haptic.light(); if (fallbackToHomeWhenCannotGoBack && !router.canGoBack()) { router.replace("/" as never); return; } onPress(); }} style={({ pressed }) => [styles.iconButton, { backgroundColor: primary ? colors.tint : colors.wash, opacity: pressed ? 0.68 : 1 }]}><MaterialIcons name={icon} size={20} color={primary ? colors.background : colors.tint} /></MotionPressable>;
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  const colors = useColors(); const { isRTL } = useI18n(); const writing = isRTL ? { textAlign: "right" as const, writingDirection: "rtl" as const } : null;
  return <View style={[styles.header, isRTL && styles.rowReverse]}><View style={styles.headerCopy}>{eyebrow ? <Text style={[styles.eyebrow, { color: colors.muted }, writing]}>{eyebrow}</Text> : null}<Text style={[styles.title, { color: colors.text }, writing]}>{title}</Text></View>{action}</View>;
}

export function SearchField({ value, onChangeText, placeholder = "Search" }: { value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <View style={[styles.search, isRTL && styles.rowReverse, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={19} color={colors.muted} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]} returnKeyType="done" /></View>;
}

export function FilterChips({ values, selected, onSelect, labels }: { values: string[]; selected: string; onSelect: (value: string) => void; labels?: Partial<Record<string, string>> }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <View style={[styles.chips, isRTL && styles.rowReverse]}>{values.map((item) => <MotionPressable key={item} onPress={() => { haptic.selection(); onSelect(item); }} style={({ pressed }) => [styles.chip, { backgroundColor: selected === item ? colors.tint : colors.wash, opacity: pressed ? 0.68 : 1 }]}><Text style={[styles.chipText, { color: selected === item ? colors.background : colors.muted }]}>{labels?.[item] ?? item}</Text></MotionPressable>)}</View>;
}

export function SubjectBadge({ label }: { label: string }) {
  const colors = useColors();
  return <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.badgeText, { color: colors.tint }]}>{label}</Text></View>;
}

export function ClassCard({ item, teachers, books, locations, onPress, compact = false }: { item: DarsClass; teachers: Teacher[]; books: Book[]; locations: Location[]; onPress?: () => void; compact?: boolean }) {
  const colors = useColors(); const { locale } = useDisplayPreferences(); const { isRTL, t } = useI18n(); const teacher = getRef(teachers, item.teacherId); const location = getRef(locations, item.locationId); const { weekday, day } = formatClassDateParts(item.date, locale); const navigate = onPress ?? (() => router.push(`/class/${item.id}` as never));
  return <MotionPressable accessibilityRole="button" onPress={() => { haptic.light(); navigate(); }} style={({ pressed }) => [styles.classCard, isRTL && styles.rowReverse, { borderColor: colors.border, opacity: pressed ? 0.66 : 1 }]}>
    <View style={styles.dateColumn}><Text style={[styles.dateTime, { color: colors.tint }]}>{formatTime(item.startTime, locale)}</Text><Text style={[styles.dateDay, { color: colors.muted }]}>{weekday}</Text><Text style={[styles.dateNumber, { color: colors.text }]}>{day}</Text></View>
    <View style={styles.classCopy}><View style={[styles.cardTopLine, isRTL && styles.rowReverse]}><Text numberOfLines={2} style={[styles.classTitle, { color: colors.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{item.title}</Text>{!compact ? <MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={18} color={colors.muted} /> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{teacher?.name ?? t("teacherPending")}</Text><View style={[styles.metaRow, isRTL && styles.rowReverse]}><MaterialIcons name="location-on" size={13} color={colors.muted} /><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{location?.name ?? item.city}</Text></View></View>
  </MotionPressable>;
}

export function DirectoryRow({ icon, title, subtitle, onPress, tag }: { icon: MaterialIcon; title: string; subtitle: string; onPress: () => void; tag?: string }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <MotionPressable onPress={() => { haptic.light(); onPress(); }} style={({ pressed }) => [styles.directoryRow, isRTL && styles.rowReverse, { borderColor: colors.border, opacity: pressed ? 0.66 : 1 }]}><View style={[styles.directoryIcon, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={19} color={colors.tint} /></View><View style={styles.directoryCopy}><View style={[styles.directoryTop, isRTL && styles.rowReverse]}><Text numberOfLines={1} style={[styles.directoryTitle, { color: colors.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{title}</Text>{tag ? <Text style={[styles.directoryTag, { color: colors.tint }]}>{tag}</Text> : null}</View><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{subtitle}</Text></View><MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={colors.muted} /></MotionPressable>;
}

export function EmptyState({ icon = "event-busy", title, message, actionLabel, onAction }: { icon?: MaterialIcon; title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={25} color={colors.tint} /></View><Text style={[styles.emptyTitle, { color: colors.text, writingDirection: isRTL ? "rtl" : "ltr" }]}>{title}</Text><Text style={[styles.emptyText, { color: colors.muted, writingDirection: isRTL ? "rtl" : "ltr" }]}>{message}</Text>{actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}</View>;
}

export function PrimaryButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: MaterialIcon; disabled?: boolean }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <MotionPressable disabled={disabled} onPress={() => { haptic.medium(); onPress(); }} style={({ pressed }) => [styles.primaryButton, isRTL && styles.rowReverse, { backgroundColor: colors.tint, opacity: disabled ? 0.4 : pressed ? 0.76 : 1 }]}>{icon ? <MaterialIcons name={icon} size={18} color={colors.background} /> : null}<Text style={[styles.primaryButtonText, { color: colors.background, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text></MotionPressable>;
}

export const styles = StyleSheet.create({
  rowReverse: { flexDirection: "row-reverse" }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }, headerCopy: { flex: 1, gap: 3 }, eyebrow: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.72 }, title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.8, lineHeight: 34 }, iconButton: { alignItems: "center", borderRadius: 12, height: 44, justifyContent: "center", width: 44 },
  search: { alignItems: "center", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, height: 50, paddingHorizontal: 14 }, searchInput: { flex: 1, fontSize: 15, height: "100%" }, chips: { flexDirection: "row", gap: 7 }, chip: { borderRadius: 999, minHeight: 33, paddingHorizontal: 13, paddingVertical: 8 }, chipText: { fontSize: 12, fontWeight: "700" },
  badge: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 }, badgeText: { fontSize: 10.5, fontWeight: "700" }, classCard: { borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 14, minHeight: 82 }, dateColumn: { alignItems: "center", justifyContent: "center", paddingHorizontal: 4, width: 58 }, dateDay: { fontSize: 9.5, fontWeight: "700", marginTop: 1, textTransform: "uppercase" }, dateNumber: { fontSize: 17, fontWeight: "700", lineHeight: 20 }, dateTime: { fontSize: 11.5, fontWeight: "800" }, classCopy: { flex: 1, gap: 3, justifyContent: "center", minWidth: 0, paddingEnd: 2, paddingVertical: 12 }, cardTopLine: { alignItems: "flex-start", flexDirection: "row", gap: 5, justifyContent: "space-between" }, classTitle: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 20 }, metaRow: { alignItems: "center", flexDirection: "row", gap: 5 }, metadata: { flex: 1, fontSize: 12, lineHeight: 16 }, bookMeta: { fontSize: 10.5, fontWeight: "700", marginTop: 1 },
  directoryRow: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 12, minHeight: 70, paddingVertical: 11 }, directoryIcon: { alignItems: "center", borderRadius: 12, height: 40, justifyContent: "center", width: 40 }, directoryCopy: { flex: 1, gap: 3, minWidth: 0 }, directoryTop: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" }, directoryTitle: { flex: 1, fontSize: 15.5, fontWeight: "700", lineHeight: 20 }, directoryTag: { fontSize: 10.5, fontWeight: "700" },
  empty: { alignItems: "center", gap: 9, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 42 }, emptyIcon: { alignItems: "center", borderRadius: 14, height: 44, justifyContent: "center", width: 44 }, emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" }, emptyText: { fontSize: 13.5, lineHeight: 20, maxWidth: 280, textAlign: "center" }, primaryButton: { alignItems: "center", alignSelf: "stretch", borderRadius: 12, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 52, paddingHorizontal: 20 }, primaryButtonText: { fontSize: 15, fontWeight: "800" },
});
