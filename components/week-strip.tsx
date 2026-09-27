import { StyleSheet, Text, View } from "react-native";
import { MotionPressable } from "@/components/motion-pressable";
import { radius, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import type { DarsClass } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const daysAround = (anchor: string) => {
  const base = new Date(`${anchor}T12:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index - 3);
    return date;
  });
};

export function WeekStrip({
  selectedDate,
  classes,
  onSelect,
}: {
  selectedDate: string;
  classes: DarsClass[];
  onSelect: (date: string) => void;
}) {
  const colors = useColors();
  const { locale } = useDisplayPreferences();
  const { isRTL } = useI18n();
  const today = iso(new Date());
  return (
    <View style={[styles.strip, isRTL && styles.rowReverse]}>
      {daysAround(selectedDate).map((date) => {
        const value = iso(date);
        const selected = value === selectedDate;
        const isToday = value === today;
        const hasClass = classes.some((item) => item.date === value && item.status === "upcoming");
        const numberColor = selected ? colors.onPrimary : isToday ? colors.tint : colors.text;
        return (
          <MotionPressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            onPress={() => onSelect(value)}
            style={styles.day}
          >
            <Text style={[type.caption, { color: selected || isToday ? colors.tint : colors.muted }]}>
              {date.toLocaleDateString(locale, { weekday: "short" })}
            </Text>
            <View style={[styles.number, selected && { backgroundColor: colors.tint }]}>
              <Text style={[type.numeric, { color: numberColor }]}>{date.getDate()}</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: hasClass ? colors.tint : "transparent" }]} />
          </MotionPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: "row", justifyContent: "space-between" },
  rowReverse: { flexDirection: "row-reverse" },
  day: { alignItems: "center", borderRadius: radius.md, flex: 1, gap: 6, overflow: "hidden", paddingVertical: 6 },
  number: { alignItems: "center", borderRadius: radius.pill, height: 38, justifyContent: "center", width: 38 },
  dot: { borderRadius: 3, height: 5, width: 5 },
});
