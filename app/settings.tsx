import { ScrollView, StyleSheet } from "react-native";
import { TopBar } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { SettingsContent } from "@/components/settings-content";
import { space } from "@/constants/design";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";

export default function SettingsScreen() {
  const { language } = useI18n();
  return (
    <ScreenContainer>
      <TopBar onBack={goBackOrHome} title={language === "ar" ? "الإعدادات" : "Settings"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsContent />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingBottom: 40, paddingHorizontal: space.gutter } });
