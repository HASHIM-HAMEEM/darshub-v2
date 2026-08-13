# DarsHub UI Recovery Goal Ledger

## Test target

The target is the DarsHub Expo mobile application, tested through deterministic component and utility checks plus static runtime validation. Local notification permission prompts and delivery require a physical iOS/Android device; the web preview is not accepted as proof of device notification delivery.

| ID | Priority | Acceptance criterion | Initial state | Evidence required |
|---|---|---|---|---|
| AC-01 | S1 | Selecting English or Arabic changes date and time language consistently on Calendar, Home, class cards, and Class Detail, with no fixed-English parsing or clipped mixed-language text. | UNTESTED | Unit assertions for locale formatting and rendered component configuration; TypeScript/lint pass. |
| AC-02 | S1 | Every visible primary action in Home, Schedule, Settings, Forms, and Class Detail either completes its advertised action or provides a clear native status/error response. | UNTESTED | Targeted unit tests plus route/action inspection and regression output. |
| AC-03 | S1 | On a supported physical device, enabling reminders asks for notification permission when needed, shows a usable denied state, creates/updates upcoming reminder schedules, and clears schedules when disabled or a class is completed/deleted. | UNTESTED | Deterministic reminder service tests; device-run evidence is required before claiming device delivery. |
| AC-04 | S2 | Classes, reference records, and preferences use resilient local persistence and survive a reload without losing valid saved data. | UNTESTED | Storage unit tests covering load, malformed stored data, and save payloads. |
| AC-05 | S2 | The visual system reads as a calm original Islamic study journal, not a finance/crypto dashboard: no floating finance-style centre control, quieter layout, and original doodle illustrations/icons reinforce empty and setup states. | UNTESTED | Screen/component review plus generated asset inspection and static responsive checks. |
| AC-06 | S2 | The redesigned navigation and content remain usable on compact phone and tablet widths with 44 px-or-larger controls and no list/card layout collision. | UNTESTED | Responsive utility tests and component style assertions. |

## Cycle log

| Cycle | Role | Criterion | Result | Evidence | Next action |
|---|---|---|---|---|---|
| 1 | Planner | AC-01 to AC-06 | IN_PROGRESS | Ledger created from reported failures. | Inspect root, tab, reminder, storage, and language implementation. |
| 2 | Explorer | AC-01 | FAIL / PRODUCT_BUG | Settings stores only `dateLanguage`; visible navigation and study UI remain English, and no app-level RTL wrapper exists. | Replace date-only preference with an app language preference, translation strings, and dynamic direction support. |
| 3 | Explorer | AC-03 | FAIL / PRODUCT_BUG | Reminder service returns only a boolean, silently re-requests permission during data sync, has no denied/unsupported status, no notification-response routing, and disables sound. | Build explicit reminder status APIs, a supported-device permission flow, response routing, and deterministic scheduling tests. |
| 4 | Explorer | AC-05 | FAIL / PRODUCT_BUG | The current tab bar uses a raised circular centre Add control and the Home screenshot uses a dominant saturated panel, resembling a finance/crypto dashboard rather than a study journal. | Replace the raised centre control and introduce a doodle-led calm study-journal visual system. |
| 5 | Fix / Regression | AC-03 | PARTIAL / BLOCKED | Reminder flow now exposes `granted`, `denied`, `undetermined`, and `unavailable`; it opens native settings after denial, uses a high-importance Android channel with sound, only schedules after permission, cancels stale schedules, and routes notification taps to the correct class. Pure schedule planning tests pass. | Verify permission prompt and delivered notification on a physical iOS/Android device. |
| 6 | Fix / Regression | AC-04 | PASS | Local classes, reference records, and preferences save through separate AsyncStorage keys. Tests cover empty state, malformed values, saved data, and preference-default merging. | Continue UI-language and visual checks. |
| 7 | Fix / Regression | AC-01 | IN_PROGRESS | App language is now a persisted setting; Settings, tab navigation, Home headings, empty states, filter labels, dates, and times respond to Arabic/English. Direction is applied on Home and Settings. | Translate and inspect remaining primary study screens during the visual rebuild. |
| 8 | Fix / Regression | AC-02 | IN_PROGRESS | The elevated central tab action was replaced with an ordinary Add destination; existing haptic controls remain wired. Static validation and 15 deterministic tests pass. | Run final interaction-focused regression after redesign. |
| 9 | Critic / Regression | AC-01 | PASS | Home, Schedule, More, Settings, Class Detail, Add/Edit Class, class rows, locale-aware dates, and directional chevrons now respond to the persisted English/Arabic mode. Static validation and deterministic calendar checks pass. | Retain the locale regression coverage. |
| 10 | Critic / Regression | AC-02 | PASS | The critic’s suspected missing Add route was disproved by filesystem evidence: `app/(tabs)/add.tsx` exists and redirects to `/class/form`. Home, tab, form, and safe-back flows remain statically validated. | Retain route audit result. |
| 11 | Critic / Regression | AC-05 / AC-06 | PASS | Raised finance-like controls were removed, doodle assets were bundled for native builds, the Home emphasis is now a quiet surface, and existing responsive utility tests remain green. | Retain visual system and responsive regressions. |
| 12 | Critic | AC-03 | BLOCKED (physical device evidence required) | Reminder logic, storage planning, cancellation behavior, native channel configuration, and response routing are covered by implementation and deterministic tests. A physical iOS/Android device must still grant the OS permission and receive a scheduled notification before delivery can be claimed. | Have the student test the latest checkpoint in Expo Go or a development build and report the permission prompt plus delivered reminder result. |

## Guardrails

No user records will be cleared. Notification permission cannot be silently granted: the operating system must present and the student must approve the prompt. A browser preview is not considered a valid device-notification test surface.
