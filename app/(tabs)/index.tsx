import { Icon } from "@/components/doodle";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AgendaRow, EmptyState, Fab, IconButton, ListGroup, ScreenTitle, SectionHeader } from "@/components/dars-ui";
import { MotionPressable, pressedOpacity } from "@/components/motion-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { WeekStrip } from "@/components/week-strip";
import { directional, radius, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { dayDifference, formatClassDate, formatTime, getRef, getUpcomingClasses } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import type { DarsClass } from "@/lib/types/dars";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

const isoToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const greeting = (language: string) => {
  const hour = new Date().getHours();
  if (language === "ar") return hour < 12 ? "صباح الخير" : "مساء الخير";
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

const relativeDay = (isoDate: string, language: string, fallback: string) => {
  const diff = dayDifference(isoDate);
  if (diff === 0) return language === "ar" ? "اليوم" : "Today";
  if (diff === 1) return language === "ar" ? "غداً" : "Tomorrow";
  return fallback;
};

function NextClassCard({ item }: { item: DarsClass }) {
  const colors = useColors();
  const { teachers, locations } = useDars();
  const { dateDisplay, locale } = useDisplayPreferences();
  const { language, isRTL } = useI18n();
  const teacher = getRef(teachers, item.teacherId);
  const location = getRef(locations, item.locationId);
  const when = `${relativeDay(item.date, language, formatClassDate(item.date, dateDisplay, locale))} · ${formatTime(item.startTime, locale)}`;
  return (
    <MotionPressable
      accessibilityRole="button"
      accessibilityLabel={`${language === "ar" ? "الدرس القادم" : "Next class"}: ${item.title}, ${when}`}
      android_ripple={{ color: "rgba(255,255,255,0.16)", foreground: true }}
      onPress={() => {
        haptic.light();
        router.push(`/class/${item.id}` as never);
      }}
      style={({ pressed }) => [styles.next, { backgroundColor: colors.tint, opacity: pressedOpacity(pressed, 0.85) }]}
    >
      <View style={[styles.nextTop, isRTL && styles.rowReverse]}>
        <Text style={[type.caption, styles.nextEyebrow, { color: colors.onPrimary }]}>
          {language === "ar" ? "الدرس القادم" : "NEXT CLASS"}
        </Text>
        <Icon name={isRTL ? "arrow-back" : "arrow-forward"} size={20} color={colors.onPrimary} />
      </View>
      <Text numberOfLines={2} style={[type.title, { color: colors.onPrimary }, directional(isRTL)]}>
        {item.title}
      </Text>
      <Text style={[type.bodyStrong, { color: colors.onPrimary }, directional(isRTL)]}>{when}</Text>
      <Text numberOfLines={1} style={[type.meta, styles.nextMeta, { color: colors.onPrimary }, directional(isRTL)]}>
        {[teacher?.name, location?.name ?? item.city].filter(Boolean).join(" · ")}
      </Text>
    </MotionPressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { classes, teachers, books, locations } = useDars();
  const { dateDisplay, locale } = useDisplayPreferences();
  const { language } = useI18n();
  const ar = language === "ar";
  const today = isoToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const upcoming = useMemo(() => getUpcomingClasses(classes), [classes]);
  const nextClass = upcoming[0];
  const dayItems = useMemo(() => upcoming.filter((item) => item.date === selectedDate), [selectedDate, upcoming]);
  const later = useMemo(
    () => upcoming.filter((item) => item.date > selectedDate && item.id !== nextClass?.id).slice(0, 4),
    [nextClass?.id, selectedDate, upcoming],
  );
  const hasReferences = Boolean(teachers.length && books.length && locations.length);
  const firstSetup = !teachers.length
    ? { route: "/teacher/form", label: ar ? "أضف معلماً" : "Add teacher" }
    : !books.length
      ? { route: "/book/form", label: ar ? "أضف كتاباً" : "Add book" }
      : { route: "/location/form", label: ar ? "أضف مكاناً" : "Add place" };
  const dayTitle =
    selectedDate === today
      ? ar
        ? "اليوم"
        : "Today"
      : relativeDay(selectedDate, language, formatClassDate(selectedDate, "gregorian", locale));
  const addClass = () => router.push("/class/form" as never);
  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle
          eyebrow={formatClassDate(today, dateDisplay, locale)}
          title={greeting(language)}
          action={<IconButton icon="search" label={ar ? "بحث" : "Search"} onPress={() => router.push("/search" as never)} />}
        />
        {!hasReferences ? (
          <ListGroup>
            <EmptyState
              icon="auto-stories"
              title={ar ? "ابدأ مكتبتك" : "Set up your library"}
              message={ar ? "أضف معلماً وكتاباً ومكاناً لتبدأ جدولة دروسك." : "Add a teacher, a book and a place to start scheduling classes."}
              actionLabel={firstSetup.label}
              onAction={() => router.push(firstSetup.route as never)}
            />
          </ListGroup>
        ) : nextClass ? (
          <NextClassCard item={nextClass} />
        ) : null}
        <View style={[styles.week, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <WeekStrip selectedDate={selectedDate} classes={upcoming} onSelect={setSelectedDate} />
        </View>
        <SectionHeader
          title={`${dayTitle}${dayItems.length ? ` · ${dayItems.length}` : ""}`}
          action={selectedDate !== today ? { label: ar ? "اليوم" : "Back to today", onPress: () => setSelectedDate(today) } : undefined}
        />
        {dayItems.length ? (
          <ListGroup>
            {dayItems.map((item, index) => (
              <AgendaRow
                key={item.id}
                item={item}
                teachers={teachers}
                books={books}
                locations={locations}
                last={index === dayItems.length - 1}
              />
            ))}
          </ListGroup>
        ) : (
          <View style={[styles.quiet, { borderColor: colors.border }]}>
            <Text style={[type.meta, { color: colors.muted }]}>{ar ? "لا دروس في هذا اليوم" : "Nothing scheduled"}</Text>
          </View>
        )}
        {later.length ? (
          <>
            <SectionHeader
              title={ar ? "لاحقاً" : "Coming up"}
              action={{ label: ar ? "الجدول" : "See all", onPress: () => router.push("/schedule" as never) }}
            />
            <ListGroup>
              {later.map((item, index) => (
                <AgendaRow
                  key={item.id}
                  item={item}
                  teachers={teachers}
                  books={books}
                  locations={locations}
                  last={index === later.length - 1}
                />
              ))}
            </ListGroup>
          </>
        ) : null}
      </ScrollView>
      {hasReferences ? <Fab label={ar ? "درس جديد" : "New class"} onPress={addClass} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.gutter, paddingTop: space.md },
  rowReverse: { flexDirection: "row-reverse" },
  next: { borderRadius: radius.xl, gap: 6, overflow: "hidden", padding: space.xl },
  nextTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  nextEyebrow: { letterSpacing: 1, opacity: 0.8 },
  nextMeta: { opacity: 0.82 },
  week: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, marginTop: space.md, paddingHorizontal: space.xs, paddingVertical: space.sm },
  quiet: { alignItems: "center", borderRadius: radius.lg, borderStyle: "dashed", borderWidth: 1, paddingVertical: space.xl },
});
