import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { DarsClass, DarsPreferences } from "@/lib/types/dars";

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });

export async function requestReminderPermission() {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("classes", { name: "Class reminders", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 180], lightColor: "#164D3D" });
  const current = await Notifications.getPermissionsAsync();
  const status = current.status === "granted" ? current.status : (await Notifications.requestPermissionsAsync()).status;
  return status === "granted";
}

const reminderTime = (item: DarsClass, lead: number) => {
  const date = new Date(`${item.date}T${item.startTime}:00`);
  date.setMinutes(date.getMinutes() - lead);
  return date;
};

export async function syncClassReminders(items: DarsClass[], preferences: DarsPreferences) {
  if (Platform.OS === "web") return;
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(existing.filter((request) => request.content.data?.source === "darshub-class").map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)));
  if (!preferences.remindersEnabled) return;
  const allowed = await requestReminderPermission();
  if (!allowed) return;
  const upcoming = items.filter((item) => item.status === "upcoming" && reminderTime(item, preferences.reminderLeadMinutes).getTime() > Date.now());
  await Promise.all(upcoming.map((item) => Notifications.scheduleNotificationAsync({ content: { title: "DarsHub reminder", body: `${item.title} starts in ${preferences.reminderLeadMinutes} minutes.`, data: { source: "darshub-class", classId: item.id } }, trigger: { type: "date", date: reminderTime(item, preferences.reminderLeadMinutes), channelId: "classes" } as never })));
}
