# DarsHub Strict UI Cleanup Audit

| Area | Current failure | Rebuild decision |
|---|---|---|
| Home | The greeting, setup panel, checklist, and empty state repeat the same onboarding message and leave excessive dead space. | Keep one compact title, one short first-step action, and one restrained empty state. Remove repeated explanatory copy. |
| Surfaces | Nearly every group is a rounded, bordered card. | Use page background and spacing first; reserve one surface for focused setup or a real class detail. |
| Next-class treatment | Prior saturated promotion card now feels like a dashboard module. | Use a thin agenda row or a quiet schedule block where time is the primary cue. |
| Tab bar | Hosted doodle image icons can fail to render; labels appear detached from their controls. | Restore stable Material navigation icons at a consistent 22 px and use one clear selected state. |
| Primary actions | Full-width heavy-green buttons and floating duplicate Add affordances compete. | Use one `Add class` action per screen, with compact native 48 px controls. |
| Forms | Section cards, borders, and a modal sheet create stacked chrome. | Use grouped sections with hairlines; replace the picker with a real bottom sheet that has a drag handle, clear title, and selected row. |
| Motion | Press scaling exists but does not create continuity. | Limit motion to short pressed opacity and sheet translation; no decorative scaling or elevated controls. |
| Responsive layouts | Current wide layout mainly stretches the same cards. | Center mobile content; use a two-column agenda only when actual class data exists on tablet widths. |
