import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SketchSurface } from "@/components/doodle";
import { ListGroup, ListItem, PrimaryButton, SectionHeader, TopBar } from "@/components/dars-ui";
import { FormNotice, TextField } from "@/components/form-ui";
import { ScreenContainer } from "@/components/screen-container";
import { directional, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { showAlert } from "@/lib/alert";
import { buildAiPrompt, parseAiImport, type AiClassPlan } from "@/lib/ai-import";
import { useDars } from "@/lib/dars-context";
import { formatClassDate, formatTime, weekdayNames } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";
import { getSeriesDates } from "@/lib/recurrence";
import { useDisplayPreferences } from "@/lib/use-display-preferences";

export default function AiImportScreen() {
  const colors = useColors();
  const { teachers, books, locations, importAiPlans } = useDars();
  const { language, isRTL } = useI18n();
  const { dateDisplay, locale } = useDisplayPreferences();
  const ar = language === "ar";
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => (input.trim() ? parseAiImport(input, { teachers, books, locations }) : null), [books, input, locations, teachers]);
  const names = weekdayNames(locale);
  const prompt = () => buildAiPrompt({ teachers, books, locations }, new Date(), language);

  const copyPrompt = async () => {
    await Clipboard.setStringAsync(prompt());
    haptic.success();
    setCopied(true);
  };
  const sharePrompt = () => void Share.share({ message: prompt() });
  const paste = async () => {
    const value = await Clipboard.getStringAsync();
    if (!value.trim()) {
      showAlert(ar ? "الحافظة فارغة" : "Clipboard is empty", ar ? "انسخ رد الذكاء الاصطناعي أولاً." : "Copy the AI's reply first.");
      return;
    }
    haptic.selection();
    setInput(value);
  };
  const add = () => {
    if (!result?.plans.length) return;
    const counts = importAiPlans(result.plans);
    haptic.success();
    const refs = counts.teachers + counts.books + counts.locations;
    showAlert(
      ar ? "تمت الإضافة" : "Classes added",
      ar
        ? `أُضيف ${counts.classes} درساً (${counts.sessions} موعداً)${refs ? ` و${refs} مرجعاً جديداً` : ""}${counts.skipped ? `، وتم تخطي ${counts.skipped}` : ""}.`
        : `Added ${counts.classes} classes (${counts.sessions} sessions)${refs ? ` and ${refs} new teachers/books/places` : ""}${counts.skipped ? `; skipped ${counts.skipped}` : ""}.`,
    );
    setInput("");
    router.replace("/(tabs)/schedule" as never);
  };

  const schedule = (plan: AiClassPlan) => {
    const time = `${formatTime(plan.startTime, locale)}${plan.endTime ? ` – ${formatTime(plan.endTime, locale)}` : ""}`;
    const start = formatClassDate(plan.date, dateDisplay, locale);
    if (plan.repeat === "none") return `${start} · ${time}`;
    const cadence = plan.repeat === "Weekly" ? (ar ? "أسبوعياً" : "Weekly") : plan.repeat === "Every 2 weeks" ? (ar ? "كل أسبوعين" : "Every 2 weeks") : ar ? "شهرياً" : "Monthly";
    const days = plan.days?.map((day) => names[day]).join(ar ? "، " : ", ");
    const end = !plan.ends || plan.ends.kind === "ongoing"
      ? ar ? "بلا نهاية محددة" : "no end yet"
      : plan.ends.kind === "count" ? ar ? `${plan.ends.count} حصة` : `${plan.ends.count} sessions`
      : ar ? `حتى ${formatClassDate(plan.ends.date, dateDisplay, locale)}` : `until ${formatClassDate(plan.ends.date, dateDisplay, locale)}`;
    const count = getSeriesDates(plan.date, plan.repeat, plan.days, undefined, plan.ends?.kind === "ongoing" ? undefined : plan.ends).length;
    return `${cadence}${days ? ` · ${days}` : ""} · ${time}\n${ar ? "من" : "From"} ${start} · ${end} · ${ar ? `${count} موعداً` : `${count} sessions`}`;
  };
  const newTag = (plan: AiClassPlan) => [
    !plan.teacher.existingId ? (ar ? "معلم جديد" : "new teacher") : "",
    !plan.book.existingId ? (ar ? "كتاب جديد" : "new book") : "",
    !plan.location.existingId ? (ar ? "مكان جديد" : "new place") : "",
  ].filter(Boolean).join(" · ");

  const writing = directional(isRTL);
  const issueText = (index: number, message: string) => (index < 0 ? message : `${ar ? "الدرس" : "Class"} ${index + 1}: ${message}`);

  return (
    <ScreenContainer>
      <TopBar onBack={goBackOrHome} title={ar ? "استيراد بالذكاء الاصطناعي" : "AI import"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[type.body, { color: colors.muted }, writing]}>
            {ar
              ? "انسخ التعليمات إلى ChatGPT أو أي مساعد، وتحدث معه عن دروسك (حتى بالصوت). ثم الصق رد JSON هنا لإضافة كل الدروس دفعة واحدة."
              : "Copy the instructions into ChatGPT or any AI, tell it about your classes (voice mode works), then paste its JSON reply here to add them all at once."}
          </Text>

          <SectionHeader title={ar ? "١. أعطِ التعليمات للذكاء الاصطناعي" : "1. Give the AI the template"} />
          <ListGroup>
            <ListItem
              icon="notes"
              title={copied ? (ar ? "تم النسخ ✓" : "Copied ✓") : ar ? "نسخ التعليمات والقالب" : "Copy prompt & template"}
              detail={ar ? "يتضمن معلميك وكتبك وأماكنك الحالية" : "Includes your current teachers, books and places"}
              onPress={() => void copyPrompt()}
            />
            <ListItem icon="ios-share" title={ar ? "مشاركة مع تطبيق الذكاء الاصطناعي" : "Share to an AI app"} onPress={sharePrompt} last />
          </ListGroup>

          <SectionHeader title={ar ? "٢. الصق الرد" : "2. Paste the reply"} action={{ label: ar ? "لصق" : "Paste", onPress: () => void paste() }} />
          <TextField label={ar ? "رد JSON" : "JSON reply"} value={input} onChangeText={setInput} multiline autoCapitalize="none" placeholder='{"format": "darshub-ai-classes", "classes": [...]}' />

          {result?.issues.map((issue) => (
            <FormNotice key={`${issue.index}-${issue.message}`} message={issueText(issue.index, issue.message)} />
          ))}

          {result?.plans.length ? (
            <>
              <SectionHeader title={ar ? `٣. مراجعة ${result.plans.length} دروس` : `3. Review ${result.plans.length} classes`} />
              <View style={styles.preview}>
                {result.plans.map((plan, index) => (
                  <SketchSurface key={`${plan.title}-${index}`} corner={16} seed={index + 80} shadow={false} style={styles.card}>
                    <Text style={[type.bodyStrong, { color: colors.text }, writing]}>{plan.title}</Text>
                    <Text style={[type.meta, { color: colors.muted }, writing]}>{`${plan.subject} · ${plan.teacher.name} · ${plan.book.name} · ${plan.location.name}`}</Text>
                    <Text style={[type.meta, { color: colors.text }, writing]}>{schedule(plan)}</Text>
                    {newTag(plan) ? <Text style={[type.caption, { color: colors.primary }, writing]}>{newTag(plan)}</Text> : null}
                  </SketchSurface>
                ))}
              </View>
              <PrimaryButton
                icon="add"
                label={result.issues.length ? (ar ? `إضافة ${result.plans.length} دروس صالحة` : `Add ${result.plans.length} valid classes`) : ar ? `إضافة ${result.plans.length} دروس` : `Add ${result.plans.length} classes`}
                onPress={add}
              />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: space.md, paddingBottom: 48, paddingHorizontal: space.gutter },
  preview: { gap: space.sm },
  card: { gap: 4, padding: space.md },
});
