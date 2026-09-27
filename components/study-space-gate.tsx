import { Icon } from "@/components/doodle";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/dars-ui";
import { HydrationSkeleton } from "@/components/hydration-skeleton";
import { MotionPressable } from "@/components/motion-pressable";
import { directional, radius, space, type } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";

export function StudySpaceGate({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dataStatus, saveStatus, saveError, retryHydration, retrySave } = useDars();
  const { isRTL, language } = useI18n();
  const ar = language === "ar";
  if (dataStatus === "ready")
    return (
      <>
        {children}
        {saveStatus === "error" ? (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.snackbar, isRTL && styles.rowReverse, { backgroundColor: colors.text, bottom: getTabListBottomPadding(insets.bottom) }]}
          >
            <Icon name="cloud-off" size={18} color={colors.background} />
            <Text style={[type.meta, styles.flex, { color: colors.background }, directional(isRTL)]}>
              {ar ? "لم يُحفظ آخر تعديل." : "Your latest change wasn't saved."}
            </Text>
            <MotionPressable accessibilityRole="button" rippleBorderless hitSlop={10} onPress={retrySave} style={styles.retry}>
              <Text style={[type.label, { color: colors.background }]}>{ar ? "إعادة المحاولة" : "Retry"}</Text>
            </MotionPressable>
          </View>
        ) : null}
      </>
    );
  if (dataStatus !== "error") return <HydrationSkeleton />;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.icon, { backgroundColor: colors.subtle }]}>
        <Icon name="sync-problem" size={32} color={colors.error} />
      </View>
      <Text style={[type.title, styles.center, { color: colors.text }]}>{ar ? "تعذر تحميل بياناتك" : "Couldn't load your study space"}</Text>
      <Text style={[type.body, styles.center, styles.message, { color: colors.muted }]}>
        {saveError ?? (ar ? "بياناتك ما زالت على هذا الجهاز. حاول مرة أخرى قبل إجراء أي تغيير." : "Your data is still on this device. Try again before making changes.")}
      </Text>
      <PrimaryButton icon="refresh" label={ar ? "حاول مرة أخرى" : "Try again"} onPress={retryHydration} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: "center" },
  rowReverse: { flexDirection: "row-reverse" },
  container: { alignItems: "center", flex: 1, gap: space.md, justifyContent: "center", padding: space.xxl },
  icon: { alignItems: "center", borderRadius: radius.pill, height: 72, justifyContent: "center", marginBottom: space.sm, width: 72 },
  message: { marginBottom: space.md, maxWidth: 320 },
  snackbar: {
    alignItems: "center",
    borderRadius: radius.md,
    elevation: 6,
    flexDirection: "row",
    gap: space.md,
    left: space.lg,
    minHeight: 48,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    position: "absolute",
    right: space.lg,
  },
  retry: { justifyContent: "center", minHeight: 36 },
});
