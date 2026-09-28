import { Alert, Platform, type AlertButton } from "react-native";

export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = [title, message].filter(Boolean).join("\n\n");
  const actions = (buttons ?? []).filter((button) => button.style !== "cancel");
  if (actions.length === 0) {
    window.alert(text);
    return;
  }
  if (actions.length === 1 && buttons!.length === 1) {
    window.alert(text);
    actions[0].onPress?.();
    return;
  }
  if (actions.length === 1) {
    if (window.confirm(text)) actions[0].onPress?.();
    return;
  }
  const choice = window.prompt(`${text}\n\n${actions.map((button, index) => `${index + 1}. ${button.text}`).join("\n")}`, "1");
  const picked = actions[Number(choice) - 1];
  picked?.onPress?.();
}
