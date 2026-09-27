import { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { showAlert } from "@/lib/alert";
import { ListGroup, ListItem, SectionHeader } from "@/components/dars-ui";
import { BottomSheet, DoodleSwitch, OptionList, type SheetOption } from "@/components/form-ui";
import { directional, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { exportStudySpace } from "@/lib/data-export";
import { summarizeRestore, type RestoreStrategy } from "@/lib/data-import";
import { pickDarsHubImport } from "@/lib/data-import-native";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { getReminderDiagnostics, requestReminderPermission, scheduleReminderVerification, type ReminderDiagnostics } from "@/lib/reminders";
import type { DateDisplay, ThemeMode } from "@/lib/types/dars";

type Sheet = "theme" | "language" | "date" | "lead" | null;

export function SettingsContent() {
  const colors = useColors();
  const { preferences, updatePreferences, classes, teachers, books, locations, restoreStudySpace } = useDars();
  const { t, isRTL, language } = useI18n();
  const [diagnostics, setDiagnostics] = useState<ReminderDiagnostics | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const ar = language === "ar";
  const themeMode: ThemeMode = preferences.themeMode ?? "system";

  const refreshDiagnostics = useCallback(() => {
    void getReminderDiagnostics().then(setDiagnostics).catch(() => undefined);
  }, []);
  useEffect(() => {
    refreshDiagnostics();
    const timer = setTimeout(refreshDiagnostics, 600);
    return () => clearTimeout(timer);
  }, [preferences.remindersEnabled, preferences.reminderLeadMinutes, classes, refreshDiagnostics]);

  const permissionAlert = (permission: ReminderDiagnostics["permission"]) =>
    showAlert(
      t("permissionRequired"),
      permission === "unavailable"
        ? ar
          ? "التذكيرات متاحة على جهاز Android أو iOS فقط."
          : "Reminders are available only on an Android or iOS device."
        : ar
          ? "اسمح بالإشعارات من إعدادات الجهاز ثم عُد إلى دارس هَب."
          : "Allow notifications in device settings, then return to DarsHub.",
      permission === "denied"
        ? [
            { text: ar ? "إلغاء" : "Cancel", style: "cancel" },
            { text: t("notificationSettings"), onPress: () => void Linking.openSettings() },
          ]
        : [{ text: "OK" }],
    );

  const setReminders = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestReminderPermission();
      if (permission !== "granted") {
        permissionAlert(permission);
        return;
      }
    }
    haptic.selection();
    updatePreferences({ remindersEnabled: enabled });
  };

  const verifyReminder = async () => {
    const permission = await scheduleReminderVerification();
    refreshDiagnostics();
    if (permission !== "granted") {
      permissionAlert(permission);
      return;
    }
    showAlert(
      ar ? "تم جدولة اختبار" : "Test scheduled",
      ar ? "ستصل رسالة اختبار خلال ثوانٍ. أرسل التطبيق للخلفية للتحقق من ظهورها." : "A test alert arrives in a few seconds. Send the app to the background to confirm it appears.",
    );
  };

  const exportData = async () => {
    try {
      const result = await exportStudySpace({ classes, teachers, books, locations, preferences });
      haptic.success();
      if (result.kind === "saved")
        showAlert(ar ? "تم حفظ التصدير" : "Export saved", ar ? "حُفظ ملف بيانات دارس هَب على هذا الجهاز." : "Your DarsHub data file has been saved on this device.");
    } catch {
      showAlert(ar ? "تعذر التصدير" : "Export unavailable", ar ? "حاول مرة أخرى بعد لحظات." : "Please try again in a moment.");
    }
  };

  const importData = async () => {
    try {
      const imported = await pickDarsHubImport();
      if (!imported) return;
      const summary = summarizeRestore({ classes, teachers, books, locations, preferences }, imported.data);
      const conflicts = Object.values(summary.conflicts).reduce((total, value) => total + value, 0);
      const total = Object.values(summary.imported).reduce((sum, value) => sum + value, 0);
      const apply = (strategy: RestoreStrategy) => {
        restoreStudySpace(imported.data, strategy);
        haptic.success();
        showAlert(ar ? "تمت الاستعادة" : "Restore complete", ar ? "تم تحديث بياناتك المحلية بأمان." : "Your local DarsHub data has been updated.");
      };
      showAlert(
        ar ? "مراجعة الاستعادة" : "Review restore",
        ar
          ? `يحتوي الملف على ${total} عنصر و${conflicts} تعارضات. الدمج يحتفظ بسجلاتك الحالية عند التعارض، والاستبدال يستبدل كل البيانات المحلية.`
          : `This file has ${total} items and ${conflicts} ID conflicts. Merge keeps your current records on conflict; Replace overwrites all local data.`,
        [
          { text: ar ? "إلغاء" : "Cancel", style: "cancel" },
          { text: ar ? "استبدال الكل" : "Replace all", style: "destructive", onPress: () => apply("replace") },
          { text: ar ? "دمج" : "Merge", onPress: () => apply("merge") },
        ],
      );
    } catch {
      showAlert(ar ? "ملف غير صالح" : "Invalid file", ar ? "اختر ملف تصدير JSON صالحاً من دارس هَب." : "Choose a valid DarsHub JSON export file.");
    }
  };

  const themeOptions: SheetOption[] = [
    { value: "system", icon: "brightness-auto", label: ar ? "حسب النظام" : "System default" },
    { value: "light", icon: "light-mode", label: ar ? "فاتح" : "Light" },
    { value: "dark", icon: "dark-mode", label: ar ? "داكن" : "Dark" },
  ];
  const languageOptions: SheetOption[] = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ];
  const dateOptions: SheetOption[] = [
    { value: "gregorian", label: ar ? "ميلادي" : "Gregorian" },
    { value: "dual", label: ar ? "ميلادي وهجري" : "Gregorian + Hijri" },
    { value: "hijri", label: ar ? "هجري" : "Hijri" },
  ];
  const leadOptions: SheetOption[] = ([10, 30, 60] as const).map((minutes) => ({
    value: String(minutes),
    icon: "timer",
    label: minutes === 60 ? (ar ? "قبل ساعة" : "1 hour before") : ar ? `قبل ${minutes} دقيقة` : `${minutes} minutes before`,
  }));
  const labelOf = (options: SheetOption[], value: string) => options.find((option) => option.value === value)?.label;

  const sheets: Record<Exclude<Sheet, null>, { title: string; options: SheetOption[]; value: string; onSelect: (value: string) => void }> = {
    theme: { title: ar ? "المظهر" : "Appearance", options: themeOptions, value: themeMode, onSelect: (value) => updatePreferences({ themeMode: value as ThemeMode }) },
    language: {
      title: ar ? "اللغة" : "Language",
      options: languageOptions,
      value: language,
      onSelect: (value) => updatePreferences({ appLanguage: value as "en" | "ar", dateLanguage: value as "en" | "ar" }),
    },
    date: { title: ar ? "نمط التاريخ" : "Date style", options: dateOptions, value: preferences.dateDisplay, onSelect: (value) => updatePreferences({ dateDisplay: value as DateDisplay }) },
    lead: {
      title: ar ? "وقت التذكير" : "Remind me",
      options: leadOptions,
      value: String(preferences.reminderLeadMinutes),
      onSelect: (value) => updatePreferences({ reminderLeadMinutes: Number(value) as 10 | 30 | 60 }),
    },
  };
  const active = sheet ? sheets[sheet] : null;

  return (
    <View>
      <SectionHeader title={ar ? "العرض" : "Display"} />
      <ListGroup>
        <ListItem icon="palette" title={ar ? "المظهر" : "Appearance"} value={labelOf(themeOptions, themeMode)} onPress={() => setSheet("theme")} />
        <ListItem icon="translate" title={ar ? "اللغة" : "Language"} value={labelOf(languageOptions, language)} onPress={() => setSheet("language")} />
        <ListItem icon="calendar-today" title={ar ? "نمط التاريخ" : "Date style"} value={labelOf(dateOptions, preferences.dateDisplay)} onPress={() => setSheet("date")} last />
      </ListGroup>

      <SectionHeader title={ar ? "التذكيرات" : "Reminders"} />
      <ListGroup>
        <ListItem
          icon="notifications-none"
          title={ar ? "تذكيرات الدروس" : "Class reminders"}
          detail={ar ? "إشعار قبل بدء كل درس" : "Get notified before each class"}
          trailing={
            <DoodleSwitch
              label={ar ? "تذكيرات الدروس" : "Class reminders"}
              value={preferences.remindersEnabled}
              onValueChange={(value) => void setReminders(value)}
            />
          }
          last={!preferences.remindersEnabled}
        />
        {preferences.remindersEnabled ? (
          <>
            <ListItem icon="schedule" title={ar ? "وقت التذكير" : "Remind me"} value={labelOf(leadOptions, String(preferences.reminderLeadMinutes))} onPress={() => setSheet("lead")} />
            <ListItem
              icon="verified"
              title={ar ? "إرسال تذكير تجريبي" : "Send a test reminder"}
              detail={
                diagnostics?.permission === "granted"
                  ? ar
                    ? `${diagnostics.scheduledClassReminders} تذكيرات مجدولة`
                    : `${diagnostics.scheduledClassReminders} class reminders scheduled`
                  : ar
                    ? "يلزم إذن الإشعارات"
                    : "Notification permission required"
              }
              onPress={() => void verifyReminder()}
              last
            />
          </>
        ) : null}
      </ListGroup>

      <SectionHeader title={ar ? "البيانات" : "Your data"} />
      <ListGroup>
        <ListItem
          icon="ios-share"
          title={ar ? "تصدير نسخة احتياطية" : "Export backup"}
          detail={ar ? "ملف JSON خاص، لا يُرفع إلى أي خادم" : "Private JSON file — nothing is uploaded"}
          onPress={() => void exportData()}
        />
        <ListItem
          icon="restore"
          title={ar ? "استعادة نسخة احتياطية" : "Restore backup"}
          detail={ar ? "راجِع التعارضات قبل أي تغيير" : "Review conflicts before anything changes"}
          onPress={() => void importData()}
          last
        />
      </ListGroup>
      <Text style={[type.meta, styles.note, { color: colors.muted }, directional(isRTL)]}>
        {ar
          ? `${classes.length} دروس · ${teachers.length} معلمين · ${books.length} كتب · ${locations.length} أماكن — محفوظة على هذا الجهاز فقط.`
          : `${classes.length} classes · ${teachers.length} teachers · ${books.length} books · ${locations.length} places — stored on this device only.`}
      </Text>

      <SectionHeader title={ar ? "حول" : "About"} />
      <ListGroup>
        <ListItem icon="info-outline" title="DarsHub" detail={ar ? "أنشأه Hashim · محلي أولاً" : "Created by Hashim · local-first"} />
        <ListItem icon="public" title="hashimhameem.site" detail={ar ? "الموقع الرسمي" : "Official website"} onPress={() => void Linking.openURL("https://hashimhameem.site")} last />
      </ListGroup>

      <BottomSheet visible={Boolean(active)} title={active?.title ?? ""} onClose={() => setSheet(null)}>
        {active ? (
          <OptionList
            options={active.options}
            value={active.value}
            onSelect={(value) => {
              active.onSelect(value);
              setSheet(null);
            }}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { paddingHorizontal: space.xs, paddingTop: space.sm },
});
