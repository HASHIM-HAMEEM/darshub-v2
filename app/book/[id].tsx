import { router, useLocalSearchParams } from "expo-router";
import { SubjectBadge } from "@/components/dars-ui";
import { ReferenceDetail, ReferenceMissing, studyStatusLabel, type InfoRow } from "@/components/reference-screens";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, classes, deleteBook } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const book = books.find((item) => item.id === id);
  if (!book) return <ReferenceMissing title={ar ? "الكتاب غير موجود" : "Book not found"} message={ar ? "لم يعد هذا الكتاب في مكتبتك." : "This book is no longer in your library."} />;
  const rows: InfoRow[] = [
    ...(book.studyStatus ? [{ icon: "bookmark-border" as const, title: studyStatusLabel(book.studyStatus, ar), detail: ar ? "حالة الدراسة" : "Study status" }] : []),
    ...(book.description ? [{ icon: "notes" as const, title: book.description, detail: ar ? "الوصف" : "Description" }] : []),
  ];
  return (
    <ReferenceDetail
      icon="menu-book"
      kind={ar ? "كتاب" : "Book"}
      title={book.name}
      subtitle={book.author}
      badges={<SubjectBadge label={book.subject} />}
      rows={rows}
      linked={classes.filter((item) => item.bookId === book.id)}
      deleteLabel={ar ? "حذف الكتاب" : "Delete book"}
      onEdit={() => router.push(`/book/form?id=${book.id}` as never)}
      onDelete={() => {
        if (deleteBook(book.id).ok) goBackOrHome();
      }}
    />
  );
}
