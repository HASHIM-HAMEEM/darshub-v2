import { router, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { showAlert } from "@/lib/alert";
import { ReferenceDetail, ReferenceMissing, type InfoRow } from "@/components/reference-screens";
import { useDars } from "@/lib/dars-context";
import { useI18n } from "@/lib/i18n";
import { goBackOrHome } from "@/lib/navigation";

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locations, classes, deleteLocation } = useDars();
  const { language } = useI18n();
  const ar = language === "ar";
  const location = locations.find((item) => item.id === id);
  if (!location) return <ReferenceMissing title={ar ? "المكان غير موجود" : "Place not found"} message={ar ? "لم يعد هذا المكان في مكتبتك." : "This place is no longer in your library."} />;
  const openMap = async () => {
    const query = [location.name, location.address, location.area, location.city].filter(Boolean).join(", ");
    try {
      await Linking.openURL(location.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
    } catch {
      showAlert(ar ? "الخريطة غير متاحة" : "Map unavailable", ar ? "تعذر فتح تطبيق الخرائط." : "Could not open a maps app.");
    }
  };
  const rows: InfoRow[] = [
    ...(location.address ? [{ icon: "signpost" as const, title: location.address, detail: ar ? "العنوان" : "Address" }] : []),
    { icon: "map", title: ar ? "فتح في الخرائط" : "Open in Maps", detail: location.mapLink ? undefined : ar ? "بحث بالاسم والعنوان" : "Search by name and address", onPress: () => void openMap() },
    ...(location.notes ? [{ icon: "notes" as const, title: location.notes, detail: ar ? "ملاحظات" : "Notes" }] : []),
  ];
  return (
    <ReferenceDetail
      icon="location-on"
      kind={ar ? "مكان" : "Place"}
      title={location.name}
      subtitle={[location.area, location.city].filter(Boolean).join(", ")}
      rows={rows}
      linked={classes.filter((item) => item.locationId === location.id)}
      deleteLabel={ar ? "حذف المكان" : "Delete place"}
      onEdit={() => router.push(`/location/form?id=${location.id}` as never)}
      onDelete={() => {
        if (deleteLocation(location.id).ok) goBackOrHome();
      }}
    />
  );
}
