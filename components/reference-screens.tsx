import { type ComponentProps, type ReactNode } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { showAlert } from "@/lib/alert";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ClassCard, EmptyState, IconButton, ListGroup, ListItem, PrimaryButton, SectionHeader, TopBar } from "@/components/dars-ui";
import { FormNotice } from "@/components/form-ui";
import { ScreenContainer } from "@/components/screen-container";
import { directional, hairline, radius, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { sortClasses } from "@/lib/dars-utils";
import { haptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";
import type { DarsClass } from "@/lib/types/dars";

type MaterialIcon = ComponentProps<typeof MaterialIcons>["name"];
export type InfoRow = { icon: MaterialIcon; title: string; detail?: string; onPress?: () => void };

export const studyStatusLabel = (status: string, ar: boolean) =>
  !ar ? status : status === "Current study" ? "قيد الدراسة" : status === "Planned" ? "مخطط" : status === "Completed" ? "مكتمل" : status;

export function ReferenceMissing({ title, message }: { title: string; message: string }) {
  const { language } = useI18n();
  return (
    <ScreenContainer>
      <TopBar onBack={goBackOrHome} />
      <EmptyState title={title} message={message} actionLabel={language === "ar" ? "رجوع" : "Go back"} onAction={goBackOrHome} />
    </ScreenContainer>
  );
}

export function ReferenceDetail({
  icon,
  kind,
  title,
  subtitle,
  badges,
  rows,
  linked,
  deleteLabel,
  onEdit,
  onDelete,
}: {
  icon: MaterialIcon;
  kind: string;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  rows: InfoRow[];
  linked: DarsClass[];
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const { teachers, books, locations } = useDars();
  const { isRTL, language } = useI18n();
  const ar = language === "ar";
  const upcoming = linked.filter((item) => item.status === "upcoming").length;
  const confirmDelete = () => {
    if (linked.length) {
      showAlert(
        ar ? "مستخدم في دروس" : "Still in use",
        ar
          ? `${linked.length} من الدروس مرتبطة بهذا العنصر. عدّل تلك الدروس أو احذفها أولاً.`
          : `${linked.length} ${linked.length === 1 ? "class uses" : "classes use"} this. Update or delete those classes first.`,
        [{ text: "OK" }],
      );
      return;
    }
    showAlert(deleteLabel, ar ? "سيتم حذفه من مكتبتك على هذا الجهاز." : "This removes it from your library on this device.", [
      { text: ar ? "إلغاء" : "Cancel", style: "cancel" },
      {
        text: ar ? "حذف" : "Delete",
        style: "destructive",
        onPress: () => {
          haptic.success();
          onDelete();
        },
      },
    ]);
  };
  const header = (
    <View>
      <View style={[styles.hero, isRTL && styles.rowReverse]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.wash }]}>
          <MaterialIcons name={icon} size={28} color={colors.tint} />
        </View>
        <View style={styles.flex}>
          <Text style={[type.label, { color: colors.muted }, directional(isRTL)]}>{kind}</Text>
          <Text accessibilityRole="header" style={[type.title, { color: colors.text }, directional(isRTL)]}>
            {title}
          </Text>
          {subtitle ? <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>{subtitle}</Text> : null}
        </View>
      </View>
      {badges ? <View style={[styles.badges, isRTL && styles.rowReverse]}>{badges}</View> : null}
      <View style={[styles.stats, isRTL && styles.rowReverse, { borderColor: colors.border }]}>
        <Stat value={linked.length} label={ar ? "دروس" : "Classes"} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stat value={upcoming} label={ar ? "قادمة" : "Upcoming"} />
      </View>
      {rows.length ? (
        <ListGroup>
          {rows.map((row, index) => (
            <ListItem key={`${row.icon}-${index}`} {...row} last={index === rows.length - 1} />
          ))}
        </ListGroup>
      ) : null}
      <SectionHeader title={ar ? "الدروس المرتبطة" : "Linked classes"} />
    </View>
  );
  return (
    <ScreenContainer>
      <TopBar
        onBack={goBackOrHome}
        actions={<IconButton icon="edit" tone="plain" label={ar ? "تعديل" : "Edit"} onPress={onEdit} />}
      />
      <FlatList
        data={sortClasses(linked)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <ClassCard item={item} teachers={teachers} books={books} locations={locations} compact showDate />}
        ListEmptyComponent={
          <Text style={[type.meta, styles.empty, { color: colors.muted }, directional(isRTL)]}>
            {ar ? "لا توجد دروس مرتبطة بعد." : "No classes linked yet."}
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton icon="delete-outline" variant="danger" label={deleteLabel} onPress={confirmDelete} />
          </View>
        }
      />
    </ScreenContainer>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.stat}>
      <Text style={[type.title, { color: colors.text }]}>{value}</Text>
      <Text style={[type.meta, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

export function ReferenceForm({
  title,
  intro,
  error,
  saving,
  saveLabel,
  onSave,
  children,
}: {
  title: string;
  intro?: string;
  error?: string;
  saving: boolean;
  saveLabel: string;
  onSave: () => void;
  children: ReactNode;
}) {
  const colors = useColors();
  const { isRTL, language } = useI18n();
  return (
    <ScreenContainer>
      <TopBar onBack={goBackOrHome} title={title} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          {intro ? <Text style={[type.meta, { color: colors.muted }, directional(isRTL)]}>{intro}</Text> : null}
          {children}
          {error ? <FormNotice message={error} /> : null}
        </ScrollView>
        <View style={[styles.formFooter, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <PrimaryButton icon="check" label={saving ? (language === "ar" ? "جارٍ الحفظ…" : "Saving…") : saveLabel} disabled={saving} onPress={onSave} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowReverse: { flexDirection: "row-reverse" },
  content: { paddingBottom: 40, paddingHorizontal: space.gutter },
  hero: { alignItems: "center", flexDirection: "row", gap: space.lg, paddingBottom: space.lg, paddingTop: space.sm },
  heroIcon: { alignItems: "center", borderRadius: radius.lg, height: 60, justifyContent: "center", width: 60 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, paddingBottom: space.lg },
  stats: { alignItems: "center", borderBottomWidth: hairline, borderTopWidth: hairline, flexDirection: "row", marginBottom: space.lg, paddingVertical: space.md },
  stat: { alignItems: "center", flex: 1 },
  divider: { height: 32, width: hairline },
  separator: { height: space.sm },
  empty: { paddingVertical: space.md },
  footer: { marginTop: space.xxl },
  formContent: { gap: space.xxl, paddingBottom: space.xxl, paddingHorizontal: space.gutter, paddingTop: space.sm },
  formFooter: { borderTopWidth: hairline, paddingHorizontal: space.gutter, paddingVertical: space.md },
});
