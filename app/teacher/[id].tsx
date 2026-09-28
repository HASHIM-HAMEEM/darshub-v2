import { router, useLocalSearchParams } from "expo-router";
import { SubjectBadge } from "@/components/dars-ui";
import { ReferenceDetail, ReferenceMissing, type InfoRow } from "@/components/reference-screens";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { teachers, classes, deleteTeacher } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const teacher = teachers.find((item) => item.id === id);
  if (!teacher)
    return <ReferenceMissing title={ar ? "المعلم غير موجود" : "Teacher not found"} message={ar ? "لم يعد هذا المعلم في مكتبتك." : "This teacher is no longer in your library."} />;
  const rows: InfoRow[] = [
    ...(teacher.mainLocation ? [{ icon: "location-on" as const, title: teacher.mainLocation, detail: ar ? "المكان الرئيسي" : "Main location" }] : []),
    ...(teacher.contact ? [{ icon: "call" as const, title: teacher.contact, detail: ar ? "التواصل" : "Contact" }] : []),
    ...(teacher.bio ? [{ icon: "notes" as const, title: teacher.bio, detail: ar ? "نبذة" : "About" }] : []),
  ];
  return (
    <ReferenceDetail
      icon="person-outline"
      kind={ar ? "معلم" : "Teacher"}
      title={teacher.name}
      subtitle={teacher.title}
      badges={teacher.subjects.length ? teacher.subjects.map((subject) => <SubjectBadge key={subject} label={subject} />) : undefined}
      rows={rows}
      linked={classes.filter((item) => item.teacherId === teacher.id)}
      deleteLabel={ar ? "حذف المعلم" : "Delete teacher"}
      onEdit={() => router.push(`/teacher/form?id=${teacher.id}` as never)}
      onDelete={() => {
        if (deleteTeacher(teacher.id).ok) goBackOrHome();
      }}
    />
  );
}
