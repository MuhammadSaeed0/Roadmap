/**
 * Marketing kit for the site owner: the Facebook post and the real screenshots it uses. Everything here ships with the
 * app (the images live in public/marketing), so the kit is the same on every device and survives restarts.
 *
 * Every claim matches the app as of 2026-11-25: 14 phases and 166 topics with lessons, 700+ Arabic and English videos,
 * 253 exercises (every topic has at least one), phase certificates,, 97 challenges, 66 Project library projects, 4 main projects, 905 interview questions, the CV builder
 * (PDF or Word), the in-browser code runner and the Developer Level page. Update the numbers if the content changes.
 *
 * Arabic lines put U+200E (left-to-right mark) next to ".NET" and "C#" so Facebook does not flip the dot or the "#".
 */

export const APP_URL = 'https://dotnetfullstackroadmap.runasp.net';

/**
 * The link to post on each channel. utm_source tells the admin Usage tab ("Where visitors come from") which channel
 * brought each visit and sign-up. Every source here must also be in UsageService.Sources on the API.
 */
export const SOURCES = ['facebook', 'whatsapp', 'telegram', 'linkedin', 'reddit', 'tiktok', 'instagram', 'youtube', 'discord', 'friend'] as const;
export type Source = (typeof SOURCES)[number];
export const trackedUrl = (source: Source) => `${APP_URL}/?utm_source=${source}`;

/** The links a learner gets: their shares are counted as "friend" (word of mouth), or by the app they post in. */
export const LEARNER_SOURCES: readonly Source[] = ['friend', 'whatsapp', 'telegram', 'facebook', 'linkedin'];

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
🧩 أكتر من 250 تمرين (لكل موضوع تمرين على الأقل) و97 تحدي بيتصححوا لوحدهم.
🏅 شهادة لكل مرحلة تخلّصها، ليها رابط تحقق وتقدر تضيفها لـ LinkedIn بضغطة.
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

🔗 ${trackedUrl('facebook')}

${HASHTAGS.join(' ')}`;

export const POST_EN = `Want to learn programming but don't know where to start? 🤯

I built DevPath: a free site, in English and Arabic, that takes you step by step from your first line of code to a complete web app with .NET and Angular.

What's inside 👇

🧭 Pre-Roadmap: brand new? Learn what programming is, the main career fields, and the fundamentals to learn before you pick a path.
🗺️ A clear roadmap: 14 phases and 166 topics, each with a written lesson, examples and a short quiz.
🎥 700+ Arabic and English videos, sorted by topic, with a language filter.
💻 A code editor in the browser: write C# and SQL and run it, nothing to install.
🧩 250+ exercises (at least one per topic) and 97 challenges that check themselves.
🏅 A certificate for every phase you finish, with a verify link and a one-click "Add to LinkedIn".
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

🔗 ${trackedUrl('facebook')}

#LearnToCode #Programming #dotnet #Angular #DevPath`;

export const SHORT_AR = `خطة واضحة من أول سطر كود لحد أول شغل كمطوّر ${NET} و Angular: دروس بالعربي، وفيديوهات، وتمارين، ومشاريع، ومجانًا 👇
${trackedUrl('whatsapp')}`;

export const SHORT_EN = `A clear plan from your first line of code to your first developer job with .NET and Angular: lessons, videos, exercises and projects, all free 👇
${trackedUrl('whatsapp')}`;

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
  { file: '05-practice.jpg', device: 'desktop', en: 'Practice Lab: 250+ exercises', ar: 'مختبر التدريب: أكثر من 250 تمرينًا' },
  { file: '06-project-library.jpg', device: 'desktop', en: 'Project library: 66 projects', ar: 'مكتبة المشاريع: 66 مشروعًا' },
  { file: '07-cv.jpg', device: 'desktop', en: 'CV builder templates', ar: 'قوالب منشئ السيرة الذاتية' },
  { file: '08-dashboard.jpg', device: 'desktop', en: 'Dashboard with what to learn next', ar: 'لوحة المعلومات وما تتعلمه بعد ذلك' },
  { file: '09-lesson-mobile.jpg', device: 'mobile', en: 'A lesson on a phone', ar: 'درس على الجوال' },
];

export const shotUrl = (file: string) => `marketing/${file}`;

/** One ready-to-post piece of the growth kit. Nothing here is posted automatically: the owner copies it. */
export interface KitItem {
  id: string;
  kind: 'facebook' | 'reddit' | 'video' | 'linkedin' | 'intro' | 'referral';
  lang: 'ar' | 'en';
  /** 'all': written in a learner's voice, so every signed-in user sees it. Otherwise it is the owner's (admins only). */
  audience?: 'all';
  en: string;
  ar: string;
  text: string;
}

export const KIT_KINDS: readonly KitItem['kind'][] = ['facebook', 'reddit', 'video', 'linkedin', 'intro', 'referral'];

/**
 * The 30-day growth kit (see docs/launch/growth-plan.md). Every claim matches the app as of 2026-11-25; no testimonials,
 * no promised results. Each piece carries the tracked link of the channel it is written for.
 */
export const KIT: readonly KitItem[] = [
  // ---------- Facebook (Egyptian Arabic): one idea per post, a screenshot with each ----------
  {
    id: 'fb-where-to-start', kind: 'facebook', lang: 'ar', en: 'Facebook 1: “Where do I start?”', ar: 'فيسبوك 1: «أبدأ منين؟»',
    text: `أكتر سؤال بيتسأل في جروبات البرمجة: "أبدأ منين؟" 🤔

الإجابة الصادقة: ابدأ بخطة واحدة وامشي عليها، مش بعشر كورسات في نفس الوقت.

عشان كده عملت صفحة مجانية اسمها "قبل خارطة الطريق": بتشرح البرمجة يعني إيه، ومجالاتها (ويب، موبايل، داتا…)، والأساسيات اللي تتعلمها قبل ما تختار، بفيديوهات بالعربي والإنجليزي.

تقدر تقراها من غير ما تعمل حساب 👇
${APP_URL}/pre-roadmap?utm_source=facebook

ولو قررت تكمل في ${NET} و Angular، فيه خارطة طريق كاملة من 166 موضوع مستنياك.`,
  },
  {
    id: 'fb-certificate', kind: 'facebook', lang: 'ar', en: 'Facebook 2: phase certificates on LinkedIn', ar: 'فيسبوك 2: شهادات المراحل على LinkedIn',
    text: `خلّصت مرحلة كاملة من خارطة الطريق؟ دلوقتي تاخد عليها شهادة 🏅

في "مسار المبرمج" (DevPath) كل مرحلة بتخلّص مواضيعها بتديك شهادة:
• ليها رابط تحقق، أي حد يفتحه يتأكد إنها حقيقية.
• تنزّلها PDF.
• تضيفها لبروفايل LinkedIn بضغطة واحدة.

الشهادة دي مش شهادة معتمدة، هي إثبات إنك مشيت في المنهج وخلّصت مواضيعه، وده كلام ينفع يتقال في الإنترفيو.

الموقع مجاني بالكامل 👇
${trackedUrl('facebook')}`,
  },
  {
    id: 'fb-run-code', kind: 'facebook', lang: 'ar', en: 'Facebook 3: run C# in the browser', ar: 'فيسبوك 3: تشغيل الكود في المتصفح',
    text: `جهازك ضعيف ومش قادر تنزّل Visual Studio؟ أو لسه مش عايز تتعب في التسطيب؟

جوه "مسار المبرمج" فيه محرر كود بيشغّل ${CS} و SQL و TypeScript في المتصفح نفسه، حتى من الموبايل.

وكل موضوع من الـ 166 ليه تمرين على الأقل، وفيه تمارين كتير بتتصحح لوحدها وتقولك غلطت فين.

جرّب 👇
${trackedUrl('facebook')}`,
  },
  {
    id: 'fb-interviews', kind: 'facebook', lang: 'ar', en: 'Facebook 4: interview questions', ar: 'فيسبوك 4: أسئلة المقابلات',
    text: `عندك إنترفيو Junior ${NET} قريب؟ 🎯

جمعت أكتر من 900 سؤال مقابلات بإجاباتهم في ${CS} و OOP و SQL و ASP.NET Core و Angular، ومعاهم أسئلة سلوكية (Behavioral).

وفيه مقابلة تجريبية بتسألك أسئلة عشوائية، تفكر في إجابتك الأول وبعدين تشوف الإجابة النموذجية.

مجانًا، ومن غير إعلانات 👇
${trackedUrl('facebook')}

اكتب في الكومنت أصعب سؤال اتسألته في إنترفيو، وأنا أضيفه للبنك لو مش موجود.`,
  },
  {
    id: 'fb-first-year', kind: 'facebook', lang: 'ar', en: 'Facebook 5: for first-year students', ar: 'فيسبوك 5: لطلاب سنة أولى',
    text: `لو إنت في سنة أولى أو تانية حاسبات، البوست ده ليك 👇

المواد في الكلية بتديك الأساسيات، بس مش دايمًا بتوريك الأساسيات دي بتتحول لشغل حقيقي إزاي.

"مسار المبرمج" بيبدأ من نفس اللي بتاخده في Programming 1 (متغيرات وشروط ولوبس) بس بلغة ${CS}، وبيكمل لحد ما تبني تطبيق ويب كامل:
• درس مكتوب بالعربي لكل موضوع، واختبار قصير بعده.
• تمارين ومشاريع تحطها في الـ Portfolio.
• صفحة "مستوى المطوّر" بتقولك إنت فين وإيه المطلوب للمستوى اللي بعده.

ابعته لصاحبك اللي بيقول "عايز أتعلم برمجة بس مش عارف أبدأ" 😄
${trackedUrl('facebook')}`,
  },

  // ---------- Reddit (English): read each subreddit's rules first; post as the builder, ask for feedback ----------
  {
    id: 'reddit-csharp', kind: 'reddit', lang: 'en', en: 'Reddit: r/csharp (feedback post)', ar: 'ريديت: طلب رأي في r/csharp',
    text: `Title: I built a free C#/.NET + Angular roadmap where every topic has a lesson and an exercise. Feedback wanted

I'm a .NET developer from Egypt. Juniors around me kept asking "what do I learn, and in what order?", so I built DevPath: 14 phases, 166 topics, from variables to ASP.NET Core, EF Core, SQL and Angular.

What might be useful to this sub:
- Each topic has a written lesson, a short quiz and at least one exercise. Many C# exercises run against real checks in the browser.
- 900+ interview questions with answers.
- Everything is free, in English and Arabic. Sign-up is just an email.

What I'd like feedback on: is the topic order sensible, and what's missing for someone aiming at a first junior .NET job?

${trackedUrl('reddit')}`,
  },
  {
    id: 'reddit-dotnet', kind: 'reddit', lang: 'en', en: 'Reddit: r/dotnet (how it works)', ar: 'ريديت: كيف بُني الموقع في r/dotnet',
    text: `Title: Auto-grading C# exercises in the browser for a free learning site: what worked

I run a small free learning site for .NET juniors and wanted C# exercises that are checked without running student code on my server. Short write-up of the approach:

- The C# runner works in the browser, so student code never runs on the server.
- Each exercise ships a starter, a model solution and a set of checks. A test in CI proves the model solution passes every check and the starter fails, so a broken exercise can't ship.
- The runner is cached in the browser after the first load, so later runs start quickly.

Happy to answer questions about the setup. The site, if you want to try an exercise: ${trackedUrl('reddit')}`,
  },
  {
    id: 'reddit-learn', kind: 'reddit', lang: 'en', en: 'Reddit: answer in r/learnprogramming', ar: 'ريديت: ردّ في r/learnprogramming',
    text: `(Use as a reply when someone asks how to become a .NET developer, not as a new post. Answer the question first.)

A path that works: C# basics, then OOP, collections and LINQ, then SQL, then ASP.NET Core Web API and EF Core, then a frontend (Angular or React), then one real project you can show, with tests and a README.

Build something at every step, even small. Reading without writing code is where most people stall.

Disclosure: I made a free roadmap that follows this order, with a lesson and an exercise per topic, if a structured list helps: ${trackedUrl('reddit')}`,
  },

  // ---------- Short videos (TikTok, Reels, Shorts): screen recordings, 20–40 seconds, Egyptian Arabic voice-over ----------
  {
    id: 'video-roadmap', kind: 'video', lang: 'ar', en: 'Video 1: the roadmap in 30 seconds', ar: 'فيديو 1: خارطة الطريق في 30 ثانية',
    text: `المدة: 30 ثانية. تسجيل شاشة من الموبايل.

الافتتاحية (أول 3 ثواني، نص على الشاشة): "عايز تبقى مطوّر ${NET}؟ ده الترتيب"
المشهد 1: صفحة خارطة الطريق، اسكرول بطيء على المراحل.
الصوت: "14 مرحلة، من أول متغير لحد تطبيق ويب كامل بـ Angular."
المشهد 2: افتح موضوع، وورّي الدرس المكتوب بالعربي.
الصوت: "كل موضوع ليه شرح بالعربي، وفيديوهات، واختبار قصير."
المشهد 3: افتح تمرين، اكتب سطر، اضغط تشغيل.
الصوت: "وتمرين تحله وتشوف نتيجته."
النهاية: "مجاني. اللينك في البايو."
الكابشن: خارطة طريق ${NET} و Angular بالعربي، مجانًا. #تعلم_البرمجة #برمجة
اللينك في البايو: ${trackedUrl('tiktok')}`,
  },
  {
    id: 'video-browser-code', kind: 'video', lang: 'ar', en: 'Video 2: C# on a phone', ar: 'فيديو 2: البرمجة من الموبايل',
    text: `المدة: 20 ثانية.

الافتتاحية: "بتكتب ${CS} من الموبايل؟ آه 👀"
المشهد: افتح المحرر على الموبايل، اكتب Console.WriteLine("Hello")، اضغط تشغيل، والناتج يظهر.
الصوت: "من غير ما تنزّل أي برنامج. ${CS} و SQL و TypeScript في المتصفح."
النهاية: "جرّبه، اللينك في البايو."
اللينك في البايو: ${trackedUrl('instagram')}`,
  },
  {
    id: 'video-interview-q', kind: 'video', lang: 'ar', en: 'Video 3: one interview question', ar: 'فيديو 3: سؤال مقابلة واحد',
    text: `المدة: 30 ثانية. سلسلة متكررة: سؤال واحد في كل فيديو.

الافتتاحية: "السؤال ده بيتسأل كتير في إنترفيوهات ${NET} للـ Junior"
المشهد 1: السؤال على الشاشة (مثال: الفرق بين class و struct).
الصوت: "فكّر 5 ثواني…"
المشهد 2: الإجابة النموذجية من بنك الأسئلة.
النهاية: "فيه أكتر من 900 سؤال زيه بإجاباتهم، مجانًا. اللينك في البايو."
اللينك في البايو: ${trackedUrl('youtube')}`,
  },
  {
    id: 'video-placement', kind: 'video', lang: 'ar', en: 'Video 4: placement check', ar: 'فيديو 4: تحديد المستوى',
    text: `المدة: 25 ثانية.

الافتتاحية: "مش عارف مستواك في البرمجة فين؟"
المشهد 1: صفحة تحديد المستوى، جاوب على كام سؤال بسرعة.
المشهد 2: النتيجة: المواضيع اللي تقدر تعدّيها، واللي تبدأ منها.
الصوت: "بدل ما تبدأ من الصفر وإنت عارف نص الحاجات، الموقع بيقولك تبدأ منين."
النهاية: "مجاني، اللينك في البايو."
اللينك في البايو: ${trackedUrl('tiktok')}`,
  },
  {
    id: 'video-certificate', kind: 'video', lang: 'ar', en: 'Video 5: earn a certificate', ar: 'فيديو 5: احصل على شهادة',
    text: `المدة: 20 ثانية.

الافتتاحية: "خلّصت المرحلة الأولى؟ خد شهادتك 🏅"
المشهد 1: خارطة الطريق، مرحلة مكتملة، اضغط "احصل على شهادتك".
المشهد 2: صفحة الشهادة، ثم زر "إضافة إلى LinkedIn".
الصوت: "شهادة برابط تحقق، تضيفها لـ LinkedIn بضغطة. مش شهادة معتمدة، بس إثبات إنك خلّصت المرحلة."
النهاية: "اللينك في البايو."
اللينك في البايو: ${trackedUrl('instagram')}`,
  },

  // ---------- LinkedIn ----------
  {
    id: 'linkedin-en', kind: 'linkedin', lang: 'en', en: 'LinkedIn (English): why I built it', ar: 'لينكدإن بالإنجليزية: لماذا بنيته',
    text: `Juniors keep asking me the same question: "What should I learn to get my first .NET job, and in what order?"

So I built DevPath, a free roadmap in English and Arabic for becoming a full-stack .NET and Angular developer:
• 14 phases and 166 topics, each with a written lesson, a quiz and at least one exercise
• A code runner in the browser for C#, SQL and TypeScript
• 66 guided projects and 900+ interview questions
• Phase certificates with a verification link you can add to LinkedIn

It is a side project and still growing. If you mentor juniors or hire them, I'd value your view on what's missing.

${trackedUrl('linkedin')}

#dotnet #csharp #angular #softwareengineering #learning`,
  },
  {
    id: 'linkedin-ar', kind: 'linkedin', lang: 'ar', en: 'LinkedIn (Arabic): for mentors', ar: 'لينكدإن بالعربية: للمرشدين',
    text: `لو بتساعد Juniors يدخلوا مجال ${NET}، ممكن ده يوفّر عليك وقت.

بنيت "مسار المبرمج" (DevPath): خارطة طريق مجانية بالعربي والإنجليزي من أول سطر كود لحد تطبيق ويب كامل بـ ${NET} و Angular.

• 166 موضوعًا، لكل موضوع درس مكتوب واختبار وتمرين.
• مشاريع بخطوات، وبنك فيه أكتر من 900 سؤال مقابلات.
• شهادة لكل مرحلة برابط تحقق.

ابعته لأي حد بيسألك "أبدأ منين؟"، ولو عندك ملاحظة على ترتيب المواضيع يهمني أسمعها.

${trackedUrl('linkedin')}`,
  },

  // ---------- Community introductions (Discord, Telegram, Facebook groups): only where self-promotion is allowed ----------
  {
    id: 'intro-ar', kind: 'intro', lang: 'ar', en: 'Group introduction (Arabic)', ar: 'تعريف بنفسك في جروب',
    text: `أهلًا يا جماعة 👋 أنا مطوّر ${NET}، ومعظم وقتي هنا هيكون في إني أساعد في الأسئلة.

للعلم بس: عامل موقع مجاني اسمه "مسار المبرمج" فيه خارطة طريق ${NET} و Angular بالعربي، بدروس وتمارين. لو حد محتاجه:
${trackedUrl('telegram')}

ولو عندكم أي سؤال في ${CS} أو SQL اسألوا هنا وأنا أرد.`,
  },
  {
    id: 'intro-en', kind: 'intro', lang: 'en', en: 'Discord introduction (English)', ar: 'تعريف بنفسك في ديسكورد',
    text: `Hi all 👋 .NET dev from Egypt, here mostly to help with C#, SQL and ASP.NET Core questions.

If it's useful to anyone: I maintain a free .NET + Angular roadmap with a lesson and an exercise per topic: ${trackedUrl('discord')}
Feedback very welcome.`,
  },

  // ---------- Referral: what a learner can send a friend ----------
  {
    id: 'referral-ar', kind: 'referral', lang: 'ar', audience: 'all', en: 'Send to a friend (WhatsApp, Arabic)', ar: 'رسالة لصديق على واتساب',
    text: `لقيت موقع مجاني بيمشّيك في البرمجة خطوة بخطوة بالعربي، من الصفر لحد ${NET} و Angular، وفيه درس وتمرين لكل موضوع. تعالى نذاكر عليه سوا 👇
${trackedUrl('friend')}`,
  },
  {
    id: 'referral-en', kind: 'referral', lang: 'en', audience: 'all', en: 'Send to a friend (English)', ar: 'رسالة لصديق بالإنجليزية',
    text: `Found a free step-by-step roadmap for .NET and Angular, with a lesson and an exercise for every topic. Want to go through it together? 👇
${trackedUrl('friend')}`,
  },
  {
    id: 'learner-study-group', kind: 'referral', lang: 'ar', audience: 'all', en: 'Study group or class chat (Arabic)', ar: 'جروب الدفعة أو المذاكرة',
    text: `يا جماعة، لو حد فيكم عايز يذاكر برمجة بترتيب واضح، فيه موقع مجاني اسمه "مسار المبرمج" (DevPath): خارطة طريق ${NET} و Angular بالعربي، لكل موضوع درس وتمرين، وفيه محرر بيشغّل الكود في المتصفح.
ممكن نمشي عليه سوا ونسأل بعض 👇
${trackedUrl('whatsapp')}`,
  },
  {
    id: 'learner-linkedin-en', kind: 'linkedin', lang: 'en', audience: 'all', en: 'LinkedIn: share a finished phase', ar: 'لينكدإن: شارك مرحلة أنهيتها',
    text: `I just finished a phase of the DevPath .NET and Angular roadmap 🎯

It covered [write the phase name here], with a lesson, a quiz and exercises for every topic. Next up: [the next phase].

If you're learning .NET too, the roadmap is free: ${trackedUrl('linkedin')}

#dotnet #csharp #learning`,
  },
  {
    id: 'learner-linkedin-ar', kind: 'linkedin', lang: 'ar', audience: 'all', en: 'LinkedIn (Arabic): share a finished phase', ar: 'لينكدإن بالعربية: شارك مرحلة أنهيتها',
    text: `خلّصت مرحلة جديدة من خارطة طريق ${NET} و Angular على "مسار المبرمج" 🎯

المرحلة كانت عن [اكتب اسم المرحلة هنا]، ولكل موضوع فيها درس واختبار وتمارين. الخطوة الجاية: [المرحلة اللي بعدها].

لو بتتعلم ${NET} إنت كمان، الموقع مجاني 👇
${trackedUrl('linkedin')}`,
  },
];

/** The post a learner shares about the site: in their voice, no claim that they built it, nothing they can't check. */
export const LEARNER_POST_AR = `لو بتدوّر على مكان تذاكر فيه برمجة بترتيب واضح، جرّب "مسار المبرمج" (DevPath) 👇

موقع مجاني بالعربي والإنجليزي بيمشّيك من أول سطر كود لحد تطبيق ويب كامل بـ ${NET} و Angular:

🗺️ خارطة طريق من 14 مرحلة و166 موضوع، لكل موضوع درس مكتوب بالعربي واختبار قصير.
💻 محرر بيشغّل ${CS} و SQL في المتصفح، من غير ما تنزّل أي برنامج.
🧩 أكتر من 250 تمرين، و66 مشروع بخطوات.
🎯 أكتر من 900 سؤال مقابلات بإجاباتهم.
🏅 شهادة لكل مرحلة تخلّصها، تضيفها لـ LinkedIn.

التسجيل بإيميل بس 👇
${trackedUrl('friend')}`;

export const LEARNER_POST_EN = `Looking for a clear, step-by-step way to learn programming? Try DevPath 👇

A free site, in English and Arabic, that takes you from your first line of code to a complete web app with .NET and Angular:

🗺️ A roadmap of 14 phases and 166 topics, each with a written lesson and a short quiz.
💻 A code editor that runs C# and SQL in the browser, nothing to install.
🧩 250+ exercises and 66 step-by-step projects.
🎯 900+ interview questions with answers.
🏅 A certificate for every phase you finish, ready to add to LinkedIn.

Sign up with just an email 👇
${trackedUrl('friend')}`;
