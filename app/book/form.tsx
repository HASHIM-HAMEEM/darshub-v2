import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FormSection, PickerField, TextField } from "@/components/form-ui";
import { ReferenceForm, studyStatusLabel } from "@/components/reference-screens";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { subjects, type Book } from "@/lib/types/dars";

const studyStatuses: NonNullable<Book["studyStatus"]>[] = ["Current study", "Planned", "Completed"];

export default function BookFormScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id?: string; returnTo?: string }>();
  const { books, saveBook, returnToClassWithReference } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const existing = useMemo(() => books.find((item) => item.id === id), [books, id]);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("Hadith");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<NonNullable<Book["studyStatus"]>>("Current study");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setAuthor(existing.author);
    setSubject(existing.subject);
    setDescription(existing.description ?? "");
    setStatus(existing.studyStatus ?? "Current study");
  }, [existing]);
  const save = () => {
    if (saving) return;
    setSaving(true);
    const result = saveBook({ name, author, subject, description: description || undefined, studyStatus: status }, existing?.id);
    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }
    if (returnTo === "class") {
      returnToClassWithReference("book", result.id);
      router.back();
      return;
    }
    router.replace(`/book/${result.id}` as never);
  };
  const clear = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError("");
  };
  return (
    <ReferenceForm
      title={existing ? (ar ? "تعديل الكتاب" : "Edit book") : ar ? "كتاب جديد" : "New book"}
      intro={existing ? (ar ? "تظهر التعديلات في كل درس يستخدم هذا الكتاب." : "Changes appear everywhere this book is used.") : undefined}
      error={error}
      saving={saving}
      saveLabel={existing ? (ar ? "حفظ التعديلات" : "Save changes") : ar ? "حفظ الكتاب" : "Save book"}
      onSave={save}
    >
      <FormSection title={ar ? "الكتاب" : "Book"}>
        <TextField label={ar ? "اسم الكتاب" : "Book name"} value={name} onChangeText={clear(setName)} placeholder={ar ? "مثال: بلوغ المرام" : "e.g. Bulugh al-Maram"} autoCapitalize="words" required />
        <TextField label={ar ? "المؤلف" : "Author"} value={author} onChangeText={clear(setAuthor)} placeholder={ar ? "مثال: ابن حجر" : "e.g. Ibn Hajar"} autoCapitalize="words" required />
        <PickerField label={ar ? "المادة" : "Subject"} value={subject} options={subjects.map((item) => ({ label: item, value: item }))} onSelect={setSubject} />
        <PickerField
          label={ar ? "حالة الدراسة" : "Study status"}
          value={status}
          options={studyStatuses.map((item) => ({ label: studyStatusLabel(item, ar), value: item }))}
          onSelect={(value) => setStatus(value as NonNullable<Book["studyStatus"]>)}
        />
        <TextField label={ar ? "الوصف" : "Description"} value={description} onChangeText={setDescription} multiline />
      </FormSection>
    </ReferenceForm>
  );
}
