import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle, SearchField } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useDars } from "@/lib/dars-context";
import { getTabListBottomPadding } from "@/lib/responsive-layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BooksScreen() {
  const { books } = useDars(); const insets = useSafeAreaInsets(); const [query, setQuery] = useState(""); const list = useMemo(() => books.filter((book) => `${book.name} ${book.author} ${book.subject}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [books, query]);
  return <ScreenContainer edges={["top", "left", "right"]}><FlatList data={list} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 16 }]} ListHeaderComponent={<View style={styles.header}><ScreenTitle title="Books" action={<IconButton icon="add" label="Add book" tone="primary" onPress={() => router.push("/book/form" as never)} />} /><SearchField value={query} onChangeText={setQuery} placeholder="Search books or authors" /></View>} renderItem={({ item }) => <DirectoryRow icon="menu-book" title={item.name} subtitle={`${item.author} · ${item.subject}`} tag={item.studyStatus} onPress={() => router.push(`/book/${item.id}` as never)} />} ListEmptyComponent={<EmptyState icon="menu-book" title="No books found" message="Try another search, or add a study text." actionLabel="Add book" onAction={() => router.push("/book/form" as never)} />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 20 }, header: { gap: 15, marginBottom: 9 } });
