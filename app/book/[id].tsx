import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ClassCard, EmptyState, IconButton, ScreenTitle, SubjectBadge } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { goBackOrHome } from "@/lib/navigation";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const colors = useColors(); const { books, classes, teachers, locations } = useDars(); const book = books.find((item) => item.id === id); const linked = classes.filter((item) => item.bookId === id);
  if (!book) return <ScreenContainer><EmptyState title="Book not found" message="This text is no longer in your library." actionLabel="Back to books" onAction={() => router.replace("/books" as never)} /></ScreenContainer>;
  return <ScreenContainer><FlatList data={linked} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item }) => <View style={styles.item}><ClassCard item={item} teachers={teachers} books={books} locations={locations} /></View>} ListHeaderComponent={<View style={styles.header}><ScreenTitle eyebrow="Study text" title={book.name} action={<IconButton icon="close" label="Close book" onPress={goBackOrHome} />} /><View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.author, { color: colors.muted }]}>{book.author}</Text><SubjectBadge label={book.subject} />{book.studyStatus ? <Text style={[styles.status, { color: colors.tint }]}>{book.studyStatus}</Text> : null}{book.description ? <Text style={[styles.description, { color: colors.text }]}>{book.description}</Text> : null}</View><Text style={[styles.heading, { color: colors.text }]}>Linked classes</Text></View>} ListEmptyComponent={<EmptyState icon="menu-book" title="No linked classes" message="Classes studying this book will appear here." />} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, header: { gap: 18, paddingBottom: 8 }, hero: { borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, gap: 10, paddingVertical: 15 }, author: { fontSize: 15, fontWeight: "600" }, status: { fontSize: 12, fontWeight: "800", letterSpacing: 0.45, textTransform: "uppercase" }, description: { fontSize: 14, lineHeight: 21 }, heading: { fontSize: 15, fontWeight: "800", marginTop: 2 }, item: { marginTop: 2 } });
