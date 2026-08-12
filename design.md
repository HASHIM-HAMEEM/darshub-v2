# DarsHub Mobile Interface Plan

## Product Intent

DarsHub is a quiet, local-first study companion for students attending Islamic studies lessons in Egypt. The redesign adopts the user-supplied reference direction: **near-white or near-black canvas, exceptionally generous whitespace, small amounts of crisp black-and-white typography, hairline separation, and sparse line icons**. The app must feel closer to a considered notebook or private messenger than a productivity dashboard.

The design is optimized for **one-handed portrait use on a 9:16 phone**. Every screen has a restrained top bar, a single visual focal point, and a clear lower-screen action where required. The light and dark themes use the same spacing and hierarchy, not a recoloured variant of a card-heavy interface.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Home | A personal greeting, the next class, a compact class timeline, search, and Today/This Week/All filters. The primary action opens Add Class. |
| Schedule | Today and Week switcher with classes grouped by day, plus a simple visual agenda. |
| Add / Edit Class | Sectioned form for class details, timing, location, recurrence, status, and notes. It validates required fields and saves locally. |
| Class Detail | Clear overview of one dars with teacher, book, subject, date, time, place, notes, and status. Actions include edit, map placeholder, share placeholder, complete, and delete. |
| Teachers | Scholar directory with subject specialties and the next upcoming class. A detail sheet lists linked classes and lets the user add a teacher. |
| Books | Book directory with author, subject, study status, and linked classes. Users can add books. |
| Locations | Place directory with city, area, and linked classes. Users can add locations and access a map placeholder. |
| Search & Filter | Full class search with filters for teacher, subject, book, city, and class status. |
| More | A quiet navigation list to Books, Locations, Subjects, Search & Filter, and Settings. |
| Settings | Theme preference, reminder lead time, language preference, export placeholder, and application details. |

## Key User Flows

| Goal | Flow |
|---|---|
| Check the next class | Open DarsHub → Home shows the next upcoming dars → tap it for full context and actions. |
| Add a dars | Tap the central Add tab → complete the four short sections → Save Class → return to Home with the new dars visible. |
| Update or complete a class | Open a class → tap Edit or Mark completed → confirm the change → local list and details update. |
| Find a relevant lesson | Use Home search or Search & Filter → choose a teacher, subject, book, city, or status → tap a matching class. |
| Browse reference details | Open Teachers / Books / Locations from tabs or More → tap a list item → inspect linked classes → add a new reference item if needed. |

## Minimalist Direction

The Home screen is rebuilt as a single, breathing composition. A compact wordmark sits at the upper left; a quiet menu / settings affordance balances it at the upper right. The next lesson is communicated through deliberate type and one discreet date rule, rather than a large coloured feature card. Supporting lessons become plain, full-width rows with one divider and a small time column. Empty space is intentional—not a gap to fill with widgets.

Navigation takes a reduced, monochrome form. Primary destinations use a low-contrast bottom rail with outline icons and no competing colour. The Add action becomes a rounded black or white `New class` pill, positioned as an obvious, thumb-friendly commitment rather than a brightly coloured tab. Search and filters remain available but live behind a single low-emphasis control and expand only when needed.

Forms preserve their logical sections, but replace framed fields and elevated cards with label-first rows, hairline dividers, and a fixed save action. Lists, teacher details, books, locations, and settings adopt this same system: text-led rows, a 44-point minimum target, sparse supporting metadata, and no shadows.

## Color Choices

| Role | Light mode | Dark mode | Intended use |
|---|---|---|---|
| Ink | `#161616` | `#F5F5F4` | Wordmark, primary labels, active actions, and essential icons. |
| Canvas | `#FCFCFB` | `#101010` | Calm full-bleed screen background. |
| Surface | `#F4F4F2` | `#191919` | Subtle fields, inactive controls, and selected-row wash. |
| Secondary | `#79797F` | `#A0A0A5` | Hints, supporting metadata, and inactive navigation. |
| Hairline | `#E7E7E4` | `#292929` | Dividers and discreet component boundaries. |
| Positive | `#4E4E4E` | `#C9C9C9` | Completed states communicated without a coloured status system. |

## Domain Vocabulary and Local Data

The app stores four related entities locally: `DarsClass`, `Teacher`, `Book`, and `Location`. A class owns the scheduling data and references related records by identifier. `DarsClass` includes `id`, `title`, `subject`, `teacherId`, `bookId`, `date`, `startTime`, optional `endTime`, `locationId`, `city`, optional `notes`, `type`, optional `recurrenceRule`, optional `language`, and `status`. The initial release uses local demo data and in-memory updates structured to be replaceable with AsyncStorage in a later persistence pass.

Future-ready fields are retained in the types without implementing cloud sync, notifications, calendar integration, accounts, maps, or public sharing. This protects a simple MVP while providing a clear extension path.
