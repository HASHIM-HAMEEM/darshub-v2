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
  const colors = useColors(); const insets = useSafeAreaInsets(); const { t, isRTL, language } = useI18n(); const writing = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  const items = [{ icon: "menu-book" as const, title: t("books"), route: "/books" }, { icon: "location-on" as const, title: t("locations"), route: "/locations" }, { icon: "search" as const, title: t("searchFilter"), route: "/search" }, { icon: "settings" as const, title: t("settings"), route: "/settings" }];
  return <ScreenContainer edges={["top", "left", "right"]}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) }]} showsVerticalScrollIndicator={false}><Text style={[styles.title, { color: colors.text, writingDirection: isRTL ? "rtl" : "ltr" }]}>{language === "ar" ? "المزيد" : "More"}</Text><View style={[styles.list, { borderTopColor: colors.border }]}>{items.map((item) => <MotionPressable key={item.route} accessibilityRole="button" onPress={() => router.push(item.route as never)} style={({ pressed }) => [styles.item, isRTL && styles.rowReverse, { borderBottomColor: colors.border, opacity: pressed ? 0.66 : 1 }]}><View style={[styles.icon, { backgroundColor: colors.wash }]}><MaterialIcons name={item.icon} size={19} color={colors.tint} /></View><Text style={[styles.itemTitle, { color: colors.text }, writing]}>{item.title}</Text><MaterialIcons name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={colors.muted} /></MotionPressable>)}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingTop: 10 }, rowReverse: { flexDirection: "row-reverse" }, title: { fontSize: 29, fontWeight: "700", letterSpacing: -0.85, lineHeight: 35, marginBottom: 24 }, list: { borderTopWidth: StyleSheet.hairlineWidth }, item: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 12, minHeight: 68 }, icon: { alignItems: "center", borderRadius: 11, height: 38, justifyContent: "center", width: 38 }, itemTitle: { flex: 1, fontSize: 15, fontWeight: "700" } });
