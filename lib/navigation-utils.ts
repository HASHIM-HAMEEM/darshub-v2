export function resolveBackAction(canGoBack: boolean): "back" | "home" {
  return canGoBack ? "back" : "home";
}
