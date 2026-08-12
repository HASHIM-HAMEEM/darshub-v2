import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { DirectoryRow, ScreenTitle } from "@/components/dars-ui";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";

export default function MoreScreen() {
  const colors = useColors(); const { books, locations } = useDars();
  return <ScreenContainer><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><ScreenTitle eyebrow="Library & preferences" title="More" /><View style={[styles.list, { borderTopColor: colors.border }]}><DirectoryRow icon="menu-book" title="Books" subtitle={`${books.length} study texts`} onPress={() => router.push("/books" as never)} /><DirectoryRow icon="location-on" title="Locations" subtitle={`${locations.length} places`} onPress={() => router.push("/locations" as never)} /><DirectoryRow icon="tune" title="Search & filter" subtitle="Find a class by detail" onPress={() => router.push("/search" as never)} /></View><Text style={[styles.label, { color: colors.muted }]}>PREFERENCES</Text><View style={[styles.list, { borderTopColor: colors.border }]}><DirectoryRow icon="settings" title="Settings" subtitle="Theme, reminders, language" onPress={() => router.push("/settings" as never)} /></View><Text style={[styles.footer, { color: colors.muted }]}>Keep the schedule simple. Keep the study consistent.</Text></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 23, paddingBottom: 110, paddingTop: 4 }, list: { borderTopWidth: 1 }, label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 7, marginTop: 34 }, footer: { fontSize: 13, lineHeight: 20, marginTop: 56, textAlign: "center" } });
