import type { Book, DarsClass, Location, Teacher } from "@/lib/types/dars";

const day = (offset: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const demoTeachers: Teacher[] = [
  { id: "teacher-ahmad", name: "Shaykh Ahmad", title: "Shaykh", subjects: ["Hadith", "Fiqh"], mainLocation: "Masjid Al-Fath, Cairo", bio: "Weekly lessons in hadith and practical fiqh." },
  { id: "teacher-mustafa", name: "Shaykh Mustafa", title: "Shaykh", subjects: ["Aqeedah", "Tafsir"], mainLocation: "Nasr City Study Circle", bio: "Teacher of creed and Qur’anic exegesis." },
  { id: "teacher-omar", name: "Ustadh Omar", title: "Ustadh", subjects: ["Arabic", "Usul"], mainLocation: "Al-Azhar Area", bio: "Arabic language and foundational texts." },
  { id: "teacher-abdulrahman", name: "Shaykh Abdulrahman", title: "Shaykh", subjects: ["Quran", "Tazkiyah"], mainLocation: "Maadi Islamic Center", bio: "Qur’an and spiritual refinement classes." },
];

export const demoBooks: Book[] = [
  { id: "book-riyad", name: "Riyad as-Salihin", author: "Imam an-Nawawi", subject: "Hadith", studyStatus: "Current study", description: "A collection of prophetic narrations on ethics and worship." },
  { id: "book-tawheed", name: "Kitab at-Tawheed", author: "Shaykh Muhammad ibn Abd al-Wahhab", subject: "Aqeedah", studyStatus: "Current study" },
  { id: "book-nawawi", name: "Al-Arba’in an-Nawawiyyah", author: "Imam an-Nawawi", subject: "Hadith", studyStatus: "Planned" },
  { id: "book-tafsir", name: "Tafsir Ibn Kathir", author: "Ibn Kathir", subject: "Tafsir", studyStatus: "Current study" },
  { id: "book-ajurrumiyyah", name: "Al-Ajurrumiyyah", author: "Ibn Ajurrum", subject: "Arabic", studyStatus: "Current study" },
];

export const demoLocations: Location[] = [
  { id: "loc-fath", name: "Masjid Al-Fath", address: "26th of July Street", city: "Cairo", area: "Downtown", mapLink: "https://maps.google.com/?q=Masjid+Al-Fath+Cairo" },
  { id: "loc-nasr", name: "Nasr City Study Circle", address: "Abbas El-Akkad Street", city: "Cairo", area: "Nasr City", mapLink: "https://maps.google.com/?q=Nasr+City+Cairo" },
  { id: "loc-azhar", name: "Al-Azhar Area", address: "Al-Azhar Street", city: "Cairo", area: "Islamic Cairo", mapLink: "https://maps.google.com/?q=Al-Azhar+Cairo" },
  { id: "loc-maadi", name: "Maadi Islamic Center", address: "Road 9", city: "Cairo", area: "Maadi", mapLink: "https://maps.google.com/?q=Maadi+Cairo" },
  { id: "loc-alex", name: "Alexandria Study Hall", address: "Saad Zaghloul Square", city: "Alexandria", area: "Raml Station", mapLink: "https://maps.google.com/?q=Alexandria+Egypt" },
];

export const demoClasses: DarsClass[] = [
  { id: "class-1", title: "Explanation of Riyad as-Salihin", subject: "Hadith", teacherId: "teacher-ahmad", bookId: "book-riyad", date: day(0), startTime: "19:00", endTime: "20:15", locationId: "loc-fath", city: "Cairo", notes: "Bring your own copy and review the chapter on sincerity.", type: "recurring", recurrenceRule: "Weekly on Wednesday", language: "Arabic", status: "upcoming" },
  { id: "class-2", title: "Foundations of Tawheed", subject: "Aqeedah", teacherId: "teacher-mustafa", bookId: "book-tawheed", date: day(1), startTime: "18:30", endTime: "19:45", locationId: "loc-nasr", city: "Cairo", type: "recurring", recurrenceRule: "Weekly on Thursday", language: "Arabic", status: "upcoming" },
  { id: "class-3", title: "Arabic Grammar: Al-Ajurrumiyyah", subject: "Arabic", teacherId: "teacher-omar", bookId: "book-ajurrumiyyah", date: day(2), startTime: "17:00", endTime: "18:15", locationId: "loc-azhar", city: "Cairo", notes: "Lesson 7: marfu‘ nouns.", type: "recurring", recurrenceRule: "Weekly on Friday", language: "Arabic", status: "upcoming" },
  { id: "class-4", title: "Tafsir of Surah Al-Baqarah", subject: "Tafsir", teacherId: "teacher-mustafa", bookId: "book-tafsir", date: day(3), startTime: "16:30", endTime: "18:00", locationId: "loc-maadi", city: "Cairo", type: "recurring", recurrenceRule: "Weekly on Saturday", language: "Arabic", status: "upcoming" },
  { id: "class-5", title: "Forty Hadith Reading Circle", subject: "Hadith", teacherId: "teacher-ahmad", bookId: "book-nawawi", date: day(4), startTime: "20:00", endTime: "21:00", locationId: "loc-fath", city: "Cairo", type: "one-time", language: "English", status: "upcoming" },
  { id: "class-6", title: "Qur’an Reflection", subject: "Quran", teacherId: "teacher-abdulrahman", bookId: "book-tafsir", date: day(5), startTime: "18:00", endTime: "19:00", locationId: "loc-maadi", city: "Cairo", type: "recurring", recurrenceRule: "Weekly on Monday", language: "Arabic", status: "upcoming" },
  { id: "class-7", title: "Practical Fiqh of Prayer", subject: "Fiqh", teacherId: "teacher-ahmad", bookId: "book-riyad", date: day(6), startTime: "18:45", endTime: "20:00", locationId: "loc-nasr", city: "Cairo", type: "recurring", recurrenceRule: "Weekly on Tuesday", language: "Arabic", status: "upcoming" },
  { id: "class-8", title: "Arabic Reading Session", subject: "Arabic", teacherId: "teacher-omar", bookId: "book-ajurrumiyyah", date: day(7), startTime: "10:30", endTime: "11:30", locationId: "loc-azhar", city: "Cairo", type: "one-time", language: "Arabic", status: "upcoming" },
  { id: "class-9", title: "Tazkiyah & Character", subject: "Tazkiyah", teacherId: "teacher-abdulrahman", bookId: "book-riyad", date: day(8), startTime: "17:30", endTime: "18:30", locationId: "loc-maadi", city: "Cairo", type: "recurring", recurrenceRule: "Weekly on Sunday", language: "Arabic", status: "upcoming" },
  { id: "class-10", title: "Introduction to Usul", subject: "Usul", teacherId: "teacher-omar", bookId: "book-ajurrumiyyah", date: day(9), startTime: "18:00", endTime: "19:15", locationId: "loc-alex", city: "Alexandria", type: "one-time", language: "Arabic", status: "upcoming" },
  { id: "class-11", title: "Hadith Manners", subject: "Hadith", teacherId: "teacher-ahmad", bookId: "book-riyad", date: day(-7), startTime: "19:00", locationId: "loc-fath", city: "Cairo", type: "recurring", status: "completed" },
  { id: "class-12", title: "Aqeedah Review", subject: "Aqeedah", teacherId: "teacher-mustafa", bookId: "book-tawheed", date: day(-6), startTime: "18:30", locationId: "loc-nasr", city: "Cairo", type: "recurring", status: "completed" },
  { id: "class-13", title: "Arabic Syntax Practice", subject: "Arabic", teacherId: "teacher-omar", bookId: "book-ajurrumiyyah", date: day(-4), startTime: "17:00", locationId: "loc-azhar", city: "Cairo", type: "recurring", status: "completed" },
  { id: "class-14", title: "Tafsir Review", subject: "Tafsir", teacherId: "teacher-mustafa", bookId: "book-tafsir", date: day(-3), startTime: "16:30", locationId: "loc-maadi", city: "Cairo", type: "recurring", status: "completed" },
  { id: "class-15", title: "Qur’an Session", subject: "Quran", teacherId: "teacher-abdulrahman", bookId: "book-tafsir", date: day(-1), startTime: "18:00", locationId: "loc-maadi", city: "Cairo", type: "recurring", status: "completed" },
];
