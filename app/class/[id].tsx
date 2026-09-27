import { Icon } from "@/components/doodle";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { showAlert } from "@/lib/alert";
import { EmptyState, IconButton, ListGroup, ListItem, PrimaryButton, SectionHeader, StatusPill, SubjectBadge, TopBar } from "@/components/dars-ui";
import { BottomSheet, OptionList, SeriesEndFields } from "@/components/form-ui";
import { ScreenContainer } from "@/components/screen-container";
import { directional, radius, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { formatClassDate, formatTime, getRef, weekdayNames } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";
import type { DarsClass, RecurrenceEnd } from "@/lib/types/dars";
import { seriesEnd } from "@/lib/recurrence";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

type Lead = "global" | "10" | "30" | "60";

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { classes, teachers, books, locations, preferences, saveClass, deleteClass, cancelFutureSeries, changeSeriesEnd } = useDars();
  const { dateDisplay, locale } = useDisplayPreferences();
  const { isRTL, language } = useI18n();
  const [reminderOpen, setReminderOpen] = useState(false);
  const [endDraft, setEndDraft] = useState<RecurrenceEnd | null>(null);
  const ar = language === "ar";
  const item = classes.find((entry) => entry.id === id);
  if (!item)
    return (
      <ScreenContainer>
        <TopBar onBack={goBackOrHome} />
        <EmptyState
          title={ar ? "الدرس غير متاح" : "Class unavailable"}
          message={ar ? "لم يعد هذا الدرس متاحاً." : "This class is no longer available."}
          actionLabel={ar ? "رجوع" : "Go back"}
          onAction={goBackOrHome}
        />
      </ScreenContainer>
    );
  const teacher = getRef(teachers, item.teacherId);
  const book = getRef(books, item.bookId);
  const location = getRef(locations, item.locationId);
  const when = `${formatClassDate(item.date, dateDisplay, locale)}`;
  const seriesItems = item.seriesId ? classes.filter((entry) => entry.seriesId === item.seriesId) : [];
  const currentEnd = item.seriesId ? seriesEnd(seriesItems) : undefined;
  const sessionTotal = Math.max(0, ...seriesItems.map((entry) => (entry.occurrenceIndex ?? 0) + 1));
  const endDetail = !currentEnd ? "" : currentEnd.kind === "ongoing"
    ? ar ? "غير محدد بعد · تُضاف مواعيد تلقائياً" : "Not decided yet · adds classes automatically"
    : currentEnd.kind === "count" ? ar ? `بعد ${currentEnd.count} حصة` : `After ${currentEnd.count} sessions`
    : ar ? `في ${formatClassDate(currentEnd.date, dateDisplay, locale)}` : `On ${formatClassDate(currentEnd.date, dateDisplay, locale)}`;
  const sessionLabel = item.seriesId ? (currentEnd?.kind === "ongoing" ? (ar ? `الحصة ${(item.occurrenceIndex ?? 0) + 1}` : `Session ${(item.occurrenceIndex ?? 0) + 1}`) : ar ? `الحصة ${(item.occurrenceIndex ?? 0) + 1} من ${currentEnd?.kind === "count" ? currentEnd.count : sessionTotal}` : `Session ${(item.occurrenceIndex ?? 0) + 1} of ${currentEnd?.kind === "count" ? currentEnd.count : sessionTotal}`) : "";
  const names = weekdayNames(locale);
  const repeatLabel = [ar ? "متكرر" : "Recurring", sessionLabel, ...(item.recurrenceDays && item.recurrenceDays.length > 1 ? [item.recurrenceDays.map((day) => names[day]).join(ar ? "، " : ", ")] : [])].join(" · ");
  const time = `${formatTime(item.startTime, locale)}${item.endTime ? ` – ${formatTime(item.endTime, locale)}` : ""}`;
  const place = [location?.name, location?.area, location?.city ?? item.city].filter(Boolean).join(", ");

  const update = (patch: Partial<DarsClass>) => {
    const { id: classId, ...draft } = item;
    saveClass({ ...draft, ...patch }, classId);
  };
  const toggleComplete = () => {
    update({ status: item.status === "completed" ? "upcoming" : "completed" });
    haptic.success();
  };
  const openMap = async () => {
    const query = [location?.name, location?.address, location?.area, location?.city ?? item.city].filter(Boolean).join(", ");
    const url = location?.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    try {
      await Linking.openURL(url);
    } catch {
      showAlert(ar ? "الخريطة غير متاحة" : "Map unavailable", ar ? "تعذر فتح تطبيق الخرائط." : "Could not open a maps app.");
    }
  };
  const share = () => {
    const lines = [
      item.title,
      `${item.subject}${teacher ? ` · ${teacher.name}` : ""}`,
      book ? `${ar ? "الكتاب" : "Book"}: ${book.name}` : "",
      `${when} · ${time}`,
      place,
      location?.mapLink ?? "",
    ].filter(Boolean);
    void Share.share({ title: item.title, message: lines.join("\n") }).catch(() => undefined);
  };
  const leadValue: Lead = item.reminderLeadMinutes ? (String(item.reminderLeadMinutes) as Lead) : "global";
  const setLead = (value: string) => {
    update({ reminderLeadMinutes: value === "global" ? undefined : (Number(value) as 10 | 30 | 60) });
    haptic.selection();
    setReminderOpen(false);
  };
  const confirmDelete = () =>
    showAlert(
      ar ? "حذف الدرس؟" : "Delete class?",
      item.seriesId
        ? ar
          ? "سيتم حذف هذا الموعد فقط. تبقى بقية مواعيد السلسلة."
          : "Only this occurrence is removed. Other occurrences in the series stay."
        : ar
          ? "سيتم حذف هذا الدرس من جدولك."
          : "This removes the class from your schedule.",
      [
        { text: ar ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: ar ? "حذف" : "Delete",
          style: "destructive",
          onPress: () => {
            deleteClass(item.id);
            haptic.success();
            goBackOrHome();
          },
        },
      ],
    );
  const cancelSeries = () => {
    if (!item.seriesId) return;
    showAlert(
      ar ? "إلغاء المواعيد القادمة" : "Cancel future occurrences",
      ar ? "سيتم إلغاء هذا الموعد وكل المواعيد القادمة في هذه السلسلة." : "This cancels this and all future occurrences in this series.",
      [
        { text: ar ? "رجوع" : "Keep", style: "cancel" },
        {
          text: ar ? "إلغاء القادم" : "Cancel future",
          style: "destructive",
          onPress: () => {
            cancelFutureSeries(item.seriesId!, item.occurrenceIndex ?? 0);
            goBackOrHome();
          },
        },
      ],
    );
  };
  const reminderDetail = item.reminderLeadMinutes
    ? ar
      ? `قبل ${item.reminderLeadMinutes} دقيقة`
      : `${item.reminderLeadMinutes} min before`
    : preferences.remindersEnabled
      ? ar
        ? `الإعداد العام · ${preferences.reminderLeadMinutes} دقيقة`
        : `Global · ${preferences.reminderLeadMinutes} min before`
      : ar
        ? "التذكيرات متوقفة في الإعدادات"
        : "Reminders are off in Settings";

  return (
    <ScreenContainer>
      <TopBar
        onBack={goBackOrHome}
        actions={
          <>
            <IconButton icon="share" tone="plain" label={ar ? "مشاركة" : "Share"} onPress={share} />
            <IconButton
              icon="edit"
              tone="plain"
              label={ar ? "تعديل" : "Edit"}
              onPress={() => router.push({ pathname: "/class/form", params: { id: item.id } } as never)}
            />
          </>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.badges, isRTL && styles.rowReverse]}>
            <SubjectBadge label={item.subject} />
            <StatusPill status={item.status} />
            {item.seriesId ? (
              <View style={[styles.repeat, isRTL && styles.rowReverse, { backgroundColor: colors.subtle }]}>
                <Icon name="repeat" size={13} color={colors.muted} />
                <Text style={[type.caption, { color: colors.muted }]}>{repeatLabel}</Text>
              </View>
            ) : null}
          </View>
          <Text accessibilityRole="header" style={[type.display, { color: colors.text }, directional(isRTL)]}>
            {item.title}
          </Text>
          <Text style={[type.body, { color: colors.muted }, directional(isRTL)]}>
            {when} · {time}
          </Text>
        </View>

        {item.status !== "cancelled" ? (
          <PrimaryButton
            icon={item.status === "completed" ? "undo" : "check"}
            variant={item.status === "completed" ? "tonal" : "primary"}
            label={
              item.status === "completed" ? (ar ? "إعادة إلى القادم" : "Mark as upcoming") : ar ? "تم الحضور" : "Mark as attended"
            }
            onPress={toggleComplete}
          />
        ) : null}

        <SectionHeader title={ar ? "التفاصيل" : "Details"} />
        <ListGroup>
          <ListItem
            icon="person-outline"
            title={teacher?.name ?? (ar ? "المعلم غير محدد" : "Teacher pending")}
            detail={ar ? "المعلم" : "Teacher"}
            onPress={teacher ? () => router.push(`/teacher/${teacher.id}` as never) : undefined}
          />
          <ListItem
            icon="menu-book"
            title={book?.name ?? (ar ? "الكتاب غير محدد" : "Book pending")}
            detail={book?.author ? book.author : ar ? "الكتاب" : "Book"}
            onPress={book ? () => router.push(`/book/${book.id}` as never) : undefined}
          />
          <ListItem
            icon="location-on"
            title={location?.name ?? (ar ? "المكان غير محدد" : "Location pending")}
            detail={[location?.area, location?.city ?? item.city].filter(Boolean).join(", ")}
            onPress={location ? () => router.push(`/location/${location.id}` as never) : undefined}
            last={!item.notes}
          />
          {item.notes ? <ListItem icon="notes" title={item.notes} detail={ar ? "ملاحظات" : "Notes"} last /> : null}
        </ListGroup>

        <SectionHeader title={ar ? "الإجراءات" : "Actions"} />
        <ListGroup>
          <ListItem
            icon="notifications-none"
            title={ar ? "التذكير" : "Reminder"}
            detail={reminderDetail}
            onPress={() => setReminderOpen(true)}
          />
          <ListItem icon="map" title={ar ? "فتح في الخرائط" : "Open in Maps"} detail={place || undefined} onPress={() => void openMap()} />
          <ListItem icon="ios-share" title={ar ? "مشاركة الدرس" : "Share class"} onPress={share} last={!item.seriesId} />
          {item.seriesId ? (
            <>
              <ListItem
                icon="edit-calendar"
                title={ar ? "تعديل المواعيد القادمة" : "Edit future occurrences"}
                onPress={() => router.push({ pathname: "/class/form", params: { id: item.id, scope: "series" } } as never)}
              />
              <ListItem icon="event-available" title={ar ? "نهاية الدورة" : "Course end"} detail={endDetail} onPress={() => setEndDraft(currentEnd ?? { kind: "ongoing" })} />
              <ListItem icon="add" title={ar ? "إضافة حصة إضافية" : "Add extra session"} onPress={() => router.push({ pathname: "/class/form", params: { extraFor: item.id } } as never)} />
              <ListItem icon="event-busy" title={ar ? "إلغاء المواعيد القادمة" : "Cancel future occurrences"} onPress={cancelSeries} last />
            </>
          ) : null}
        </ListGroup>

        <View style={styles.danger}>
          <PrimaryButton icon="delete-outline" variant="danger" label={ar ? "حذف الدرس" : "Delete class"} onPress={confirmDelete} />
        </View>
      </ScrollView>
      <BottomSheet visible={reminderOpen} title={ar ? "تذكير هذا الدرس" : "Class reminder"} onClose={() => setReminderOpen(false)}>
        <OptionList
          value={leadValue}
          onSelect={setLead}
          options={[
            {
              value: "global",
              icon: "settings",
              label: ar ? "استخدم الإعداد العام" : "Use global setting",
              detail: ar ? `${preferences.reminderLeadMinutes} دقيقة` : `${preferences.reminderLeadMinutes} min before`,
            },
            { value: "10", icon: "timer", label: ar ? "قبل ١٠ دقائق" : "10 minutes before" },
            { value: "30", icon: "timer", label: ar ? "قبل ٣٠ دقيقة" : "30 minutes before" },
            { value: "60", icon: "timer", label: ar ? "قبل ساعة" : "1 hour before" },
          ]}
        />
      </BottomSheet>
      <BottomSheet
        visible={endDraft !== null}
        title={ar ? "نهاية الدورة" : "Course end"}
        onClose={() => setEndDraft(null)}
        footer={
          <PrimaryButton
            label={ar ? "حفظ" : "Save"}
            onPress={() => {
              if (!endDraft || !item.seriesId) return;
              changeSeriesEnd(item.seriesId, endDraft);
              haptic.success();
              setEndDraft(null);
            }}
          />
        }
      >
        <View style={styles.endSheet}>
          <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>
            {ar ? "تُضاف أو تُزال الحصص القادمة لتطابق النهاية. الحصص السابقة والمحضورة لا تتغير." : "Upcoming sessions are added or removed to match. Past and attended sessions never change."}
          </Text>
          {endDraft ? <SeriesEndFields value={endDraft} onChange={setEndDraft} minDate={seriesItems.reduce((min, entry) => (entry.seriesStart ?? entry.date) < min ? entry.seriesStart ?? entry.date : min, item.date)} /> : null}
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, paddingHorizontal: space.gutter },
  rowReverse: { flexDirection: "row-reverse" },
  hero: { gap: space.sm, paddingBottom: space.xl, paddingTop: space.sm },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  repeat: { alignItems: "center", borderRadius: radius.sm, flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 3 },
  danger: { marginTop: space.xxl },
  endSheet: { gap: space.md, paddingBottom: space.md },
});
