import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DirectoryRow, EmptyState, IconButton, ScreenTitle, SearchField, SegmentedControl } from "@/components/dars-ui";
import { ScreenContainer } from "@/components/screen-container";
import { hairline, radius, space } from "@/constants/design";
import { useColors } from "@/hooks/use-colors";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { getTabListBottomPadding } from "@/lib/responsive-layout";

const kinds = ["teachers", "books", "places"] as const;
type LibraryKind = (typeof kinds)[number];

export default function LibraryScreen() {
  const colors = useColors();
  const { teachers, books, locations, classes } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<LibraryKind>("teachers");
  const [query, setQuery] = useState("");
  const labels: Record<LibraryKind, string> = {
    teachers: ar ? "المعلمون" : "Teachers",
    books: ar ? "الكتب" : "Books",
    places: ar ? "الأماكن" : "Places",
  };
  const singular: Record<LibraryKind, string> = {
    teachers: ar ? "معلم" : "teacher",
    books: ar ? "كتاب" : "book",
    places: ar ? "مكان" : "place",
  };
  const items = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const count = (key: "teacherId" | "bookId" | "locationId", id: string) => `${classes.filter((entry) => entry[key] === id).length}`;
    const source =
      kind === "teachers"
        ? teachers.map((item) => ({
            id: item.id,
            title: item.name,
            subtitle: item.subjects.join(" · "),
            icon: "person" as const,
            route: `/teacher/${item.id}`,
            tag: count("teacherId", item.id),
          }))
        : kind === "books"
          ? books.map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: [item.author, item.subject].filter(Boolean).join(" · "),
              icon: "menu-book" as const,
              route: `/book/${item.id}`,
              tag: count("bookId", item.id),
            }))
          : locations.map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: [item.area, item.city].filter(Boolean).join(" · "),
              icon: "place" as const,
              route: `/location/${item.id}`,
              tag: count("locationId", item.id),
            }));
    return source
      .filter((item) => !q || `${item.title} ${item.subtitle}`.toLocaleLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, classes, kind, locations, query, teachers]);
  const addPath = kind === "teachers" ? "/teacher/form" : kind === "books" ? "/book/form" : "/location/form";
  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: getTabListBottomPadding(insets.bottom) + 8 }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenTitle
              title={ar ? "المكتبة" : "Library"}
              action={
                <IconButton
                  icon="add"
                  tone="primary"
                  label={ar ? `إضافة ${singular[kind]}` : `Add ${singular[kind]}`}
                  onPress={() => router.push(addPath as never)}
                />
              }
            />
            <SegmentedControl values={kinds} selected={kind} onSelect={setKind} labels={labels} />
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={ar ? `ابحث في ${labels[kind]}` : `Search ${labels[kind].toLocaleLowerCase()}`}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.cell,
              { backgroundColor: colors.surface, borderColor: colors.border },
              index === 0 && styles.cellFirst,
              index === items.length - 1 && styles.cellLast,
            ]}
          >
            <DirectoryRow
              icon={item.icon}
              initials={kind === "teachers"}
              title={item.title}
              subtitle={item.subtitle || (ar ? "بدون تفاصيل إضافية" : "No additional details")}
              tag={item.tag}
              last={index === items.length - 1}
              onPress={() => router.push(item.route as never)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={kind === "teachers" ? "person-outline" : kind === "books" ? "menu-book" : "place"}
            title={query ? (ar ? "لا نتائج" : "No matches") : ar ? `لا توجد ${labels[kind]}` : `No ${labels[kind].toLocaleLowerCase()} yet`}
            message={query ? (ar ? "جرّب كلمة أخرى." : "Try a different word.") : ar ? "أضف سجلاً لربطه بالدروس." : "Add one to connect it with your classes."}
            actionLabel={query ? undefined : ar ? `إضافة ${singular[kind]}` : `Add ${singular[kind]}`}
            onAction={query ? undefined : () => router.push(addPath as never)}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.gutter, paddingTop: space.md },
  header: { gap: space.md, marginBottom: space.lg },
  cell: { borderLeftWidth: hairline, borderRightWidth: hairline, overflow: "hidden" },
  cellFirst: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderTopWidth: hairline },
  cellLast: { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, borderBottomWidth: hairline },
});
