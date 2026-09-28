const arabic: Record<string, string> = {
  "Add a teacher name.": "أضف اسم المعلم.",
  "Add at least one subject.": "أضف مادة واحدة على الأقل.",
  "A teacher with this name already exists.": "يوجد معلم بهذا الاسم بالفعل.",
  "Add both the book name and author.": "أضف اسم الكتاب والمؤلف.",
  "This book and author are already in your library.": "هذا الكتاب والمؤلف محفوظان بالفعل.",
  "Add the place name, city, and area.": "أضف اسم المكان والمدينة والمنطقة.",
  "Add a valid web link for the map, starting with https://.": "أضف رابط خريطة صالحاً يبدأ بـ https://.",
  "A matching location already exists.": "يوجد مكان مطابق بالفعل.",
  "Add a class title.": "أضف عنوان الدرس.",
  "Choose a saved teacher before continuing.": "اختر معلماً محفوظاً للمتابعة.",
  "Choose a saved book before continuing.": "اختر كتاباً محفوظاً للمتابعة.",
  "Choose a saved location before continuing.": "اختر مكاناً محفوظاً للمتابعة.",
  "Use a valid date in YYYY-MM-DD format.": "استخدم تاريخاً صالحاً.",
  "Use a valid start time in HH:MM format.": "استخدم وقت بداية صالحاً.",
  "Use a valid end time in HH:MM format.": "استخدم وقت نهاية صالحاً.",
  "End time must be later than start time.": "يجب أن يكون وقت النهاية بعد وقت البداية.",
};

export const localizeMessage = (message: string, language: string) => (language === "ar" ? arabic[message] ?? message : message);
