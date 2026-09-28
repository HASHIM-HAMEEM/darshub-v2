import { StyleSheet, Text, View } from "react-native";
import { HighlightBlob, ScribbleCircle } from "@/components/doodle";
import { MotionPressable } from "@/components/motion-pressable";
import { fonts, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
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
        const count = classes.filter((item) => item.date === value && item.status === "upcoming").length;
        return (
          <MotionPressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            squish={0.86}
            tilt={-6}
            onPress={() => {
              haptic.selection();
              onSelect(value);
            }}
            style={styles.day}
          >
            <Text style={[type.caption, { color: selected || isToday ? colors.text : colors.muted }]}>
              {date.toLocaleDateString(locale, { weekday: "short" })}
            </Text>
            <View style={styles.number}>
              {selected ? (
                <View style={styles.blob}>
                  <HighlightBlob width={38} height={38} seed={date.getDate()} />
                </View>
              ) : null}
              <ScribbleCircle size={42} active={selected || isToday} color={selected ? colors.onHighlight : colors.tint} seed={date.getDate() + 2} strokeWidth={selected ? 2.4 : 1.6} />
              <Text style={[styles.numeral, { color: selected ? colors.onHighlight : colors.text }]}>{date.getDate()}</Text>
            </View>
            <View style={styles.dots}>
              {Array.from({ length: Math.min(count, 3) }, (_, index) => (
                <View key={index} style={[styles.dot, { backgroundColor: colors.tint }]} />
              ))}
            </View>
          </MotionPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: "row", justifyContent: "space-between" },
  rowReverse: { flexDirection: "row-reverse" },
  day: { alignItems: "center", flex: 1, gap: 4, paddingVertical: 6 },
  number: { alignItems: "center", height: 42, justifyContent: "center", width: 42 },
  blob: { left: 2, position: "absolute", top: 2 },
  numeral: { fontFamily: fonts.hand, fontSize: 24, lineHeight: 28 },
  dots: { flexDirection: "row", gap: 3, height: 6 },
  dot: { borderRadius: 3, height: 5, transform: [{ rotate: "20deg" }], width: 5 },
});
