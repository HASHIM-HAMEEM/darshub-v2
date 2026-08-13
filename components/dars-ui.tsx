import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatTime, getRef } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import type { Book, DarsClass, Location, Teacher } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import { useI18n } from "@/lib/i18n";
import { MotionPressable } from "@/components/motion-pressable";

type MaterialIcon = React.ComponentProps<typeof MaterialIcons>["name"];

export function IconButton({ icon, label, onPress, tone = "quiet", fallbackToHomeWhenCannotGoBack = false }: { icon: MaterialIcon; label: string; onPress: () => void; tone?: "quiet" | "primary"; fallbackToHomeWhenCannotGoBack?: boolean }) {
  const colors = useColors(); const primary = tone === "primary";
  return <MotionPressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { haptic.light(); if (fallbackToHomeWhenCannotGoBack && !router.canGoBack()) { router.replace("/(tabs)" as never); return; } onPress(); }} style={({ pressed }) => [styles.iconButton, { backgroundColor: primary ? colors.wash : "transparent", opacity: pressed ? 0.58 : 1 }]}><MaterialIcons name={icon} size={21} color={colors.tint} /></MotionPressable>;
}

export function ScreenTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  const colors = useColors(); const { isRTL } = useI18n(); const writing = isRTL ? { textAlign: "right" as const, writingDirection: "rtl" as const } : null;
  return <View style={[styles.header, isRTL && styles.rowReverse]}><View style={styles.headerCopy}>{eyebrow ? <Text style={[styles.eyebrow, { color: colors.muted }, writing]}>{eyebrow}</Text> : null}<Text style={[styles.title, { color: colors.text }, writing]}>{title}</Text></View>{action}</View>;
}

export function SearchField({ value, onChangeText, placeholder = "Search" }: { value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <View style={[styles.search, isRTL && styles.rowReverse, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: "#000" }]}><MaterialIcons name="search" size={18} color={colors.muted} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]} returnKeyType="done" /></View>;
}

export function FilterChips({ values, selected, onSelect, labels }: { values: string[]; selected: string; onSelect: (value: string) => void; labels?: Partial<Record<string, string>> }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <View style={[styles.chips, isRTL && styles.rowReverse]}>{values.map((item) => <MotionPressable key={item} onPress={() => { haptic.selection(); onSelect(item); }} style={({ pressed }) => [styles.chip, { backgroundColor: selected === item ? colors.tint : colors.surface, borderColor: selected === item ? colors.tint : colors.border, opacity: pressed ? 0.68 : 1 }]}><Text style={[styles.chipText, { color: selected === item ? colors.background : colors.muted }]}>{labels?.[item] ?? item}</Text></MotionPressable>)}</View>;
}

export function SubjectBadge({ label }: { label: string }) { const colors = useColors(); return <View style={[styles.badge, { backgroundColor: colors.wash }]}><Text style={[styles.badgeText, { color: colors.tint }]}>{label}</Text></View>; }

export function ClassCard({ item, teachers, books, locations, onPress, compact = false }: { item: DarsClass; teachers: Teacher[]; books: Book[]; locations: Location[]; onPress?: () => void; compact?: boolean }) {
  const colors = useColors(); const { locale } = useDisplayPreferences(); const { isRTL, language } = useI18n(); const teacher = getRef(teachers, item.teacherId); const book = getRef(books, item.bookId); const location = getRef(locations, item.locationId); const navigate = onPress ?? (() => router.push(`/class/${item.id}` as never));
  const status = item.status === "completed" ? (language === "ar" ? "مكتمل" : "Completed") : item.status === "cancelled" ? (language === "ar" ? "ملغي" : "Cancelled") : (language === "ar" ? "قادم" : "Upcoming");
  return <MotionPressable accessibilityRole="button" onPress={() => { haptic.light(); navigate(); }} style={({ pressed }) => [styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: "#000", opacity: pressed ? 0.68 : 1 }]}><View style={[styles.cardHeader, isRTL && styles.rowReverse]}><View style={styles.classCopy}><Text numberOfLines={2} style={[styles.classTitle, { color: colors.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{item.title}</Text><Text numberOfLines={1} style={[styles.classSubtitle, { color: colors.muted, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{item.subject}{teacher?.name ? ` · ${teacher.name}` : ""}</Text></View><View style={[styles.statusBadge, { backgroundColor: item.status === "upcoming" ? colors.wash : colors.background }]}><Text style={[styles.statusText, { color: item.status === "upcoming" ? colors.tint : colors.muted, writingDirection: isRTL ? "rtl" : "ltr" }]}>{status}</Text></View></View><Detail icon="schedule" label={`${formatTime(item.startTime, locale)}${item.endTime ? ` – ${formatTime(item.endTime, locale)}` : ""}`} /><Detail icon="location-on" label={location?.name ?? item.city} />{!compact && book ? <Detail icon="menu-book" label={book.name} /> : null}</MotionPressable>;
}

function Detail({ icon, label }: { icon: MaterialIcon; label: string }) { const colors = useColors(); const { isRTL } = useI18n(); return <View style={[styles.cardDetail, isRTL && styles.rowReverse]}><MaterialIcons name={icon} size={16} color={colors.muted} /><Text numberOfLines={1} style={[styles.detailText, { color: colors.muted, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text></View>; }

export function DirectoryRow({ icon, title, subtitle, onPress, tag }: { icon: MaterialIcon; title: string; subtitle: string; onPress: () => void; tag?: string }) {
  const colors = useColors(); const { isRTL } = useI18n();
  return <MotionPressable onPress={() => { haptic.light(); onPress(); }} style={({ pressed }) => [styles.directoryCard, isRTL && styles.rowReverse, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: "#000", opacity: pressed ? 0.66 : 1 }]}><View style={[styles.directoryIcon, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={19} color={colors.tint} /></View><View style={styles.directoryCopy}><Text numberOfLines={1} style={[styles.directoryTitle, { color: colors.text, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{title}</Text><Text numberOfLines={1} style={[styles.metadata, { color: colors.muted, textAlign: isRTL ? "right" : "left", writingDirection: isRTL ? "rtl" : "ltr" }]}>{subtitle}</Text></View>{tag ? <Text style={[styles.directoryTag, { color: colors.muted, writingDirection: isRTL ? "rtl" : "ltr" }]}>{tag}</Text> : null}<MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={18} color={colors.muted} /></MotionPressable>;
}

export function EmptyState({ icon = "event-busy", title, message, actionLabel, onAction }: { icon?: MaterialIcon; title: string; message: string; actionLabel?: string; onAction?: () => void }) { const colors = useColors(); const { isRTL } = useI18n(); return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={24} color={colors.tint} /></View><Text style={[styles.emptyTitle, { color: colors.text, writingDirection: isRTL ? "rtl" : "ltr" }]}>{title}</Text><Text style={[styles.emptyText, { color: colors.muted, writingDirection: isRTL ? "rtl" : "ltr" }]}>{message}</Text>{actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}</View>; }

export function PrimaryButton({ label, onPress, icon, disabled = false }: { label: string; onPress: () => void; icon?: MaterialIcon; disabled?: boolean }) { const colors = useColors(); const { isRTL } = useI18n(); return <MotionPressable disabled={disabled} onPress={() => { haptic.medium(); onPress(); }} style={({ pressed }) => [styles.primaryButton, isRTL && styles.rowReverse, { backgroundColor: colors.tint, opacity: disabled ? 0.4 : pressed ? 0.76 : 1 }]}>{icon ? <MaterialIcons name={icon} size={18} color={colors.background} /> : null}<Text style={[styles.primaryButtonText, { color: colors.background, writingDirection: isRTL ? "rtl" : "ltr" }]}>{label}</Text></MotionPressable>; }

export const styles = StyleSheet.create({
  rowReverse: { flexDirection: "row-reverse" }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 16, minHeight: 40 }, headerCopy: { flex: 1, gap: 2 }, eyebrow: { fontSize: 11, fontWeight: "600" }, title: { fontSize: 21, fontWeight: "700", lineHeight: 27 }, iconButton: { alignItems: "center", borderRadius: 16, height: 40, justifyContent: "center", width: 40 },
  search: { alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 8, minHeight: 48, paddingHorizontal: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, searchInput: { flex: 1, fontSize: 14, height: "100%" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, minHeight: 32, paddingHorizontal: 14, paddingVertical: 7 }, chipText: { fontSize: 12, fontWeight: "500" },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }, badgeText: { fontSize: 10.5, fontWeight: "600" }, classCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 6, padding: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, cardHeader: { alignItems: "flex-start", flexDirection: "row", gap: 10, justifyContent: "space-between", marginBottom: 2 }, classCopy: { flex: 1, minWidth: 0 }, classTitle: { fontSize: 16, fontWeight: "600", lineHeight: 21 }, classSubtitle: { fontSize: 13, marginTop: 2 }, statusBadge: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 }, statusText: { fontSize: 10.5, fontWeight: "600" }, cardDetail: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 1 }, detailText: { flex: 1, fontSize: 13 },
  directoryCard: { alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 12, marginBottom: 12, minHeight: 72, padding: 15, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, directoryIcon: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, directoryCopy: { flex: 1, gap: 2, minWidth: 0 }, directoryTitle: { fontSize: 14.5, fontWeight: "600", lineHeight: 20 }, metadata: { fontSize: 12.5, lineHeight: 18 }, directoryTag: { fontSize: 11, fontWeight: "500" },
  empty: { alignItems: "center", gap: 9, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 42 }, emptyIcon: { alignItems: "center", borderRadius: 16, height: 48, justifyContent: "center", width: 48 }, emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" }, emptyText: { fontSize: 13.5, lineHeight: 20, maxWidth: 280, textAlign: "center" }, primaryButton: { alignItems: "center", alignSelf: "stretch", borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 46, paddingHorizontal: 16 }, primaryButtonText: { fontSize: 14, fontWeight: "600" },
});
