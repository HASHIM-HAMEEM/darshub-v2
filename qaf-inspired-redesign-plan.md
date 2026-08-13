# DarsHub Qaf-Inspired Interface Reset Plan

## Goal

Replace the current Durus-led visual presentation with an **original, Qaf-inspired calm study-companion interface** for DarsHub. The redesign will take inspiration only from the publicly observable Qaf qualities: an almost-white canvas, sparse chrome, compact top bar, text-first hierarchy, quiet dividers, a focused content column, and an input/composer-like primary action. It will **not** copy Qaf’s logo, branded assets, exact screen compositions, content, or chat product model.

The outcome will preserve DarsHub’s existing local-first class planning, bilingual Arabic/English and RTL behavior, Hijri dates, dark theme, reminders, tablets, add/edit flows, and data persistence. The central quality objective is to make the app feel like a polished contemporary mobile product rather than a decorative Islamic dashboard.

## Design Decisions

| Area | Decision |
|---|---|
| Product character | A quiet personal study companion: precise, readable, and uncluttered rather than ornamental or card-heavy. |
| Qaf qualities to adapt | Near-white paper surface, restrained ink palette, high information focus, simple row rhythm, compact controls, modest corner radii, and composer-like action affordances. |
| DarsHub identity | Preserve the existing DarsHub name and Arabic launcher assets. Use the product’s reserved deep-green only for selection, completion, and the single primary action; remove the oversized pine-and-gold hero language. |
| Typography | Use the clean sans face for all English UI hierarchy. Keep a highly readable Arabic text face for Arabic; reserve display typography for no more than one context-specific title where it materially improves Arabic legibility. |
| Surface hierarchy | Default to a soft paper canvas with tonal grouping and hairline dividers. Use a raised surface only for the next class, a selected date, a modal/sheet, or an important empty-state action. Eliminate routine shadows, nested cards, and ornamental geometry. |
| Shape and depth | Use 10–14 px radii for interactive components and 16–20 px only for the next-class focus module and sheets. Prefer subtle border/tonal depth over drop shadows. |
| Primary action | Replace competing hero, floating, and raised actions with one contextual compose-style trigger, labelled clearly as `Add class`. On phones it remains reachable above navigation; on tablets it becomes a compact header or sidebar action. |
| Navigation | Keep the established stable destinations—Home, Schedule, Add, Teachers, More—but make the Add destination visually integrated and behaviorally reliable. No duplicate Home FAB. The Add control opens the existing four-step form without changing the selected tab. |
| Motion | Use 140–220 ms opacity, position, and sheet continuity only. No entrance staggers, bouncing, decorative animations, or nonessential transforms. Honor reduced-motion settings. |
| Accessibility | Maintain 44–48 px targets, AA contrast, explicit accessible labels, dynamic text tolerance, semantic RTL mirroring, and bottom-safe actions/sheets. |

## Screen-by-Screen Redesign Scope

| Screen / flow | New structure and behavior |
|---|---|
| Home | Replace the greeting, Durus hero, chips, and duplicate FAB with a compact date/context header, one `Next` class focus module, a sparse chronological list, and a single compose-style `Add class` trigger. When empty, show one sentence and one direct action—not setup copy or several choices. |
| Schedule | Use an ink-led date navigator with an unobtrusive active-day marker, a clean day timeline, and optional week grouping. Hide filters behind one clearly labelled control. Keep class rows time-first and disclose book/location only in detail. |
| Add / edit class | Retain the four-step Class → Time → Place → Review logic, but restyle it as a focused editing canvas: compact progress indicator, plain labelled fields, native sheets for selection, and a keyboard-safe fixed Continue/Save action. Show only one decision group per step. |
| Class detail | Replace the large pine hero and visible action cluster with a compact contextual app bar, a text-first class summary, ordered metadata rows, and an overflow/context sheet for secondary actions. Keep Edit as the sole immediately prominent action; keep map/share accessible but visually secondary. |
| Teachers | Rebuild as a focused people directory: compact header, optional in-place search, avatar/name/subject row anatomy, thin separators, and one add action. Remove elevated card repetition. |
| Books and locations | Reuse the same directory template with appropriate restrained entity icons, single supporting line, and predictable disclosure. |
| Teacher, book, and location details | Consolidate onto one quiet detail template: contextual header, title/identity block, essential data rows, linked classes, and a clearly separated destructive/action section only when needed. |
| Search | Make search a dedicated, immediate-focus workspace: one prominent search/composer field, suggested entity scopes, filter sheet instead of an expanded inline panel, live result count, and direct zero-result guidance. |
| More | Change from a bare list into a small destination index with compact explanatory hierarchy and consistent row treatment, without adding dashboard tiles. |
| Settings | Keep functional settings intact but apply a quiet preferences model: one headline, low-chrome sections, native switches/segmented choices, clear permission states, safe external/irreversible actions, and no decorative cards. |
| Dark and Arabic modes | Define dark graphite surfaces rather than inverted green panels. Test mixed Arabic/Latin dates, names, book titles, chevrons, tab order, native controls, and all directional actions. |

## Implementation Phases

1. **Baseline and visual audit.** Capture the current phone and tablet states, inspect every route and reusable component, and write a goal ledger that identifies redundant actions, legacy Durus hero treatments, inconsistent detail templates, low-priority metadata, and safe-area risks. The supplied Qaf reference will be treated as high-level inspiration only.

2. **Foundation reset.** Update `theme.config.js`, runtime semantic tokens, typography rules, spacing, radii, borders, shadows, dark-mode equivalents, reduced-motion values, and navigation tokens. Revise the design documentation so the Qaf-inspired system explicitly supersedes earlier Durus rules.

3. **Shared-primitives rebuild.** Refactor `components/dars-ui.tsx`, `components/form-ui.tsx`, `components/motion-pressable.tsx`, and tab-shell components first. Establish reusable app bars, composer-style action triggers, time rows, directory rows, compact icon actions, search field, bottom sheets, empty states, and keyboard/safe-area-safe action bars.

4. **Primary-flow rebuild.** Apply the new system to Home, Schedule, Add/Edit Class, Class Detail, Teachers, and Search. Remove the duplicate Home FAB, retain the reliable Add-tab-to-form handoff, and preserve all create/edit/delete/reminder behaviors.

5. **Supporting-flow consistency.** Adapt Books, Locations, More, Settings, and all teacher/book/location details to the shared templates. Consolidate settings and details rather than allowing bespoke legacy surfaces to remain.

6. **Responsive and inclusive refinement.** Implement phone, tablet portrait, and tablet landscape rules. Use a centered, capped reading pane for focused forms and details; use master-detail or navigation-rail treatment for density where it genuinely improves browsing. Verify English, Arabic/RTL, light/dark, text scaling, touch targets, keyboard behavior, and gesture insets.

7. **Closed-loop validation and release.** Run the acceptance ledger through explorer, critic, fix/recovery, and regression cycles. Resolve all S1/S2 issues, run lint, TypeScript, deterministic tests, and device-surface checks; then save a release checkpoint only after independent review passes.

## Acceptance Criteria and Test Plan

| Criterion | Observable pass condition | Evidence |
|---|---|---|
| Clear hierarchy | Each primary screen presents one unambiguous primary action and no duplicate floating/raised controls. | Phone and tablet screenshots plus interaction walkthrough. |
| Qaf-inspired restraint | Home, Schedule, directories, details, and settings use paper/ink hierarchy, compact controls, quiet dividers, and no leftover oversized Durus hero or ornamental gold treatment. | Visual audit checklist across every route. |
| Core class workflow | A user can create a class through all four form steps, review, save, reopen, edit, and delete it without losing context. | Runtime flow evidence and automated regression results. |
| Add reliability | Tapping the central Add destination opens the form from any tab, preserves the previous selected tab, and dismisses safely. | Repeated navigation test on compact and large surfaces. |
| Search and directories | Search, scopes, filters, teacher/book/location rows, and linked-class navigation work in populated and empty states. | Runtime evidence in English and Arabic. |
| Theme and RTL | Every redesigned surface is legible and directional controls are correct in light/dark and English/Arabic modes. | Matrix screenshots and accessibility inspection. |
| Device safety | Sticky actions, option sheets, keyboard input, navigation, and last list rows remain reachable above home indicators and Android gesture areas. | Small-height phone and tablet test evidence. |
| Motion and accessibility | Press, page, and sheet motion is restrained and reduced-motion-safe; all controls have viable targets and labels. | Interaction audit and accessibility-tree checks. |
| Regression integrity | Local persistence, Hijri preferences, reminder scheduling/permission UI, navigation, and existing 15 deterministic tests stay intact. | Test output and refresh/persistence tests. |

## Assumptions and Risks

The plan assumes the user means the **Qaf Islamic AI app at qaf.ai**, not the distinct Qaf School product. The plan adapts its observed interaction philosophy rather than cloning it. It assumes no product data model changes are required; all improvements remain within the current Expo/React Native architecture and local-first storage.

Visual claims must be validated on physical devices or device-equivalent surfaces, especially for keyboards, notification delivery, Android gesture navigation, and iOS home-indicator spacing. The unresolved existing limitation remains physical-device confirmation that a scheduled reminder has actually been delivered; that will remain explicitly tracked until it can be verified on a real device.
