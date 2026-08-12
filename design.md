# DarsHub Mobile Interface Plan

## Product Intent

DarsHub is a warm, local-first study companion for students attending Islamic studies lessons in Egypt. The visual direction now follows the supplied reference: **soft ivory canvas, a dignified deep-green accent, gently rounded white cards, restrained Islamic arch-and-book motifs, and refined but highly readable typography**. The product should feel like a personal study journal—calm, reverent, and organized rather than generic or corporate.

The design remains optimized for **one-handed portrait use on a 9:16 phone**, with tablet layouts centered in a readable content frame. Dark mode retains the same component hierarchy using deep green-charcoal surfaces and soft cream text; it is not a simple colour inversion.

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

## Reference-Aligned Direction

The Home screen opens with an inviting greeting and a small notification action. The next lesson receives a single deep-green featured card with a date/time lockup, prominent class title, teacher and location metadata, a quiet Islamic book motif, and a full-width `View details` affordance. Upcoming classes follow as compact white cards: each has a slim date column, clear class title, teacher and location lines, and one chevron. Filter pills are warm-green when selected and pale ivory otherwise. The quick add action is a circular deep-green control that stays in the thumb zone.

Forms are built from warm-white cards inside an ivory page, arranged into numbered sections: `1. Class Details`, `2. Time`, `3. Place`, and `4. Notes`. Inputs are visually consistent, labels are explicit, and toggle treatments are reserved for mutually exclusive choices such as one-time versus recurring. Class details turn the subject, book, teacher, date, time, and place into a clear vertical information card with an image/motif header and a small action dock at the bottom.

Schedule uses segmented `Today / Week / Month` filtering and grouped agenda cards. Teachers use small circular portraits or letter avatars with subject tags and their next class. More becomes a clean grouped menu of books, locations, subjects, search, settings, reminders, and about. The five-tab navigation retains Google Material icons, but the selected state is deep green and the central Add action is elevated as a circular primary control.

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

The app stores four related entities locally: `DarsClass`, `Teacher`, `Book`, and `Location`. A class owns the scheduling data and references related records by identifier. `DarsClass` includes `id`, `title`, `subject`, `teacherId`, `bookId`, `date`, `startTime`, optional `endTime`, `locationId`, `city`, optional `notes`, `type`, optional `recurrenceRule`, optional `language`, and `status`. The initial release uses local demo data and in-memory updates structured to be replaceable with AsyncStorage in a later persistence pass.

Future-ready fields are retained in the types without implementing cloud sync, notifications, calendar integration, accounts, maps, or public sharing. This protects a simple MVP while providing a clear extension path.
