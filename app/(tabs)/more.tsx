import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MotionPressable } from "@/components/motion-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MoreScreen() {
  const colors = useColors(); const insets = useSafeAreaInsets(); const { t, isRTL, language } = useI18n(); const writing = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const }; const items = [{ icon: "menu-book" as const, title: t("books"), route: "/books" }, { icon: "location-on" as const, title: t("locations"), route: "/locations" }, { icon: "search" as const, title: t("searchFilter"), route: "/search" }, { icon: "settings" as const, title: t("settings"), route: "/settings" }];
  return <ScreenContainer edges={["top", "left", "right"]}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} showsVerticalScrollIndicator={false}><Text style={[styles.title, { color: colors.text }, writing]}>{language === "ar" ? "المزيد" : "More"}</Text><View style={styles.list}>{items.map((item) => <MotionPressable key={item.route} accessibilityRole="button" onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.card, isRTL && styles.rowReverse, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: "#000", opacity: pressed ? 0.66 : 1 }]}><View style={[styles.icon, { backgroundColor: colors.wash }]}><MaterialIcons name={item.icon} size={19} color={colors.tint} /></View><Text style={[styles.itemTitle, { color: colors.text }, writing]}>{item.title}</Text><MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={18} color={colors.muted} /></MotionPressable>)}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, paddingTop: 8 }, rowReverse: { flexDirection: "row-reverse" }, title: { fontSize: 21, fontWeight: "700", lineHeight: 27, marginBottom: 16 }, list: { gap: 12 }, card: { alignItems: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 12, minHeight: 70, padding: 14, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, icon: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 }, itemTitle: { flex: 1, fontSize: 14.5, fontWeight: "600" } });
