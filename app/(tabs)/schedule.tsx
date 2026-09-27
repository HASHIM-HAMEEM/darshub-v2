import { router } from "expo-router";
import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AgendaRow, EmptyState, Fab, IconButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { WeekStrip } from "@/components/week-strip";
import { directional, hairline, radius, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { formatClassDate, getUpcomingClasses } from "@/lib/dars-utils";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import type { DarsClass } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

type ScheduleGroup = { key: string; title: string; data: DarsClass[] };

const toIso = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const offsetIso = (anchor: string, days: number) => {
  const value = new Date(`${anchor}T12:00:00`);
  value.setDate(value.getDate() + days);
  return toIso(value);
};

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { classes, teachers, books, locations } = useDars();
  const { dateDisplay, locale } = useDisplayPreferences();
  const { language, isRTL } = useI18n();
  const ar = language === "ar";
  const today = toIso(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const sections = useMemo<ScheduleGroup[]>(() => {
    const start = offsetIso(selectedDate, -3);
    const end = offsetIso(selectedDate, 3);
    const grouped = getUpcomingClasses(classes)
      .filter((item) => item.date >= start && item.date <= end)
      .reduce<Record<string, DarsClass[]>>((acc, item) => {
        (acc[item.date] ??= []).push(item);
        return acc;
      }, {});
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        key: date,
        title: date === today ? `${ar ? "اليوم" : "Today"} · ${formatClassDate(date, dateDisplay, locale)}` : formatClassDate(date, dateDisplay, locale),
        data,
      }));
  }, [ar, classes, dateDisplay, locale, selectedDate, today]);
  const header = (
    <View style={styles.header}>
      <ScreenTitle
        eyebrow={ar ? "سبعة أيام" : "7-day view"}
        title={ar ? "الجدول" : "Schedule"}
        action={<IconButton icon="today" label={ar ? "اليوم" : "Jump to today"} onPress={() => setSelectedDate(today)} />}
      />
      <View style={styles.pager}>
        <IconButton
          icon={isRTL ? "chevron-right" : "chevron-left"}
          tone="plain"
          label={ar ? "الأسبوع السابق" : "Previous week"}
          onPress={() => setSelectedDate(offsetIso(selectedDate, -7))}
        />
        <View style={styles.flex}>
          <WeekStrip selectedDate={selectedDate} classes={classes} onSelect={setSelectedDate} />
        </View>
        <IconButton
          icon={isRTL ? "chevron-left" : "chevron-right"}
          tone="plain"
          label={ar ? "الأسبوع التالي" : "Next week"}
          onPress={() => setSelectedDate(offsetIso(selectedDate, 7))}
        />
      </View>
    </View>
  );
  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 8 }]}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              type.label,
              styles.dateLabel,
              { color: section.key === today ? colors.tint : colors.muted },
              directional(isRTL),
            ]}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item, index, section }) => (
          <View
            style={[
              styles.cell,
              { backgroundColor: colors.surface, borderColor: colors.border },
              index === 0 && styles.cellFirst,
              index === section.data.length - 1 && styles.cellLast,
            ]}
          >
            <AgendaRow
              item={item}
              teachers={teachers}
              books={books}
              locations={locations}
              last={index === section.data.length - 1}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="event-available"
            title={ar ? "أسبوع هادئ" : "A clear week"}
            message={ar ? "لا دروس قادمة في هذه الأيام. تنقّل بين الأسابيع أو أضف درساً." : "No upcoming classes in these days. Browse weeks or add a class."}
          />
        }
      />
      <Fab label={ar ? "درس جديد" : "New class"} onPress={() => router.push("/class/form" as never)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: space.gutter, paddingTop: space.md },
  header: { paddingBottom: space.xs },
  pager: { alignItems: "center", flexDirection: "row", gap: 2, marginHorizontal: -space.sm },
  dateLabel: { marginBottom: space.sm, marginTop: space.xl },
  cell: { borderLeftWidth: hairline, borderRightWidth: hairline, overflow: "hidden" },
  cellFirst: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderTopWidth: hairline },
  cellLast: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, borderBottomWidth: hairline },
});
