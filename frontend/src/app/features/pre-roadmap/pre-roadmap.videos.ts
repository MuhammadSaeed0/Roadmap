import { PreVideo } from './pre-roadmap.models';

/**
 * Videos for the Pre-Roadmap page, keyed by the item they belong to. Every id was checked with YouTube's
 * oEmbed endpoint on 2026-11-20 (it exists and can be embedded); the title and channel are YouTube's own.
 * Durations come from YouTube's search listing and are left out where they were not read.
 */
export const PRE_VIDEOS: Record<string, readonly PreVideo[]> = {
  intro: [
    { videoId: "zOjov-2OZ0E", title: "Introduction to Programming and Computer Science - Full Course", channel: "freeCodeCamp.org", language: 'English', durationSeconds: 7149 },
    { videoId: "QXjU9qTsYCc", title: "How do computers read code?", channel: "Frame of Essence", language: 'English', durationSeconds: 721 },
    { videoId: "-5RfI6JvWvs", title: "يعني ايه برمجة ولغة برمجة وكود ؟", channel: "Elzero Web School", language: 'Arabic', durationSeconds: 231 },
    { videoId: "9ndH9Qo05F4", title: "ماهي البرمجة وكيف تتعلمها : تعلم البرمجة للمبتدئين من الصفر ١", channel: "OctuCode", language: 'Arabic', durationSeconds: 262 },
  ],
  choose: [
    { videoId: "66tfvFeALBQ", title: "How to ACTUALLY learn to code... 7 Roadmaps for 2023", channel: "Fireship", language: 'English', durationSeconds: 542 },
    { videoId: "6-IBA6CSvZE", title: "كيف تختار المجال المناسب في البرمجة ؟", channel: "غريب الشيخ || Ghareeb Elshaikh", language: 'Arabic', durationSeconds: 542 },
  ],
  frontend: [
    { videoId: "Tef1e9FiSR0", title: "The Complete Frontend Developer Roadmap", channel: "Programming with Mosh", language: 'English', durationSeconds: 534 },
    { videoId: "EB_9bmDrK0k", title: "مقدمة عن البرمجة #04 - مسار تعلم مجال ال Front-End Development", channel: "Elzero Web School", language: 'Arabic', durationSeconds: 1542 },
  ],
  backend: [
    { videoId: "OeEHJgzqS1k", title: "The Complete Backend Developer Roadmap", channel: "Programming with Mosh", language: 'English', durationSeconds: 504 },
    { videoId: "CVgzp2vfePs", title: "Backend Developer Roadmap 2024 | خارطة تعلم تطوير تطبيقات الباك اند", channel: "Yehia Tech يحيى تك", language: 'Arabic', durationSeconds: 2470 },
  ],
  fullstack: [
    { videoId: "7NaeDBTRY1k", title: "Full Stack Development Explained", channel: "Andy Sterkowitz", language: 'English', durationSeconds: 292 },
    { videoId: "vwvPFuh7ZDs", title: "الفرق بين Front end و Back end في برمجه الويب", channel: "أحمد محمود || Ahmed Mahmoud", language: 'Arabic', durationSeconds: 414 },
  ],
  mobile: [
    { videoId: "yye7rSsiV6k", title: "The Complete App Development Roadmap", channel: "Programming with Mosh", language: 'English', durationSeconds: 472 },
    { videoId: "Z2ZgGiAmaa4", title: "ما هي Flutter | صناعة تطبيقات الموبايل", channel: "اتعلم ببساطة", language: 'Arabic', durationSeconds: 773 },
  ],
  game: [
    { videoId: "XtQMytORBmM", title: "The Unity Tutorial For Complete Beginners", channel: "Game Maker's Toolkit", language: 'English', durationSeconds: 2799 },
    { videoId: "8hb3wWx6Aok", title: "Learn Game Development | Unreal Engine 5 |  تعلم تطوير الألعاب وبرمجة لعبة كاملة من الصفر", channel: "Codezilla Academy", language: 'Arabic', durationSeconds: 8099 },
  ],
  ai: [
    { videoId: "qYNweeDHiyU", title: "AI, Machine Learning, Deep Learning and Generative AI Explained", channel: "IBM Technology", language: 'English', durationSeconds: 601 },
    { videoId: "2V_TLEW34cg", title: "الذكاء الاصطناعي و تعلم الآلة و الفرق بينهما", channel: "Codezilla", language: 'Arabic', durationSeconds: 532 },
  ],
  data: [
    { videoId: "YRJbhFLLPyE", title: "The Complete Data Analyst Roadmap", channel: "Programming with Mosh", language: 'English', durationSeconds: 248 },
    { videoId: "ptxWhdDI6aE", title: "منين تبدأ في مجال تحليل البيانات ؟ كل المصادر المهمه اللي لازم تعرفها قبل ما تبدأ", channel: "Norhan Zeid - نورهان زيد", language: 'Arabic', durationSeconds: 909 },
  ],
  security: [
    { videoId: "inWWhr5tnEA", title: "What Is Cyber Security | How It Works? | Cyber Security In 7 Minutes | Cyber Security | Simplilearn", channel: "Simplilearn", language: 'English', durationSeconds: 427 },
    { videoId: "Asxu8gO1Jt4", title: "كيف تتعلم مجال الأمن السيبراني؟ Cybersecurity Roadmap", channel: "غريب الشيخ || Ghareeb Elshaikh", language: 'Arabic', durationSeconds: 534 },
  ],
  devops: [
    { videoId: "zG1cM9VSINg", title: "A Complete Overview of DevOps", channel: "ForrestKnight", language: 'English', durationSeconds: 867 },
    { videoId: "2O2Io87jsT0", title: "ما هو مجال الـ DevOps ؟ .. باختصار", channel: "كورسات في البرمجة - Korsat X Parmaga", language: 'Arabic', durationSeconds: 741 },
    { videoId: "kR1J2GntRWE", title: "الحوسبة السحابية cloud computing", channel: "Ali Shahin", language: 'Arabic', durationSeconds: 1085 },
  ],
  desktop: [
    { videoId: "v0NeFuIwGpc", title: "Is Desktop Development Still Relevant", channel: "CodeHead", language: 'English', durationSeconds: 279 },
    { videoId: "gqirOUaXSOg", title: "ما هي لغات البرمجة وأطر العمل المستخدمة في تطوير تطبيقات سطح المكتب؟", channel: "أكاديمية حسوب", language: 'Arabic', durationSeconds: 431 },
  ],
  embedded: [
    { videoId: "3AXDli9tQMo", title: "Embedded Systems in 5 Minutes!", channel: "Oliver Foote", language: 'English', durationSeconds: 300 },
    { videoId: "6mBO2vqLv38", title: "IoT | Internet of Things | What is IoT ? | How IoT Works? | IoT Explained in 6 Minutes | Simplilearn", channel: "Simplilearn", language: 'English', durationSeconds: 352 },
    { videoId: "_Vau1o4ESTk", title: "كيف تبدأ تعلم الأنظمة المدمجة و تحوّل أفكارك إلى أجهزة ملموسة؟", channel: "Khaled Magdy | خالد مجدي", language: 'Arabic', durationSeconds: 1384 },
    { videoId: "lFdaJPl249g", title: "إنترنت الأشياء IoT", channel: "أكاديمية حسوب", language: 'Arabic', durationSeconds: 392 },
  ],
  logic: [
    { videoId: "UFc-RPbq8kg", title: "Problem-Solving for Developers - A Beginner's Guide", channel: "Fireship", language: 'English', durationSeconds: 644 },
    { videoId: "haXXcI17WM4", title: "معلومات هامة قبل ما تبتدي problem solving.", channel: "Ali Shahin", language: 'Arabic', durationSeconds: 671 },
  ],
  dsa: [
    { videoId: "BBpAmxU_NQo", title: "Data Structures and Algorithms for Beginners", channel: "Programming with Mosh", language: 'English', durationSeconds: 4723 },
    { videoId: "IYEkbGhabfk", title: "كورس [week0 - 3] cs50 بالعربي | ما هي الخوارزميات", channel: "Abdelrahman Gamal", language: 'Arabic', durationSeconds: 686 },
  ],
  variables: [
    { videoId: "ghCbURMWBD8", title: "Coding Basics: Variables | Programming for Beginners |", channel: "Transcode", language: 'English', durationSeconds: 285 },
    { videoId: "C6Rl3nGIqIM", title: "ماهي ال data types - يعني ايه انواع البيانات في البرمجة؟", channel: "OctuCode", language: 'Arabic', durationSeconds: 1122 },
  ],
  control: [
    { videoId: "HQ3dCWjfRZ4", title: "Coding Basics: If Statements, If Else, Else - Coding Tutorial For Java, C, and C++!", channel: "Transcode", language: 'English', durationSeconds: 657 },
    { videoId: "89cGQjB5R4M", title: "Functions in Python are easy 📞", channel: "Bro Code", language: 'English', durationSeconds: 638 },
    { videoId: "XcseLtM_E0I", title: "025 C# Create Methods إنشاء الدوال في لغة السي شارب", channel: "محمود السكري | كود عربي", language: 'Arabic', durationSeconds: 464 },
  ],
  oop: [
    { videoId: "pTB0EiLXUC8", title: "Object-Oriented Programming, Simplified", channel: "Programming with Mosh", language: 'English', durationSeconds: 454 },
    { videoId: "2iQ5snTVbyQ", title: "شرح OOP ما هي البرمجة الكائنية و ما هو ال object", channel: "Abdelrahman Gamal", language: 'Arabic', durationSeconds: 209 },
  ],
  git: [
    { videoId: "8JJ101D3knE", title: "Git Tutorial for Beginners: Learn Git in 1 Hour", channel: "Programming with Mosh", language: 'English', durationSeconds: null },
    { videoId: "N7qWNQxFq90", title: "Git & GitHub in 45 mins 🟠| كورس أساسيات جيت وجيتهاب في 45 دقيقة للمبتدئين", channel: "Yehia Tech يحيى تك", language: 'Arabic', durationSeconds: 2803 },
  ],
  debugging: [
    { videoId: "u-HdLtqEOog", title: "Debugging C# Code in Visual Studio | Mosh", channel: "Programming with Mosh", language: 'English', durationSeconds: null },
    { videoId: "Xsq4ysC2oYg", title: "الطريقة الصحيحة لاكتشاف الأخطاء البرمجية | Debugging Made Easy 🐞", channel: "Yehia Tech يحيى تك", language: 'Arabic', durationSeconds: 1001 },
  ],
  sql: [
    { videoId: "RBXZrPVjPyo", title: "What is SQL (Visually Explained) | #SQL Course 2", channel: "Data with Baraa", language: 'English', durationSeconds: 898 },
    { videoId: "N-WPYk417yE", title: "تعلم أساسيات SQL | كورس كامل + مشروع عملي", channel: "كورسات في البرمجة - Korsat X Parmaga", language: 'Arabic', durationSeconds: 5765 },
  ],
  http: [
    { videoId: "ByGJQzlzxQg", title: "What is an API (in 5 minutes)", channel: "Aaron Jack", language: 'English', durationSeconds: 296 },
    { videoId: "rq7DvjN1Gco", title: "ما هو الـ API و ما فائدته في البرمجة؟ و كيف يعمل؟", channel: "أكاديمية ترميز", language: 'Arabic', durationSeconds: 327 },
  ],
  cli: [
    { videoId: "mABpAI-pCw0", title: "Command Line Basics for Beginners - Full Course", channel: "freeCodeCamp.org", language: 'English', durationSeconds: 2720 },
    { videoId: "wmZMMcm7zWA", title: "كورس أساسيات Command Line | تعلم التيرمنال من الصفر", channel: "غريب الشيخ || Ghareeb Elshaikh", language: 'Arabic', durationSeconds: 1960 },
  ],
  cs: [
    { videoId: "2WtPyqwTLKM", title: "CS50x 2025 - Lecture 0 - Scratch", channel: "CS50", language: 'English', durationSeconds: 7136 },
    { videoId: "2mySUIR9k20", title: "مكونات الكمبيوتر | مقدمة  في علوم الحاسب", channel: "Ali Shahin", language: 'Arabic', durationSeconds: 659 },
  ],
  cleancode: [
    { videoId: "wSDyiEjhp8k", title: "My 10 “Clean” Code Principles (Start These Now)", channel: "Conner Ardman", language: 'English', durationSeconds: 912 },
    { videoId: "alizrWWeiRI", title: "Dirty Code vs Clean Code 💡 | يعني ايه الكود بتاعي يبقى نظيف ؟", channel: "Yehia Tech يحيى تك", language: 'Arabic', durationSeconds: 1238 },
  ],
  workflow: [
    { videoId: "SaCYkPD4_K0", title: "Software Development Life Cycle: Explained", channel: "AltexSoft", language: 'English', durationSeconds: 751 },
    { videoId: "2HHzBRSLjSM", title: "مراحل انتاج البرمجيات  |  software development Lifecyle", channel: "Ali Shahin", language: 'Arabic', durationSeconds: 679 },
  ],
  networking: [
    { videoId: "keeqnciDVOo", title: "Computer Networking in 100 Seconds", channel: "Fireship", language: 'English', durationSeconds: 138 },
    { videoId: "ctojbQH5apc", title: "فهم الشبكات من الصفر — أسهل شرح ممكن", channel: "Ali Shahin", language: 'Arabic', durationSeconds: 901 },
  ],
  english: [
    { videoId: "fooBj0nkdak", title: "20 English Words Every SOFTWARE DEVELOPER Should Know", channel: "English For Tech Professionals", language: 'English', durationSeconds: 748 },
    { videoId: "ucEIHPPe17s", title: "هل الإنجليزي عائق في تعلم البرمجة ؟", channel: "Elzero Web School", language: 'Arabic', durationSeconds: 656 },
  ],
  docs: [
    { videoId: "SWr6NW2osqc", title: "How To Read Documentations For Beginners", channel: "NeuralNine", language: 'English', durationSeconds: 1022 },
    { videoId: "GqDpEI3AMDc", title: "ازاي تقرأ ال Documentation الخاص بأي لغة او مكتبة في البرمجة؟", channel: "أحمد مجدي - MagdyBytes", language: 'Arabic', durationSeconds: 547 },
  ],
  learning: [
    { videoId: "NtfbWkxJTHw", title: "How to Learn to Code - 8 Hard Truths", channel: "Fireship", language: 'English', durationSeconds: 406 },
    { videoId: "LdJbP0NbFRw", title: "إزاي تتعلم برمجة", channel: "Elzero Web School", language: 'Arabic', durationSeconds: 368 },
  ],
};
