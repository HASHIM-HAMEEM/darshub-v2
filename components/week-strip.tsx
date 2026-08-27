import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useDisplayPreferences } from "@/lib/use-display-preferences";
import type { DarsClass } from "@/lib/types/dars";

const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const daysAround = (anchor: string) => { const base = new Date(`${anchor}T12:00:00`); return Array.from({ length: 7 }, (_, index) => { const date = new Date(base); date.setDate(base.getDate() + index - 3); return date; }); };

export function WeekStrip({ selectedDate, classes, onSelect }: { selectedDate: string; classes: DarsClass[]; onSelect: (date: string) => void }) {
  const colors = useColors(); const { locale } = useDisplayPreferences(); const today = iso(new Date());
  return <View style={styles.strip}>{daysAround(selectedDate).map((date) => { const value = iso(date); const selected = value === selectedDate; const hasClass = classes.some((item) => item.date === value && item.status === "upcoming"); return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={date.toLocaleDateString(locale, { weekday: "long", day: "numeric" })} onPress={() => onSelect(value)} style={({ pressed }) => [styles.day, selected && { backgroundColor: colors.surface, borderColor: colors.border }, { opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.dayName, { color: colors.muted }]}>{date.toLocaleDateString(locale, { weekday: "narrow" })}</Text><Text style={[styles.dayNumber, { color: colors.text }]}>{date.getDate()}</Text><View style={[styles.dot, { backgroundColor: hasClass ? colors.tint : "transparent" }]} />{value === today ? <View style={[styles.todayLine, { backgroundColor: colors.tint }]} /> : null}</Pressable>; })}</View>;
}

const styles = StyleSheet.create({ strip: { flexDirection: "row", gap: 6 }, day: { alignItems: "center", borderColor: "transparent", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: 5, minHeight: 56, overflow: "hidden", paddingVertical: 8 }, dayName: { fontSize: 9, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }, dayNumber: { fontFamily: "monospace", fontSize: 13, fontWeight: "500" }, dot: { borderRadius: 3, height: 5, width: 5 }, todayLine: { bottom: 0, height: 2, position: "absolute", width: 18 } });
