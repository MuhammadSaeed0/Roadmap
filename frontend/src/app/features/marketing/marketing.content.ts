/**
 * Marketing kit for the site owner: the Facebook post and the real screenshots it uses. Everything here ships with the
 * app (the images live in public/marketing), so the kit is the same on every device and survives restarts.
 *
 * Every claim matches the app as of 2026-11-20: 14 phases and 166 topics with lessons, 700+ Arabic and English videos,
 * 178 exercises, 97 challenges, 66 Project library projects, 4 main projects, 905 interview questions, the CV builder
 * (PDF or Word), the in-browser code runner and the Developer Level page. Update the numbers if the content changes.
 *
 * Arabic lines put U+200E (left-to-right mark) next to ".NET" and "C#" so Facebook does not flip the dot or the "#".
 */

export const APP_URL = 'https://dotnetfullstackroadmap.runasp.net';

const LRM = '‎';
const NET = `${LRM}.NET`;
const CS = `C#${LRM}`;

export const HASHTAGS = ['#تعلم_البرمجة', '#برمجة', '#مسار_المبرمج', '#dotnet', '#Angular'];

export const POST_AR = `مش عارف تبدأ برمجة منين؟ ولا تايه بين ألف كورس على يوتيوب؟ 🤯

عملت "مسار المبرمج" (DevPath): موقع مجاني بالعربي والإنجليزي، بيمشّيك خطوة بخطوة من أول سطر كود لحد ما تبني تطبيق ويب كامل بـ ${NET} و Angular.

اللي هتلاقيه جوه 👇

🧭 صفحة "قبل خارطة الطريق": لو لسه جديد خالص، تفهم البرمجة يعني إيه، وإيه مجالاتها، والأساسيات اللي تتعلمها قبل ما تختار طريقك.
🗺️ خارطة طريق مترتبة: 14 مرحلة و166 موضوع، وكل موضوع ليه شرح مكتوب بالعربي وأمثلة واختبار قصير.
🎥 أكتر من 700 فيديو عربي وإنجليزي متقسمين على المواضيع، وتختار اللغة اللي تريحك.
💻 محرر كود جوه الموقع: تكتب ${CS} و SQL وتشغّله في المتصفح من غير ما تنزّل أي برنامج.
🧩 178 تمرين و97 تحدي بيتصححوا لوحدهم.
🛠️ مكتبة فيها 66 مشروع بخطوات وتلميحات، و4 مشاريع رئيسية تحطها في الـ Portfolio بتاعك.
🎯 أكتر من 900 سؤال مقابلات عمل بإجاباتهم.
📄 منشئ سيرة ذاتية بيطلّعها PDF أو Word.
📈 صفحة "مستوى المطوّر" بتقيس مستواك من اللي أثبته فعلًا، مش من الوقت اللي قضيته.

الموقع ده ليك لو:
• طالب حاسبات أو لسه بتبدأ ومحتاج خطة واضحة.
• بتغيّر مجالك وعايز توصل لأول شغل كـ Junior Developer.
• عايز تبني Portfolio حقيقي بدل ما تجمّع شهادات.

التسجيل بإيميل بس، والموقع مجاني.
جرّبه وقولّي رأيك في الكومنتات، أي اقتراح بيفرق 🙏

🔗 ${APP_URL}

${HASHTAGS.join(' ')}`;

export const POST_EN = `Want to learn programming but don't know where to start? 🤯

I built DevPath: a free site, in English and Arabic, that takes you step by step from your first line of code to a complete web app with .NET and Angular.

What's inside 👇

🧭 Pre-Roadmap: brand new? Learn what programming is, the main career fields, and the fundamentals to learn before you pick a path.
🗺️ A clear roadmap: 14 phases and 166 topics, each with a written lesson, examples and a short quiz.
🎥 700+ Arabic and English videos, sorted by topic, with a language filter.
💻 A code editor in the browser: write C# and SQL and run it, nothing to install.
🧩 178 exercises and 97 challenges that check themselves.
🛠️ A library of 66 projects with steps and hints, plus 4 main projects for your portfolio.
🎯 900+ interview questions with answers.
📄 A CV builder that exports to PDF or Word.
📈 A Developer Level page that measures what you have actually shown, not the time you spent.

It's for you if you are:
• A student or a beginner who needs a clear plan.
• Switching careers and aiming for a first junior developer job.
• Building a real portfolio instead of collecting certificates.

Sign up with just an email. It's free.
Try it and tell me what you think in the comments 🙏

🔗 ${APP_URL}

#LearnToCode #Programming #dotnet #Angular #DevPath`;

export const SHORT_AR = `خطة واضحة من أول سطر كود لحد أول شغل كمطوّر ${NET} و Angular: دروس بالعربي، وفيديوهات، وتمارين، ومشاريع، ومجانًا 👇
${APP_URL}`;

export const SHORT_EN = `A clear plan from your first line of code to your first developer job with .NET and Angular: lessons, videos, exercises and projects, all free 👇
${APP_URL}`;

export interface MarketingShot {
  file: string;
  device: 'desktop' | 'mobile' | 'cover';
  en: string;
  ar: string;
}

/** In posting order: the cover first, then the screenshots that back the post's points. */
export const SHOTS: readonly MarketingShot[] = [
  { file: '00-cover.jpg', device: 'cover', en: 'Cover (made from the real roadmap and Pre-Roadmap screenshots)', ar: 'الغلاف (مصنوع من لقطتي خارطة الطريق وقبل خارطة الطريق الحقيقيتين)' },
  { file: '01-roadmap.jpg', device: 'desktop', en: 'The roadmap: 14 phases with progress', ar: 'خارطة الطريق: 14 مرحلة مع التقدم' },
  { file: '02-pre-roadmap.jpg', device: 'mobile', en: 'Pre-Roadmap on a phone', ar: 'قبل خارطة الطريق على الجوال' },
  { file: '03-lesson.jpg', device: 'desktop', en: 'A topic lesson in Arabic', ar: 'درس موضوع بالعربي' },
  { file: '04-playground.jpg', device: 'desktop', en: 'C# running in the browser', ar: 'تشغيل C# في المتصفح' },
  { file: '05-practice.jpg', device: 'desktop', en: 'Practice Lab: 178 exercises', ar: 'مختبر التدريب: 178 تمرينًا' },
  { file: '06-project-library.jpg', device: 'desktop', en: 'Project library: 66 projects', ar: 'مكتبة المشاريع: 66 مشروعًا' },
  { file: '07-cv.jpg', device: 'desktop', en: 'CV builder templates', ar: 'قوالب منشئ السيرة الذاتية' },
  { file: '08-dashboard.jpg', device: 'desktop', en: 'Dashboard with what to learn next', ar: 'لوحة المعلومات وما تتعلمه بعد ذلك' },
  { file: '09-lesson-mobile.jpg', device: 'mobile', en: 'A lesson on a phone', ar: 'درس على الجوال' },
];

export const shotUrl = (file: string) => `marketing/${file}`;
