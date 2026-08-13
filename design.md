# DarsHub Mobile Interface Plan

## Product Intent

DarsHub is a warm, durable study companion for students attending Islamic studies lessons in Egypt. The renewed product direction uses **quiet ivory canvas, decisive deep-green emphasis, a single primary action per screen, list-first information design, and restrained Islamic study motifs**. It should feel like a well-made personal study journal: calm, legible, and focused rather than a catalogue of cards.

The design remains optimized for **one-handed portrait use on a 9:16 phone**. On compact screens, the app presents a stable five-destination bottom bar and single-column task flows. Tablet portrait uses a generous centered work surface with selective two-column lists; tablet landscape becomes a master-detail study workspace rather than a stretched phone view. Dark mode remaps semantic surface and typography roles using green-charcoal surfaces and warm cream text, rather than simply inverting colours.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Home | A calm greeting, one next-class focus, a setup checklist for new users, and a short relevant agenda. The primary action advances the user’s next required setup step or starts a class. |
| Schedule | A Today / Week agenda grouped by day, with Arabic and Hijri date context, reminder state, and a concise empty state. |
| Add / Edit Class | A focused four-part form with prerequisite guidance, clear labels, native-style selections, and a reachable save action. It stores records locally and schedules reminders when enabled. |
| Class Detail | A focused overview of one dars with an upcoming status, teacher, book, dual calendar date, time, place, reminder state, notes, and a separated action dock. |
| Teachers | Scholar directory with subject specialties and the next upcoming class. A detail sheet lists linked classes and lets the user add a teacher. |
| Books | Book directory with author, subject, study status, and linked classes. Users can add books. |
| Locations | Place directory with city, area, and linked classes. Users can add locations and access a map placeholder. |
| Search & Filter | Full class search with filters for teacher, subject, book, city, and class status. |
| More | A quiet navigation list to Books, Locations, Subjects, Search & Filter, and Settings. |
| Settings | Theme, Arabic / English date presentation, Hijri display, reminder enablement and lead time, and a concise application details panel. |

## Key User Flows

| Goal | Flow |
|---|---|
| Check the next class | Open DarsHub → Home shows the next upcoming dars → tap it for full context and actions. |
| Add a dars | Tap the central Add tab → complete the four short sections → Save Class → return to Home with the new dars visible. |
| Update or complete a class | Open a class → tap Edit or Mark completed → confirm the change → local list and details update. |
| Find a relevant lesson | Use Home search or Search & Filter → choose a teacher, subject, book, city, or status → tap a matching class. |
| Browse reference details | Open Teachers / Books / Locations from tabs or More → tap a list item → inspect linked classes → add a new reference item if needed. |

## Reference-Aligned Direction

The Home screen opens with an inviting greeting and a small notification action. The next lesson receives a single deep-green featured card with a date/time lockup, prominent class title, teacher and location metadata, a quiet Islamic book motif, and a full-width `View details` affordance. Upcoming classes follow as compact white cards: each has a slim date column, clear class title, teacher and location lines, and one chevron. Filter pills are warm-green when selected and pale ivory otherwise. The quick add action is a circular deep-green control that stays in the thumb zone.

The experience follows five rules: **focus one primary task; use lists for repeated content; reserve deep green for meaningful action; expose setup progress rather than hiding it; and preserve context after every edit**. The Home screen uses a single next-class feature only when useful; otherwise it promotes the one next step that unlocks the study workflow. Repeated schedules, books, locations, and teachers use calmer aligned rows rather than competing card elevations.

Forms are built from a single scrollable, clearly sectioned surface: `Class details`, `Time`, `Place`, and `Notes`. Labels stay above fields, prerequisite actions appear before blocked fields, and the save action is reachable without ambiguity. Class details make the date, time, teacher, book, and location scan in hierarchy order, adding a dual Gregorian/Hijri date only where it benefits planning.

Schedule uses segmented `Today / Week / Month` filtering and grouped agenda cards. Teachers use small circular portraits or letter avatars with subject tags and their next class. More becomes a clean grouped menu of books, locations, subjects, search, settings, reminders, and about. The five-tab navigation uses original doodle navigation assets with stable labels; Add is a normal destination rather than an elevated centre control.

## Premium Product Surface Direction

The premium rebuild discards both the dashboard treatment and the decorative doodle layer. DarsHub should feel like a considered personal workspace: neutral canvas, editorial type, controlled empty space, and tactile system controls. The design borrows broad principles from high-quality modern products—clarity, restraint, and confident structure—without reproducing any brand’s layout or assets.

| System decision | Implementation rule |
|---|---|
| Typography | Home uses a 30 px display title, 18 px section titles, 15 px body, and 12–13 px metadata. A screen has no more than four text roles. |
| Navigation | Five stable labelled destinations use one consistent Material icon family. The bar is a quiet frosted surface with a precise active indicator rather than a raised centre action or illustrated decoration. |
| Surfaces | The canvas is warm neutral. Repeated records are rows. A surface is used only for a meaningful unit such as the next class, an active form section, or a bottom sheet. |
| Actions | One high-contrast primary action appears per local task. Secondary actions are tonal or text-only. Touch targets are 48 px with pressed-opacity feedback, not decorative scaling. |
| Sheets | Short selections open in a bottom sheet with a drag handle, title, safe-area padding, one selected-row state, and no nested cards. |
| Motion | Pressed feedback is 120–160 ms opacity; bottom sheets use a 240–300 ms slide. No looping, bouncing, or ornamental motion. |
| Arabic | English and Arabic use explicit native row mirroring, text alignment, and writing direction; they do not rely on CSS-like `direction` styling. |

## Modern Agenda Workspace: Final Layout Reset

This layout reset replaces the remaining dashboard conventions with an **editorial agenda workspace**. It uses a single large page title, a concise date context, and a time-led vertical rhythm. The app should feel closer to a calm personal calendar and study notebook than a system of cards.

| Surface | New composition rule |
|---|---|
| Home | A quiet `Today` masthead, compact date navigation, then a vertical class timeline. The only persistent action is a compact `+ Add class` control in the title row. No greeting, promotional card, onboarding card, or duplicated add button. |
| Schedule | A date-first agenda. Each day has one anchored date marker and a time-led list; filters live behind one control rather than occupying the header. |
| Class row | Time is a fixed leading rail; title and teacher take the content column; status is a tiny trailing marker. Location, book, and extra attributes are hidden until the detail view. |
| Empty state | A single calm line, one icon, and one direct action. Do not add reassurance, setup instructions, decorative illustration, or multiple actions. |
| Directory | Contact-list rhythm: avatar/icon, title, one supporting line, disclosure. No individual rounded cards. |
| Navigation | A thin system-level bottom bar: clear active label, line icons, no pill background, no oversized icon containers. On tablets, move to a quiet navigation rail. |
| Forms | Full-page, sectioned editing with a sticky save action; every field sits on the canvas rather than inside nested card groups. |

The visual language uses warm off-white canvas, nearly-black ink, a reserved deep-green accent, 4-point spacing, 8–16 px radius only where interaction requires it, and low-elevation surfaces. The typography does the hierarchy: large title, medium list title, small metadata. Chrome must recede.

## Color Choices

| Role | Light mode | Dark mode | Intended use |
|---|---|---|---|
| Deep Green | `#164D3D` | `#86C5A3` | Featured class cards, selected filters, active navigation, and primary actions. |
| Ivory Canvas | `#FAF8F1` | `#101714` | Full-screen background with a soft, paper-like warmth. |
| Paper Surface | `#FFFFFF` | `#17221E` | Form sections, information cards, menus, and class rows. |
| Sage Wash | `#EEF2E9` | `#20332B` | Inactive chips, small icon discs, selected-row wash, and secondary fills. |
| Forest Ink | `#183C30` | `#F0F5EF` | Prominent text and core iconography. |
| Warm Secondary | `#6C746D` | `#AFB9B1` | Supporting detail, hints, and inactive navigation. |
| Hairline | `#E5E5DC` | `#304238` | Card edges, field outlines, and restrained dividers. |

## Domain Vocabulary and Local Data

The app stores `DarsClass`, `Teacher`, `Book`, `Location`, and user preferences locally. A class owns scheduling data and references related records by identifier. Preferences include the date presentation, Hijri visibility, reminder enablement, and reminder lead time. Local reminders are scheduled from class time, and no account or cloud dependency is required for the core experience.

Future-ready fields preserve an extension path for cloud backup, calendar export, maps, and public study links without making the local companion needlessly complex.
