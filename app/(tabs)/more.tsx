import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { DirectoryRow, ScreenTitle } from "@/components/dars-ui";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "@/lib/i18n";

export default function MoreScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { books, locations } = useDars(); const { t, isRTL } = useI18n();
  return <ScreenContainer edges={["top", "left", "right"]}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }, isRTL && styles.rtl]} showsVerticalScrollIndicator={false}><ScreenTitle title={t("more")} /><Text style={[styles.sectionLabel, { color: colors.muted }]}>{t("studyLibrary").toUpperCase()}</Text><View><DirectoryRow icon="menu-book" title={t("books")} subtitle={`${books.length} ${t("classesCount")}`} onPress={() => router.push("/books" as never)} /><DirectoryRow icon="location-on" title={t("locations")} subtitle={`${locations.length} ${t("locations")}`} onPress={() => router.push("/locations" as never)} /><DirectoryRow icon="search" title={t("searchFilter")} subtitle={t("findClass")} onPress={() => router.push("/search" as never)} /></View><Text style={[styles.sectionLabel, { color: colors.muted }]}>{t("app").toUpperCase()}</Text><View><DirectoryRow icon="settings" title={t("settings")} subtitle={t("themeAndData")} onPress={() => router.push("/settings" as never)} /></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingTop: 6 }, rtl: { direction: "rtl" }, sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, marginBottom: 9, marginTop: 15 } });
