# DarsHub Mobile Interface Plan

## Product Intent

DarsHub is a calm, local-first study companion for students attending Islamic studies lessons in Egypt. The app is designed for **one-handed portrait use on a 9:16 phone** and follows familiar iOS patterns: clear page titles, predictable bottom navigation, readable lists, restrained sheets, and one primary action per screen. The visual system avoids dashboard density in favor of quiet spacing, direct labels, and immediately scannable time, teacher, book, and location details.

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

## Layout and Interaction Principles

The Home screen prioritizes recognition over recall: the next dars is anchored at the top, while subsequent lessons appear as lightweight list rows rather than a wall of cards. Each row consistently pairs the date/time with title, scholar, book, and place. Search is always easy to reach, filter chips remain compact, and the floating quick action is reserved for adding a class.

Forms are divided into four named sections—Class details, Time, Place, and Extra notes—to reduce visual and cognitive load. The save control is prominent and reachable from the lower part of the screen. Lists use generous 16–20 point outer padding and full-width tap targets of at least 44 points. Destructive actions are separated from routine actions and clearly labelled.

## Color Choices

| Role | Light mode | Dark mode | Intended use |
|---|---|---|---|
| Nile Green | `#225E52` | `#8FD1BC` | Primary actions, active states, calendar emphasis. |
| Deep Ink | `#172A2A` | `#EFF5F0` | Headlines and high-emphasis text. |
| Ivory | `#FAF8F2` | `#101817` | Screen background, maintaining a warm study-journal feel. |
| Paper | `#FFFFFF` | `#192322` | Cards, fields, and grouped navigation surfaces. |
| Sand | `#E8E0D0` | `#3A413B` | Borders, inactive filter chips, quiet dividers. |
| Slate | `#66736F` | `#AEBBB6` | Secondary text and metadata. |
| Completion Green | `#3F7B54` | `#8CCB9D` | Completed state and success feedback. |

## Domain Vocabulary and Local Data

The app stores four related entities locally: `DarsClass`, `Teacher`, `Book`, and `Location`. A class owns the scheduling data and references related records by identifier. `DarsClass` includes `id`, `title`, `subject`, `teacherId`, `bookId`, `date`, `startTime`, optional `endTime`, `locationId`, `city`, optional `notes`, `type`, optional `recurrenceRule`, optional `language`, and `status`. The initial release uses local demo data and in-memory updates structured to be replaceable with AsyncStorage in a later persistence pass.

Future-ready fields are retained in the types without implementing cloud sync, notifications, calendar integration, accounts, maps, or public sharing. This protects a simple MVP while providing a clear extension path.
