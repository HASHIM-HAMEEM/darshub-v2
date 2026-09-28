import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FormSection, TextField } from "@/components/form-ui";
import { ReferenceForm } from "@/components/reference-screens";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";

export default function TeacherFormScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id?: string; returnTo?: string }>();
  const { teachers, saveTeacher, returnToClassWithReference } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const existing = useMemo(() => teachers.find((item) => item.id === id), [id, teachers]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [subjects, setSubjects] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setTitle(existing.title ?? "");
    setSubjects(existing.subjects.join(", "));
    setLocation(existing.mainLocation ?? "");
    setContact(existing.contact ?? "");
    setBio(existing.bio ?? "");
  }, [existing]);
  const save = () => {
    if (saving) return;
    setSaving(true);
    const result = saveTeacher(
      { name, title: title || undefined, subjects: subjects.split(/[,،]/), mainLocation: location || undefined, contact: contact || undefined, bio: bio || undefined },
      existing?.id,
    );
    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }
    if (returnTo === "class") {
      returnToClassWithReference("teacher", result.id);
      router.back();
      return;
    }
    router.replace(`/teacher/${result.id}` as never);
  };
  const clear = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError("");
  };
  return (
    <ReferenceForm
      title={existing ? (ar ? "تعديل المعلم" : "Edit teacher") : ar ? "معلم جديد" : "New teacher"}
      intro={existing ? (ar ? "تبقى كل الدروس المرتبطة محدثة." : "Every linked class stays in sync.") : undefined}
      error={error}
      saving={saving}
      saveLabel={existing ? (ar ? "حفظ التعديلات" : "Save changes") : ar ? "حفظ المعلم" : "Save teacher"}
      onSave={save}
    >
      <FormSection title={ar ? "المعلم" : "Teacher"}>
        <TextField label={ar ? "الاسم" : "Name"} value={name} onChangeText={clear(setName)} placeholder={ar ? "مثال: الشيخ محمود" : "e.g. Shaykh Mahmoud"} autoCapitalize="words" required />
        <TextField label={ar ? "اللقب" : "Title"} value={title} onChangeText={setTitle} placeholder={ar ? "شيخ، أستاذ…" : "Shaykh, Ustadh…"} autoCapitalize="words" />
        <TextField label={ar ? "المواد (مفصولة بفواصل)" : "Subjects (comma separated)"} value={subjects} onChangeText={clear(setSubjects)} placeholder="Hadith, Fiqh" required />
      </FormSection>
      <FormSection title={ar ? "تفاصيل اختيارية" : "Optional details"}>
        <TextField label={ar ? "المكان الرئيسي" : "Main location"} value={location} onChangeText={setLocation} placeholder={ar ? "أين يدرّس غالباً" : "Where they teach most often"} />
        <TextField label={ar ? "التواصل" : "Contact"} value={contact} onChangeText={setContact} placeholder={ar ? "هاتف أو بريد" : "Phone or email"} autoCapitalize="none" />
        <TextField label={ar ? "نبذة / ملاحظات" : "Bio / notes"} value={bio} onChangeText={setBio} multiline />
      </FormSection>
    </ReferenceForm>
  );
}
