import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { DarsClass, DarsPreferences, Location } from "@/lib/types/dars";
import { planReminders, reminderCopy } from "@/lib/reminder-plan";

export type ReminderPermission = "granted" | "denied" | "undetermined" | "unavailable";
export type ReminderDiagnostics = { permission: ReminderPermission; scheduledClassReminders: number };

const CLASS_SOURCE = "darshub-class";
const REMINDER_CHANNEL = "classes";
const ALARM_CHANNEL = "class-alarms";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

let pendingSync: Promise<number> = Promise.resolve(0);
let channelsReady: Promise<void> | null = null;

function configureAndroidChannels() {
  if (Platform.OS !== "android") return Promise.resolve();
  channelsReady ??= Promise.all([
    Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
      name: "Class reminders",
      description: "Reminders before your upcoming dars",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 90, 180],
      enableVibrate: true,
      lightColor: "#127A55",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: "default",
    }),
    Notifications.setNotificationChannelAsync(ALARM_CHANNEL, {
      name: "Class alarms",
      description: "Loud alarm when a dars is starting",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 600, 250, 600, 250, 600],
      enableVibrate: true,
      bypassDnd: true,
      lightColor: "#127A55",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: "default",
      audioAttributes: { usage: Notifications.AndroidAudioUsage.ALARM, contentType: Notifications.AndroidAudioContentType.SONIFICATION },
    }),
  ])
    .then(() => undefined)
    .catch((error: unknown) => {
      channelsReady = null;
      throw error;
    });
  return channelsReady;
}

const toPermission = (status: Notifications.PermissionStatus): ReminderPermission =>
  status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined";

export async function getReminderPermission(): Promise<ReminderPermission> {
  if (Platform.OS === "web") return "unavailable";
  await configureAndroidChannels();
  const { status } = await Notifications.getPermissionsAsync();
  return toPermission(status);
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  const current = await getReminderPermission();
  if (current === "granted" || current === "unavailable") return current;
  const { status } = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  return toPermission(status);
}

async function cancelClassReminders() {
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((request) => request.content.data?.source === CLASS_SOURCE)
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier).catch(() => undefined)),
  );
}

export function syncClassReminders(items: DarsClass[], preferences: DarsPreferences, locations: Location[] = []): Promise<number> {
  const run = async () => {
    if (Platform.OS === "web") return 0;
    await cancelClassReminders();
    if (!preferences.remindersEnabled || (await getReminderPermission()) !== "granted") return 0;
    const alarm = preferences.reminderAlarm === true;
    const byId = new Map(items.map((item) => [item.id, item]));
    const places = new Map(locations.map((location) => [location.id, location.name]));
    const planned = planReminders(items, { leadMinutes: preferences.reminderLeadMinutes, alarmAtStart: alarm });
    const results = await Promise.allSettled(
      planned.map((reminder) => {
        const item = byId.get(reminder.classId);
        if (!item) return Promise.resolve("");
        const copy = reminderCopy(item, reminder, preferences.appLanguage, places.get(item.locationId));
        const loud = alarm && reminder.kind === "start";
        return Notifications.scheduleNotificationAsync({
          identifier: reminder.identifier,
          content: {
            ...copy,
            sound: "default",
            priority: loud ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
            interruptionLevel: "timeSensitive",
            data: { source: CLASS_SOURCE, classId: item.id, kind: reminder.kind },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.date, channelId: loud ? ALARM_CHANNEL : REMINDER_CHANNEL },
        });
      }),
    );
    return results.filter((result) => result.status === "fulfilled" && result.value).length;
  };
  const queued = pendingSync.then(run, run);
  pendingSync = queued.catch(() => 0);
  return queued;
}

export async function getReminderDiagnostics(): Promise<ReminderDiagnostics> {
  const permission = await getReminderPermission();
  if (Platform.OS === "web") return { permission, scheduledClassReminders: 0 };
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return { permission, scheduledClassReminders: requests.filter((request) => request.content.data?.source === CLASS_SOURCE).length };
}

export async function scheduleReminderVerification(options: { alarm?: boolean; language?: "en" | "ar" } = {}): Promise<ReminderPermission> {
  const permission = await requestReminderPermission();
  if (permission !== "granted") return permission;
  const ar = options.language === "ar";
  await Notifications.scheduleNotificationAsync({
    content: {
      title: ar ? "اختبار تذكير دارس هَب" : "DarsHub reminder check",
      body: ar ? "الإشعارات جاهزة لدروسك القادمة." : "Notifications are ready for your upcoming classes.",
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { source: "darshub-verification" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 7000), channelId: options.alarm ? ALARM_CHANNEL : REMINDER_CHANNEL },
  });
  return permission;
}

export function observeReminderResponses(onOpenClass: (classId: string) => void) {
  if (Platform.OS === "web") return () => undefined;
  let lastHandled: string | undefined;
  const open = (response: Notifications.NotificationResponse | null) => {
    if (!response) return;
    const key = response.notification.request.identifier + response.notification.date;
    if (key === lastHandled) return;
    lastHandled = key;
    const id = response.notification.request.content.data?.classId;
    if (typeof id === "string") onOpenClass(id);
  };
  void Notifications.getLastNotificationResponseAsync().then(open).catch(() => undefined);
  const subscription = Notifications.addNotificationResponseReceivedListener(open);
  return () => subscription.remove();
}
