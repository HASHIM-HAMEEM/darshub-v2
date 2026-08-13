import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BooksScreen() {
  const { books, classes } = useDars(); const { language } = useI18n(); const insets = useSafeAreaInsets(); const list = useMemo(() => [...books].sort((a, b) => a.name.localeCompare(b.name)), [books]);
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle title={language === "ar" ? "الكتب" : "Books"} action={<IconButton icon="add" label={language === "ar" ? "أضف كتاباً" : "Add book"} onPress={() => router.push("/book/form" as never)} />} /></View>} renderItem={({ item }) => <DirectoryRow icon="menu-book" title={item.name} subtitle={`${item.author} · ${item.subject}`} tag={`${classes.filter((entry) => entry.bookId === item.id).length} ${language === "ar" ? "دروس" : "classes"}`} onPress={() => router.push(`/book/${item.id}` as never)} />} ListEmptyComponent={<EmptyState icon="menu-book" title={language === "ar" ? "لا توجد كتب" : "No books found"} message={language === "ar" ? "أضف كتاباً لبدء مكتبتك." : "Add a study text to start your library."} actionLabel={language === "ar" ? "أضف كتاباً" : "Add book"} onAction={() => router.push("/book/form" as never)} />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, header: { marginBottom: 1 } });
