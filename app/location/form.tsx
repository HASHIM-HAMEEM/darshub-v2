import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FormSection, TextField } from "@/components/form-ui";
import { ReferenceForm } from "@/components/reference-screens";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";

export default function LocationFormScreen() {
  const { id, returnTo } = useLocalSearchParams<{ id?: string; returnTo?: string }>();
  const { locations, saveLocation, returnToClassWithReference } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const existing = useMemo(() => locations.find((item) => item.id === id), [id, locations]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(() => locations[0]?.city ?? "");
  const [area, setArea] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setAddress(existing.address);
    setCity(existing.city);
    setArea(existing.area);
    setMapLink(existing.mapLink ?? "");
    setNotes(existing.notes ?? "");
  }, [existing]);
  const save = () => {
    if (saving) return;
    setSaving(true);
    const result = saveLocation({ name, address, city, area, mapLink: mapLink || undefined, notes: notes || undefined }, existing?.id);
    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }
    if (returnTo === "class") {
      returnToClassWithReference("location", result.id);
      router.back();
      return;
    }
    router.replace(`/location/${result.id}` as never);
  };
  const clear = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError("");
  };
  return (
    <ReferenceForm
      title={existing ? (ar ? "تعديل المكان" : "Edit place") : ar ? "مكان جديد" : "New place"}
      intro={existing ? (ar ? "تحديث المكان يحدّث مدينة كل الدروس المرتبطة." : "Updating a place keeps every linked class city aligned.") : undefined}
      error={error}
      saving={saving}
      saveLabel={existing ? (ar ? "حفظ التعديلات" : "Save changes") : ar ? "حفظ المكان" : "Save place"}
      onSave={save}
    >
      <FormSection title={ar ? "المكان" : "Place"}>
        <TextField label={ar ? "اسم المكان" : "Place name"} value={name} onChangeText={clear(setName)} placeholder={ar ? "مثال: مسجد الهدى" : "e.g. Masjid Al-Huda"} autoCapitalize="words" required />
        <TextField label={ar ? "المنطقة" : "Area"} value={area} onChangeText={clear(setArea)} placeholder={ar ? "مثال: مدينة نصر" : "e.g. Nasr City"} autoCapitalize="words" required />
        <TextField label={ar ? "المدينة" : "City"} value={city} onChangeText={clear(setCity)} placeholder={ar ? "القاهرة" : "Cairo"} autoCapitalize="words" required />
      </FormSection>
      <FormSection title={ar ? "تفاصيل اختيارية" : "Optional details"}>
        <TextField label={ar ? "العنوان" : "Address"} value={address} onChangeText={setAddress} placeholder={ar ? "الشارع أو العنوان التفصيلي" : "Street or detailed address"} />
        <TextField label={ar ? "رابط الخريطة" : "Map link"} value={mapLink} onChangeText={clear(setMapLink)} placeholder="https://maps.google.com/..." keyboardType="url" />
        <TextField label={ar ? "ملاحظات" : "Notes"} value={notes} onChangeText={setNotes} placeholder={ar ? "المدخل أو مكان اللقاء" : "Entrance or meeting note"} multiline />
      </FormSection>
    </ReferenceForm>
  );
}
