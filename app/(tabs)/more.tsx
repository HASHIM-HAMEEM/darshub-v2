import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { SettingsContent } from "@/components/settings-content";
import { space } from "@/constants/design";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + space.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenTitle title={language === "ar" ? "الإعدادات" : "Settings"} />
        <SettingsContent />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: space.gutter, paddingTop: space.sm } });
