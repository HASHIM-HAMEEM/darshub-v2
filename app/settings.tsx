import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { IconButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { haptic } from "@/lib/haptics";
import { goBackOrHome } from "@/lib/navigation";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const colors = useColors(); const { colorScheme, setColorScheme } = useThemeContext();
  const Row = ({ icon, title, value, onPress, children }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; value?: string; onPress?: () => void; children?: React.ReactNode }) => <Pressable disabled={!onPress} onPress={() => { if (onPress) { haptic.light(); onPress(); } }} style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed && onPress ? 0.7 : 1 }]}><View style={[styles.iconBox, { backgroundColor: colors.wash }]}><MaterialIcons name={icon} size={19} color={colors.tint} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>{value ? <Text style={[styles.rowValue, { color: colors.muted }]}>{value}</Text> : null}</View>{children ?? (onPress ? <MaterialIcons name="chevron-right" size={20} color={colors.muted} /> : null)}</Pressable>;
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><ScreenTitle title="Settings" action={<IconButton icon="arrow-back" label="Back to home" onPress={goBackOrHome} />} /><Text style={[styles.groupLabel, { color: colors.muted }]}>APPEARANCE</Text><Row icon="dark-mode" title="Dark theme" value={colorScheme === "dark" ? "On" : "Off"}><Switch value={colorScheme === "dark"} onValueChange={(value) => { haptic.selection(); setColorScheme(value ? "dark" : "light"); }} trackColor={{ false: colors.border, true: colors.tint }} thumbColor={colors.surface} /></Row><Text style={[styles.groupLabel, { color: colors.muted }]}>ABOUT</Text><Row icon="info-outline" title="DarsHub" value="Version 1.0" onPress={() => Alert.alert("DarsHub", "A focused companion for organizing Islamic study classes.")} /></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { gap: 10, padding: 18, paddingBottom: 36, paddingTop: 6 }, groupLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, marginBottom: -2, marginTop: 12 }, row: { alignItems: "center", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 11, minHeight: 70, paddingHorizontal: 12, paddingVertical: 10 }, iconBox: { alignItems: "center", borderRadius: 13, height: 42, justifyContent: "center", width: 42 }, rowCopy: { flex: 1, gap: 3 }, rowTitle: { fontSize: 15, fontWeight: "800" }, rowValue: { fontSize: 11.5, lineHeight: 16 } });
