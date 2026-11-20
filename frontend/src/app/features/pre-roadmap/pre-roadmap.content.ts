import { CareerField, Fundamental, IntroQuestion, PreResource } from './pre-roadmap.models';

/*
 * The Pre-Roadmap page's content: what programming is, the main career fields and the fundamentals every
 * beginner needs. It ships with the page (lazy-loaded), so the rest of the app does not carry it.
 * Every outside link here was checked to open on 2026-11-20.
 */

const r = (name: string, url: string, en: string, ar: string, language: 'English' | 'Arabic' = 'English'): PreResource =>
  ({ name, url, note: { en, ar }, language });

const HSOUB = (path: string, en: string, ar: string) => r('Hsoub Academy', `https://academy.hsoub.com/${path}`, en, ar, 'Arabic');

export const INTRO: readonly IntroQuestion[] = [
  {
    id: 'what', icon: 'code',
    question: { en: 'What is programming, and how does it work?', ar: 'ما هي البرمجة، وكيف تعمل؟' },
    answer: [
      {
        en: 'Programming is writing precise, step-by-step instructions that a computer can follow. A computer does nothing on its own: every app, website and game is a long list of small instructions such as "store this number", "compare these two values" or "show this text".',
        ar: 'البرمجة هي كتابة تعليمات دقيقة، خطوة بخطوة، يستطيع الحاسوب تنفيذها. الحاسوب لا يفعل شيئًا من تلقاء نفسه، فكل تطبيق وموقع ولعبة هو قائمة طويلة من تعليمات صغيرة مثل «احفظ هذا الرقم» أو «قارن بين هاتين القيمتين» أو «اعرض هذا النص».',
      },
      {
        en: 'You write those instructions as text (the source code), a tool turns them into something the processor understands, and the computer runs them very fast and exactly as written — including your mistakes.',
        ar: 'تكتب هذه التعليمات نصًا يسمى الشيفرة المصدرية، ثم تحوّلها أداة إلى صيغة يفهمها المعالج، فينفذها الحاسوب بسرعة كبيرة وكما كُتبت تمامًا، بما فيها أخطاؤك.',
      },
    ],
  },
  {
    id: 'why', icon: 'bulb',
    question: { en: 'Why learn programming?', ar: 'لماذا تتعلم البرمجة؟' },
    answer: [
      {
        en: 'Software runs banks, hospitals, shops, cars and phones, so developers are needed in almost every industry, and the work can often be done remotely.',
        ar: 'البرمجيات تدير البنوك والمستشفيات والمتاجر والسيارات والهواتف، لذلك يحتاج كل قطاع تقريبًا إلى مبرمجين، وكثير من هذا العمل يمكن أداؤه عن بُعد.',
      },
      {
        en: 'Even if you never become a full-time developer, programming teaches you to break big problems into small steps and lets you automate boring work. It takes steady practice over months, not a few days — that is normal.',
        ar: 'وحتى إن لم تعمل مبرمجًا، تعلّمك البرمجة تقسيم المشكلات الكبيرة إلى خطوات صغيرة، وتتيح لك أتمتة الأعمال المملة. الأمر يحتاج إلى تدرّب منتظم لشهور وليس لأيام، وهذا طبيعي.',
      },
    ],
  },
  {
    id: 'languages', icon: 'terminal',
    question: { en: 'How do programming languages work?', ar: 'كيف تعمل لغات البرمجة؟' },
    answer: [
      {
        en: 'A programming language is a strict, human-readable notation for instructions. Processors only understand machine code (numbers), so a compiler translates your code ahead of time (C#, C++, Go), or an interpreter runs it line by line (Python, JavaScript). Many languages mix both.',
        ar: 'لغة البرمجة صيغة صارمة لكتابة التعليمات يقرؤها الإنسان. المعالج لا يفهم إلا لغة الآلة وهي أرقام، لذلك يترجم المترجم (Compiler) شيفرتك مسبقًا كما في C# و C++ و Go، أو ينفذها المفسّر (Interpreter) سطرًا بسطر كما في Python و JavaScript، وكثير من اللغات تجمع الطريقتين.',
      },
      {
        en: 'The core ideas — variables, conditions, loops, functions — are the same in almost every language. Learn them well in one language and the second one comes much faster.',
        ar: 'الأفكار الأساسية واحدة في كل اللغات تقريبًا: المتغيرات والشروط والحلقات والدوال. إذا أتقنتها في لغة واحدة، تعلمت الثانية أسرع بكثير.',
      },
    ],
  },
  {
    id: 'terms', icon: 'layers',
    question: { en: 'Programming, coding and software development: what is the difference?', ar: 'ما الفرق بين البرمجة والترميز وتطوير البرمجيات؟' },
    answer: [
      {
        en: 'Coding is the act of typing code in a language. Programming is wider: understanding the problem, designing a solution and testing that it works.',
        ar: 'الترميز (Coding) هو كتابة الشيفرة بلغة ما. أما البرمجة فأوسع: فهم المشكلة، وتصميم الحل، والتأكد من أنه يعمل.',
      },
      {
        en: 'Software development is the whole journey of a product: gathering requirements, design, programming, testing, deployment and years of maintenance, usually as part of a team.',
        ar: 'وتطوير البرمجيات هو رحلة المنتج كاملة: جمع المتطلبات، والتصميم، والبرمجة، والاختبار، والنشر، ثم الصيانة لسنوات، وغالبًا ضمن فريق.',
      },
    ],
  },
  {
    id: 'choose', icon: 'compass',
    question: { en: 'How do I choose the right career path?', ar: 'كيف أختار المسار المناسب لي؟' },
    answer: [
      {
        en: 'Start from what you enjoy seeing: interfaces people click (frontend, mobile), logic and data behind the scenes (backend, data), games, or keeping systems safe and running (security, DevOps). Then check job posts in your city or for remote work.',
        ar: 'ابدأ مما تحب أن تراه: واجهات يضغط عليها الناس (الواجهات الأمامية والموبايل)، أو منطق وبيانات خلف الكواليس (الخلفية والبيانات)، أو الألعاب، أو حماية الأنظمة وتشغيلها (الأمن و DevOps). ثم راجع إعلانات الوظائف في مدينتك أو للعمل عن بُعد.',
      },
      {
        en: 'Do not wait for the perfect choice. Pick one field, learn its basics for a few weeks and build something small. The fundamentals below carry over to every field, so no time is wasted if you switch.',
        ar: 'لا تنتظر الاختيار المثالي. اختر مجالًا واحدًا، وتعلّم أساسياته بضعة أسابيع، وابنِ شيئًا صغيرًا. الأساسيات في أسفل الصفحة مشتركة بين كل المجالات، فلن يضيع وقتك إن غيّرت رأيك.',
      },
    ],
  },
];

export const FIELDS: readonly CareerField[] = [
  {
    id: 'frontend', icon: 'monitor', category: 'web', difficulty: 'Beginner',
    title: { en: 'Frontend development', ar: 'تطوير الواجهات الأمامية' },
    summary: {
      en: 'Building everything you see and click in a website or web app: layout, colours, forms, buttons and how the page reacts to you.',
      ar: 'بناء كل ما تراه وتضغط عليه في الموقع أو تطبيق الويب: التخطيط والألوان والنماذج والأزرار، وكيف تتفاعل الصفحة معك.',
    },
    examples: [
      { en: 'The pages of an online shop, with filters and a cart', ar: 'صفحات متجر إلكتروني مع المرشحات وسلة الشراء' },
      { en: 'Web apps such as email, maps and online editors', ar: 'تطبيقات الويب مثل البريد والخرائط والمحررات على الإنترنت' },
      { en: 'Dashboards that show charts and tables', ar: 'لوحات المعلومات التي تعرض الرسوم البيانية والجداول' },
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Tailwind CSS', 'Vite'],
    startWith: [
      { name: 'HTML & CSS', why: { en: 'Every web page is built from them, and you see the result instantly in the browser — the fastest feedback a beginner can get.', ar: 'كل صفحة ويب مبنية بهما، وترى النتيجة فورًا في المتصفح، وهذه أسرع طريقة يرى بها المبتدئ نتيجة عمله.' } },
      { name: 'JavaScript', why: { en: 'The only language that runs in every browser; it makes pages interactive.', ar: 'اللغة الوحيدة التي تعمل في كل المتصفحات، وهي التي تجعل الصفحات تفاعلية.' } },
      { name: 'TypeScript + one framework', why: { en: 'TypeScript catches mistakes before you run the code, and a framework (Angular or React) is what companies use for large apps.', ar: 'تكتشف TypeScript الأخطاء قبل التشغيل، وإطار العمل (Angular أو React) هو ما تستخدمه الشركات في التطبيقات الكبيرة.' } },
    ],
    skills: [
      { en: 'Responsive layouts that work on phones and desktops', ar: 'تخطيطات متجاوبة تعمل على الهاتف وسطح المكتب' },
      { en: 'Accessibility, so everyone can use the page', ar: 'إتاحة الوصول، ليستخدم الجميع الصفحة' },
      { en: 'Calling APIs and showing loading and error states', ar: 'استدعاء الواجهات البرمجية وعرض حالات التحميل والأخطاء' },
      { en: 'An eye for detail and basic design sense', ar: 'الانتباه للتفاصيل وحس أساسي بالتصميم' },
    ],
    prerequisites: { en: 'None beyond basic computer use. A good first field for complete beginners.', ar: 'لا شيء غير استخدام الحاسوب. مجال أول مناسب للمبتدئين تمامًا.' },
    resources: [
      r('MDN: Learn web development', 'https://developer.mozilla.org/en-US/docs/Learn_web_development', 'Free, trusted course from the makers of Firefox.', 'دورة مجانية موثوقة من فريق Firefox.'),
      r('The Odin Project', 'https://www.theodinproject.com', 'A free full curriculum built around projects.', 'منهج كامل مجاني قائم على المشاريع.'),
      r('Hsoub Wiki: JavaScript', 'https://wiki.hsoub.com/JavaScript', 'JavaScript reference in Arabic.', 'مرجع JavaScript باللغة العربية.', 'Arabic'),
    ],
    nextSteps: [
      { en: 'Build a personal page, then a small app that reads data from a public API.', ar: 'ابنِ صفحة شخصية، ثم تطبيقًا صغيرًا يقرأ بيانات من واجهة برمجية عامة.' },
      { en: 'Follow the TypeScript and Angular phases of this site’s roadmap.', ar: 'تابع مرحلتي TypeScript و Angular في خارطة الطريق على هذا الموقع.' },
    ],
    siteFit: { en: 'Covered: the roadmap teaches TypeScript and Angular, and there is a Frontend Developer learning path.', ar: 'مغطّى: خارطة الطريق تشرح TypeScript و Angular، ويوجد مسار تعلم لمطوّر الواجهات الأمامية.' },
    links: { phases: ['typescript', 'angular'], paths: ['frontend-developer'] },
  },
  {
    id: 'backend', icon: 'server', category: 'web', difficulty: 'Intermediate',
    title: { en: 'Backend development', ar: 'تطوير الخلفية' },
    summary: {
      en: 'Building the server side that users never see: business rules, databases, sign-in, payments and the APIs that apps talk to.',
      ar: 'بناء جانب الخادم الذي لا يراه المستخدم: قواعد العمل، وقواعد البيانات، وتسجيل الدخول، والمدفوعات، والواجهات البرمجية التي تتحدث معها التطبيقات.',
    },
    examples: [
      { en: 'The system that saves your order and charges your card', ar: 'النظام الذي يحفظ طلبك ويخصم المبلغ من بطاقتك' },
      { en: 'Sign-in and accounts for a website', ar: 'تسجيل الدخول والحسابات في موقع' },
      { en: 'APIs used by mobile apps and other companies', ar: 'واجهات برمجية تستخدمها تطبيقات الموبايل والشركات الأخرى' },
    ],
    technologies: ['C#', 'ASP.NET Core', 'Java', 'Spring Boot', 'Python', 'Django', 'Node.js', 'Go', 'SQL', 'REST APIs'],
    startWith: [
      { name: 'C# and ASP.NET Core', why: { en: 'One clear, strongly typed language with excellent free tools and documentation, widely used by companies for business systems.', ar: 'لغة واضحة صارمة الأنواع مع أدوات وتوثيق مجاني ممتاز، وتستخدمها الشركات بكثرة في أنظمة الأعمال.' } },
      { name: 'SQL', why: { en: 'Almost every backend stores data in a database, and SQL has been the standard way to query it for decades.', ar: 'كل خادم تقريبًا يحفظ البيانات في قاعدة بيانات، و SQL هي الطريقة القياسية للاستعلام عنها منذ عقود.' } },
      { name: 'HTTP & REST', why: { en: 'They are how the frontend and the backend talk; you cannot build an API without them.', ar: 'بهما تتواصل الواجهة الأمامية مع الخلفية، ولا يمكن بناء واجهة برمجية بدونهما.' } },
    ],
    skills: [
      { en: 'Designing databases and writing efficient queries', ar: 'تصميم قواعد البيانات وكتابة استعلامات فعّالة' },
      { en: 'Authentication, authorization and security basics', ar: 'المصادقة والصلاحيات وأساسيات الأمان' },
      { en: 'Error handling, logging and automated tests', ar: 'معالجة الأخطاء والتسجيل والاختبارات الآلية' },
    ],
    prerequisites: { en: 'Programming basics in one language and comfort with logic. Helpful: how the web works.', ar: 'أساسيات البرمجة بلغة واحدة والارتياح للمنطق. ومن المفيد معرفة كيف يعمل الويب.' },
    resources: [
      r('Microsoft Learn: ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/', 'Official documentation and tutorials.', 'التوثيق الرسمي والدروس.'),
      r('W3Schools SQL', 'https://www.w3schools.com/sql/', 'Short SQL lessons you can try in the browser.', 'دروس SQL قصيرة تجربها في المتصفح.'),
      HSOUB('programming/', 'Arabic programming articles and tutorials.', 'مقالات ودروس برمجة بالعربية.'),
    ],
    nextSteps: [
      { en: 'Build a small API with create, read, update and delete for one thing (books, tasks).', ar: 'ابنِ واجهة برمجية صغيرة فيها إضافة وعرض وتعديل وحذف لشيء واحد مثل الكتب أو المهام.' },
      { en: 'Follow the C#, ASP.NET Core and database phases of this site’s roadmap.', ar: 'تابع مراحل C# و ASP.NET Core وقواعد البيانات في خارطة الطريق.' },
    ],
    siteFit: { en: 'Covered: this is the heart of the site’s .NET roadmap, with Backend Developer and API Specialist paths.', ar: 'مغطّى: هذا قلب خارطة طريق .NET على الموقع، ويوجد مساران لمطوّر الخلفية ومتخصص الواجهات البرمجية.' },
    links: { phases: ['csharp-fundamentals', 'aspnet-core', 'ef-core'], paths: ['backend-developer', 'api-specialist'] },
  },
  {
    id: 'fullstack', icon: 'layers', category: 'web', difficulty: 'Intermediate',
    title: { en: 'Full-stack development', ar: 'التطوير الشامل (Full-Stack)' },
    summary: {
      en: 'Working on both sides of a web app — the interface and the server — and connecting them into one working product.',
      ar: 'العمل على جانبي تطبيق الويب، الواجهة والخادم، وربطهما في منتج واحد يعمل.',
    },
    examples: [
      { en: 'A startup developer who builds a whole feature alone', ar: 'مطوّر في شركة ناشئة يبني ميزة كاملة وحده' },
      { en: 'Internal company tools: forms, reports and approvals', ar: 'أدوات الشركات الداخلية: النماذج والتقارير والموافقات' },
      { en: 'A learning platform like this one', ar: 'منصة تعليمية مثل هذا الموقع' },
    ],
    technologies: ['TypeScript', 'Angular', 'React', 'C#', 'ASP.NET Core', 'Node.js', 'SQL Server', 'PostgreSQL', 'Git', 'Docker'],
    startWith: [
      { name: 'One frontend + one backend stack', why: { en: 'Pick a pair that works well together (for example Angular with ASP.NET Core) and go deep, instead of sampling many.', ar: 'اختر زوجًا يعمل جيدًا معًا، مثل Angular مع ASP.NET Core، وتعمّق فيه بدل تجربة أشياء كثيرة.' } },
      { name: 'SQL & Git', why: { en: 'Every full-stack project needs a database and version control from day one.', ar: 'كل مشروع شامل يحتاج قاعدة بيانات وإدارة إصدارات من اليوم الأول.' } },
    ],
    skills: [
      { en: 'Designing an API and the screens that use it', ar: 'تصميم الواجهة البرمجية والشاشات التي تستخدمها' },
      { en: 'Following a feature from the database to the button', ar: 'تتبّع الميزة من قاعدة البيانات حتى الزر' },
      { en: 'Deploying an app so others can use it', ar: 'نشر التطبيق ليستخدمه الآخرون' },
    ],
    prerequisites: { en: 'Best after some frontend or backend basics. It is wide, so expect a longer journey.', ar: 'الأفضل بعد بعض أساسيات الواجهات أو الخلفية. المجال واسع، فتوقع رحلة أطول.' },
    resources: [
      r('freeCodeCamp', 'https://www.freecodecamp.org/learn', 'Free certifications from web basics to back end.', 'شهادات مجانية من أساسيات الويب حتى الخلفية.'),
      r('roadmap.sh', 'https://roadmap.sh', 'Community roadmaps for many roles.', 'خرائط طريق مجتمعية لأدوار كثيرة.'),
    ],
    nextSteps: [
      { en: 'Build one complete project: database, API, interface, sign-in and deployment.', ar: 'ابنِ مشروعًا واحدًا كاملًا: قاعدة بيانات وواجهة برمجية وواجهة مستخدم وتسجيل دخول ونشر.' },
      { en: 'Follow this site’s full roadmap; it is a full-stack .NET and Angular roadmap.', ar: 'تابع خارطة الطريق كاملة على الموقع، فهي خارطة شاملة لـ .NET و Angular.' },
    ],
    siteFit: { en: 'Covered: the whole roadmap is full-stack .NET + Angular, with a Full-Stack Developer path.', ar: 'مغطّى: خارطة الطريق كلها للتطوير الشامل بـ .NET و Angular، ويوجد مسار للمطوّر الشامل.' },
    links: { phases: ['full-stack-integration'], paths: ['full-stack-developer'] },
  },
  {
    id: 'mobile', icon: 'smartphone', category: 'apps', difficulty: 'Intermediate',
    title: { en: 'Mobile app development', ar: 'تطوير تطبيقات الموبايل' },
    summary: {
      en: 'Building apps for Android and iPhone, either natively for each platform or once for both with a cross-platform framework.',
      ar: 'بناء تطبيقات أندرويد وآيفون، إما لكل منصة على حدة، أو مرة واحدة للمنصتين بإطار عمل متعدد المنصات.',
    },
    examples: [
      { en: 'Banking, delivery and ride-hailing apps', ar: 'تطبيقات البنوك والتوصيل وطلب السيارات' },
      { en: 'Fitness trackers that use the phone’s sensors', ar: 'تطبيقات اللياقة التي تستخدم حساسات الهاتف' },
      { en: 'Messaging apps with notifications', ar: 'تطبيقات المراسلة مع الإشعارات' },
    ],
    technologies: ['Kotlin', 'Swift', 'SwiftUI', 'Flutter', 'Dart', 'React Native', '.NET MAUI', 'Firebase'],
    startWith: [
      { name: 'Flutter (Dart)', why: { en: 'One code base for Android and iPhone, fast visual feedback with hot reload, and many Arabic tutorials.', ar: 'شيفرة واحدة لأندرويد وآيفون، ونتيجة فورية مع إعادة التحميل السريع، ودروس عربية كثيرة.' } },
      { name: 'Kotlin or Swift', why: { en: 'Choose a native language if you target one platform or want the deepest access to the device.', ar: 'اختر لغة أصلية إن كنت تستهدف منصة واحدة أو تحتاج أعمق وصول لإمكانات الجهاز.' } },
    ],
    skills: [
      { en: 'Designing for small screens and touch', ar: 'التصميم للشاشات الصغيرة واللمس' },
      { en: 'Working offline and syncing data', ar: 'العمل دون اتصال ومزامنة البيانات' },
      { en: 'Publishing to Google Play and the App Store', ar: 'النشر على Google Play و App Store' },
    ],
    prerequisites: { en: 'Programming basics and OOP. A Mac is required to build iPhone apps natively.', ar: 'أساسيات البرمجة والبرمجة الكائنية. وتحتاج جهاز Mac لبناء تطبيقات آيفون الأصلية.' },
    resources: [
      r('Flutter documentation', 'https://docs.flutter.dev', 'Official getting-started guides.', 'أدلة البدء الرسمية.'),
      r('Android Developers courses', 'https://developer.android.com/courses', 'Free official Kotlin and Android courses.', 'دورات رسمية مجانية في Kotlin وأندرويد.'),
      r('Apple: SwiftUI tutorials', 'https://developer.apple.com/tutorials/swiftui', 'Official step-by-step iPhone tutorials.', 'دروس آيفون الرسمية خطوة بخطوة.'),
      HSOUB('apps/', 'Arabic articles on building apps.', 'مقالات عربية عن بناء التطبيقات.'),
    ],
    nextSteps: [
      { en: 'Build a to-do or notes app that saves data on the phone.', ar: 'ابنِ تطبيق مهام أو ملاحظات يحفظ البيانات على الهاتف.' },
      { en: 'Learn how apps call a backend API — the roadmap’s HTTP and API topics help here.', ar: 'تعلّم كيف تستدعي التطبيقات واجهة برمجية في الخادم، وموضوعات HTTP والواجهات البرمجية في خارطة الطريق تفيدك هنا.' },
    ],
    siteFit: { en: 'Not covered by this site’s roadmap. The C#, OOP and API phases still apply (and .NET MAUI uses C#).', ar: 'غير مغطّى في خارطة الطريق على هذا الموقع، لكن مراحل C# والبرمجة الكائنية والواجهات البرمجية مفيدة، و .NET MAUI يستخدم C#.' },
    links: { topics: ['api-http-rest'], phases: ['object-oriented-programming'] },
  },
  {
    id: 'game', icon: 'gamepad', category: 'apps', difficulty: 'Intermediate',
    title: { en: 'Game development', ar: 'تطوير الألعاب' },
    summary: {
      en: 'Programming the rules, movement, physics and interaction of video games, usually inside a game engine.',
      ar: 'برمجة قواعد الألعاب وحركتها وفيزيائها وتفاعلها، وغالبًا داخل محرك ألعاب.',
    },
    examples: [
      { en: 'Mobile and PC games', ar: 'ألعاب الهاتف والحاسوب' },
      { en: 'Simulations and training tools', ar: 'المحاكاة وأدوات التدريب' },
      { en: 'Virtual and augmented reality experiences', ar: 'تجارب الواقع الافتراضي والمعزّز' },
    ],
    technologies: ['C#', 'Unity', 'C++', 'Unreal Engine', 'Godot', 'GDScript', 'Blender'],
    startWith: [
      { name: 'Unity with C#', why: { en: 'The most taught engine for beginners, huge community, and C# is a clean language that also works outside games.', ar: 'أكثر محرك تُشرح به الدروس للمبتدئين، ومجتمعه ضخم، و C# لغة واضحة تفيدك خارج الألعاب أيضًا.' } },
      { name: 'Godot', why: { en: 'Free and open source, lightweight, and simple to start with for 2D games.', ar: 'مجاني ومفتوح المصدر وخفيف، وسهل البداية للألعاب ثنائية الأبعاد.' } },
    ],
    skills: [
      { en: 'Math basics: vectors and coordinates', ar: 'أساسيات الرياضيات: المتجهات والإحداثيات' },
      { en: 'Game loops, input and collisions', ar: 'حلقة اللعبة والإدخال والتصادمات' },
      { en: 'Performance on low-end devices', ar: 'الأداء على الأجهزة الضعيفة' },
    ],
    prerequisites: { en: 'Programming basics and OOP. Comfort with basic math helps a lot.', ar: 'أساسيات البرمجة والبرمجة الكائنية. والارتياح للرياضيات الأساسية يساعد كثيرًا.' },
    resources: [
      r('Unity Learn', 'https://learn.unity.com', 'Free official Unity courses.', 'دورات Unity الرسمية المجانية.'),
      r('Godot documentation', 'https://docs.godotengine.org/en/stable/', 'Official docs with a step-by-step first game.', 'التوثيق الرسمي مع أول لعبة خطوة بخطوة.'),
    ],
    nextSteps: [
      { en: 'Finish a tiny game (Pong, a platformer level) before starting a big idea.', ar: 'أنهِ لعبة صغيرة جدًا، مثل Pong أو مرحلة منصات، قبل البدء بفكرة كبيرة.' },
      { en: 'Strengthen C# and OOP with the roadmap’s first phases.', ar: 'قوِّ C# والبرمجة الكائنية بالمراحل الأولى من خارطة الطريق.' },
    ],
    siteFit: { en: 'Not covered by this site’s roadmap, but Unity games are written in C#, which the first phases teach.', ar: 'غير مغطّى في خارطة الطريق، لكن ألعاب Unity تُكتب بـ C#، وهي ما تشرحه المراحل الأولى.' },
    links: { phases: ['csharp-fundamentals', 'object-oriented-programming'] },
  },
  {
    id: 'ai', icon: 'sparkle', category: 'data', difficulty: 'Advanced',
    title: { en: 'Artificial intelligence & machine learning', ar: 'الذكاء الاصطناعي وتعلّم الآلة' },
    summary: {
      en: 'Teaching computers to learn patterns from data — to recognise images, understand text or predict numbers — and building products on top of AI models.',
      ar: 'تعليم الحاسوب استخلاص الأنماط من البيانات، ليتعرف على الصور أو يفهم النصوص أو يتوقع الأرقام، وبناء منتجات تعتمد على نماذج الذكاء الاصطناعي.',
    },
    examples: [
      { en: 'Recommendations on video and shopping sites', ar: 'الاقتراحات في مواقع الفيديو والتسوق' },
      { en: 'Chat assistants and translation', ar: 'المساعدات الحوارية والترجمة' },
      { en: 'Fraud detection in banking', ar: 'كشف الاحتيال في البنوك' },
    ],
    technologies: ['Python', 'NumPy', 'pandas', 'scikit-learn', 'PyTorch', 'TensorFlow', 'Jupyter', 'LLM APIs'],
    startWith: [
      { name: 'Python', why: { en: 'Nearly all AI libraries and courses use it, and its syntax is friendly to beginners.', ar: 'كل مكتبات الذكاء الاصطناعي ودوراته تقريبًا تستخدمها، وصياغتها سهلة للمبتدئين.' } },
      { name: 'Math foundations', why: { en: 'Statistics, linear algebra and a little calculus explain why models work and when they fail.', ar: 'الإحصاء والجبر الخطي وقليل من التفاضل تشرح لماذا تعمل النماذج ومتى تفشل.' } },
      { name: 'scikit-learn', why: { en: 'Classic machine learning with small, readable code before moving to deep learning.', ar: 'تعلّم آلة تقليدي بشيفرة قصيرة واضحة قبل الانتقال للتعلم العميق.' } },
    ],
    skills: [
      { en: 'Cleaning and understanding data', ar: 'تنظيف البيانات وفهمها' },
      { en: 'Evaluating models honestly (and spotting bias)', ar: 'تقييم النماذج بأمانة واكتشاف التحيّز' },
      { en: 'Software engineering to ship models in real apps', ar: 'هندسة البرمجيات لإدخال النماذج في تطبيقات حقيقية' },
    ],
    prerequisites: { en: 'Solid programming, then math (statistics, linear algebra). Research roles often expect a degree.', ar: 'برمجة جيدة ثم الرياضيات (الإحصاء والجبر الخطي). وظائف البحث غالبًا تتطلب شهادة جامعية.' },
    resources: [
      r('Google: Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course', 'Free course with exercises.', 'دورة مجانية مع تمارين.'),
      r('Kaggle Learn', 'https://www.kaggle.com/learn', 'Short hands-on lessons with real data sets.', 'دروس قصيرة عملية على بيانات حقيقية.'),
      HSOUB('programming/artificial-intelligence/', 'Arabic articles on AI.', 'مقالات عربية عن الذكاء الاصطناعي.'),
    ],
    nextSteps: [
      { en: 'Learn Python, then train a simple model on a Kaggle data set.', ar: 'تعلّم Python، ثم درّب نموذجًا بسيطًا على بيانات من Kaggle.' },
      { en: 'If you are a .NET developer, the roadmap shows how to call AI models from C#.', ar: 'إن كنت مطوّر .NET، توضح خارطة الطريق كيف تستدعي نماذج الذكاء الاصطناعي من C#.' },
    ],
    siteFit: { en: 'Mostly not covered: the roadmap has one topic on using AI models from .NET apps.', ar: 'غير مغطّى في معظمه: في خارطة الطريق موضوع واحد عن استخدام نماذج الذكاء الاصطناعي في تطبيقات .NET.' },
    links: { topics: ['ai-dotnet-llm'] },
  },
  {
    id: 'data', icon: 'chart', category: 'data', difficulty: 'Beginner',
    title: { en: 'Data science & data analysis', ar: 'علم البيانات وتحليلها' },
    summary: {
      en: 'Turning raw data into answers: cleaning it, finding patterns, building charts and reports that help people decide.',
      ar: 'تحويل البيانات الخام إلى إجابات: تنظيفها، واكتشاف الأنماط فيها، وبناء رسوم وتقارير تساعد الناس على اتخاذ القرار.',
    },
    examples: [
      { en: 'Sales dashboards for managers', ar: 'لوحات المبيعات للمديرين' },
      { en: 'Finding why customers leave a service', ar: 'معرفة سبب ترك العملاء لخدمة ما' },
      { en: 'Public health and sports statistics', ar: 'إحصاءات الصحة العامة والرياضة' },
    ],
    technologies: ['SQL', 'Excel', 'Python', 'pandas', 'Power BI', 'Tableau', 'Jupyter', 'R'],
    startWith: [
      { name: 'SQL', why: { en: 'Most company data lives in databases; SQL is the first skill data job posts ask for.', ar: 'أغلب بيانات الشركات في قواعد بيانات، و SQL أول مهارة تطلبها وظائف البيانات.' } },
      { name: 'Excel or Power BI', why: { en: 'You can analyse and present data without much code and show value quickly.', ar: 'تستطيع تحليل البيانات وعرضها دون شيفرة كثيرة، وتُظهر قيمة عملك بسرعة.' } },
      { name: 'Python with pandas', why: { en: 'For larger data sets and repeatable analysis.', ar: 'للبيانات الأكبر والتحليل القابل للتكرار.' } },
    ],
    skills: [
      { en: 'Asking clear questions of data', ar: 'طرح أسئلة واضحة على البيانات' },
      { en: 'Statistics basics', ar: 'أساسيات الإحصاء' },
      { en: 'Explaining findings with simple charts', ar: 'شرح النتائج برسوم بسيطة' },
    ],
    prerequisites: { en: 'Comfort with numbers. Analysis can start with little programming; data science needs more math.', ar: 'الارتياح للأرقام. يمكن بدء التحليل ببرمجة قليلة، أما علم البيانات فيحتاج رياضيات أكثر.' },
    resources: [
      r('Kaggle Learn: Python', 'https://www.kaggle.com/learn/python', 'Python for data, free and hands-on.', 'Python للبيانات، مجاني وعملي.'),
      r('pandas: Getting started', 'https://pandas.pydata.org/docs/getting_started/index.html', 'Official pandas tutorials.', 'دروس pandas الرسمية.'),
      r('Hsoub Wiki: SQL', 'https://wiki.hsoub.com/SQL', 'SQL reference in Arabic.', 'مرجع SQL باللغة العربية.', 'Arabic'),
    ],
    nextSteps: [
      { en: 'Pick a public data set you care about and answer three questions with SQL and a chart.', ar: 'اختر بيانات عامة تهمّك، وأجب عن ثلاثة أسئلة باستخدام SQL ورسم بياني.' },
      { en: 'The roadmap’s SQL phases give a strong SQL base.', ar: 'مراحل SQL في خارطة الطريق تمنحك أساسًا قويًا فيها.' },
    ],
    siteFit: { en: 'Partly covered: the roadmap’s SQL and database phases and the Database Expert path; analysis tools are not covered.', ar: 'مغطّى جزئيًا: مراحل SQL وقواعد البيانات ومسار خبير قواعد البيانات، أما أدوات التحليل فغير مغطاة.' },
    links: { phases: ['ef-core', 'sql-server-for-dotnet'], paths: ['database-expert'] },
  },
  {
    id: 'security', icon: 'shield', category: 'systems', difficulty: 'Advanced',
    title: { en: 'Cybersecurity', ar: 'الأمن السيبراني' },
    summary: {
      en: 'Protecting systems, networks and data from attacks: finding weaknesses before attackers do, and responding when something goes wrong.',
      ar: 'حماية الأنظمة والشبكات والبيانات من الهجمات: اكتشاف الثغرات قبل المهاجمين، والتصرف عند حدوث مشكلة.',
    },
    examples: [
      { en: 'Testing a bank’s website for weaknesses (penetration testing)', ar: 'اختبار موقع بنك بحثًا عن الثغرات (اختبار الاختراق)' },
      { en: 'Watching alerts in a security operations centre', ar: 'مراقبة التنبيهات في مركز العمليات الأمنية' },
      { en: 'Writing secure code and reviewing others’', ar: 'كتابة شيفرة آمنة ومراجعة شيفرة الآخرين' },
    ],
    technologies: ['Linux', 'Networking (TCP/IP)', 'Python', 'Bash', 'Wireshark', 'Nmap', 'Burp Suite', 'OWASP Top 10'],
    startWith: [
      { name: 'Networking & Linux', why: { en: 'You cannot protect what you do not understand; almost all security work starts from how networks and servers behave.', ar: 'لا يمكنك حماية ما لا تفهمه، وكل عمل أمني تقريبًا يبدأ من فهم سلوك الشبكات والخوادم.' } },
      { name: 'Python', why: { en: 'Used to automate checks and write small security tools.', ar: 'تُستخدم لأتمتة الفحوص وكتابة أدوات أمنية صغيرة.' } },
      { name: 'Web security (OWASP Top 10)', why: { en: 'The most common real-world weaknesses, explained by a trusted non-profit.', ar: 'أشهر الثغرات في الواقع، تشرحها منظمة غير ربحية موثوقة.' } },
    ],
    skills: [
      { en: 'Thinking like an attacker, acting ethically', ar: 'التفكير كمهاجم مع الالتزام الأخلاقي' },
      { en: 'Reading logs and network traffic', ar: 'قراءة السجلات وحركة الشبكة' },
      { en: 'Clear written reports', ar: 'كتابة تقارير واضحة' },
    ],
    prerequisites: { en: 'Networking, operating systems and some programming. Only test systems you have permission to test.', ar: 'الشبكات وأنظمة التشغيل وبعض البرمجة. ولا تختبر إلا الأنظمة التي لديك إذن باختبارها.' },
    resources: [
      r('OWASP Top 10', 'https://owasp.org/www-project-top-ten/', 'The standard list of web application risks.', 'القائمة القياسية لمخاطر تطبيقات الويب.'),
      r('TryHackMe', 'https://tryhackme.com', 'Legal, guided hacking labs in the browser.', 'معامل اختراق قانونية موجّهة في المتصفح.'),
      r('OverTheWire: Bandit', 'https://overthewire.org/wargames/bandit/', 'A free game that teaches the Linux command line.', 'لعبة مجانية تعلّم سطر أوامر لينكس.'),
      HSOUB('devops/security/', 'Arabic security articles.', 'مقالات أمنية بالعربية.'),
    ],
    nextSteps: [
      { en: 'Learn networking basics and Linux, then solve beginner rooms on a legal lab site.', ar: 'تعلّم أساسيات الشبكات ولينكس، ثم حُلّ التحديات المبتدئة في موقع معامل قانوني.' },
      { en: 'Developers: the roadmap’s security topic covers secure web apps.', ar: 'للمطورين: موضوع الأمان في خارطة الطريق يغطي بناء تطبيقات ويب آمنة.' },
    ],
    siteFit: { en: 'Mostly not covered: the roadmap teaches application security for developers, not security careers.', ar: 'غير مغطّى في معظمه: خارطة الطريق تشرح أمان التطبيقات للمطورين، لا مسارات العمل في الأمن.' },
    links: { topics: ['pro-security', 'sql-injection'] },
  },
  {
    id: 'devops', icon: 'cloud', category: 'systems', difficulty: 'Advanced',
    title: { en: 'DevOps & cloud computing', ar: 'DevOps والحوسبة السحابية' },
    summary: {
      en: 'Getting software from a developer’s machine to millions of users reliably: automated builds and tests, servers in the cloud, monitoring and scaling.',
      ar: 'إيصال البرمجيات من جهاز المطوّر إلى ملايين المستخدمين بموثوقية: بناء واختبار آلي، وخوادم في السحابة، ومراقبة وتوسّع.',
    },
    examples: [
      { en: 'A pipeline that tests and deploys every change automatically', ar: 'خط عمل يختبر كل تغيير وينشره آليًا' },
      { en: 'Keeping a website up during a big sale', ar: 'إبقاء موقع يعمل أثناء عروض كبيرة' },
      { en: 'Moving a company’s servers to Azure or AWS', ar: 'نقل خوادم شركة إلى Azure أو AWS' },
    ],
    technologies: ['Linux', 'Git', 'Docker', 'Kubernetes', 'GitHub Actions', 'Azure', 'AWS', 'Terraform', 'Bash'],
    startWith: [
      { name: 'Linux & the command line', why: { en: 'Most servers run Linux, and DevOps work happens in the terminal.', ar: 'أغلب الخوادم تعمل بلينكس، وعمل DevOps يتم في الطرفية.' } },
      { name: 'Git & Docker', why: { en: 'Git tracks every change, and Docker packages an app so it runs the same everywhere — the base of modern pipelines.', ar: 'Git يتتبع كل تغيير، و Docker يحزم التطبيق ليعمل بالطريقة نفسها في كل مكان، وهما أساس خطوط العمل الحديثة.' } },
      { name: 'One cloud provider', why: { en: 'Learn one well (Azure or AWS); the ideas transfer to the others.', ar: 'أتقن مزوّدًا واحدًا (Azure أو AWS)، فالأفكار تنتقل إلى غيره.' } },
    ],
    skills: [
      { en: 'Automating repetitive work with scripts', ar: 'أتمتة الأعمال المتكررة بالسكربتات' },
      { en: 'Networking and security basics', ar: 'أساسيات الشبكات والأمان' },
      { en: 'Calm troubleshooting when production breaks', ar: 'الهدوء في حل المشكلات عندما يتعطل النظام' },
    ],
    prerequisites: { en: 'Usually entered after some years as a developer or system administrator.', ar: 'غالبًا يُدخل إليه بعد سنوات من العمل كمطوّر أو مدير أنظمة.' },
    resources: [
      r('Docker: Get started', 'https://docs.docker.com/get-started/', 'Official hands-on introduction.', 'مقدمة عملية رسمية.'),
      r('Microsoft Learn: Azure', 'https://learn.microsoft.com/en-us/training/azure/', 'Free Azure learning paths.', 'مسارات تعلم Azure المجانية.'),
      HSOUB('devops/', 'Arabic DevOps and Linux articles.', 'مقالات عربية عن DevOps ولينكس.'),
    ],
    nextSteps: [
      { en: 'Put a small app in a Docker container and deploy it with a GitHub Actions pipeline.', ar: 'ضع تطبيقًا صغيرًا في حاوية Docker، وانشره بخط عمل GitHub Actions.' },
      { en: 'Follow the Git and Cloud & DevOps phases of the roadmap.', ar: 'تابع مرحلتي Git والسحابة و DevOps في خارطة الطريق.' },
    ],
    siteFit: { en: 'Partly covered: the roadmap has Git and Cloud, DevOps & Distributed Systems phases for developers.', ar: 'مغطّى جزئيًا: في خارطة الطريق مرحلتا Git والسحابة و DevOps والأنظمة الموزعة للمطورين.' },
    links: { phases: ['git-github', 'cloud-devops'] },
  },
  {
    id: 'desktop', icon: 'app-window', category: 'apps', difficulty: 'Beginner',
    title: { en: 'Desktop application development', ar: 'تطوير تطبيقات سطح المكتب' },
    summary: {
      en: 'Building programs installed on Windows, macOS or Linux: business tools, editors and utilities that work even without the internet.',
      ar: 'بناء برامج تُثبّت على ويندوز أو ماك أو لينكس: أدوات الأعمال والمحررات والبرامج المساعدة التي تعمل حتى دون إنترنت.',
    },
    examples: [
      { en: 'Point-of-sale and accounting programs', ar: 'برامج نقاط البيع والمحاسبة' },
      { en: 'Code editors and design tools', ar: 'محررات الشيفرة وأدوات التصميم' },
      { en: 'Tools that control machines in factories and labs', ar: 'برامج تتحكم في الأجهزة في المصانع والمعامل' },
    ],
    technologies: ['C#', 'WPF', 'WinForms', '.NET MAUI', 'Electron', 'Java', 'JavaFX', 'C++', 'Qt'],
    startWith: [
      { name: 'C# with WinForms or WPF', why: { en: 'You drag controls onto a window and see a working program quickly, and C# is used widely for business software.', ar: 'تسحب العناصر إلى النافذة وترى برنامجًا يعمل بسرعة، و C# منتشرة في برامج الأعمال.' } },
      { name: 'Electron', why: { en: 'If you already know web technologies, it turns a web app into a desktop app.', ar: 'إن كنت تعرف تقنيات الويب، فهو يحوّل تطبيق الويب إلى تطبيق سطح مكتب.' } },
    ],
    skills: [
      { en: 'Event-driven programming (clicks, keys, timers)', ar: 'البرمجة القائمة على الأحداث (النقرات والمفاتيح والمؤقتات)' },
      { en: 'Working with files and local databases', ar: 'التعامل مع الملفات وقواعد البيانات المحلية' },
      { en: 'Installers and updates', ar: 'برامج التثبيت والتحديثات' },
    ],
    prerequisites: { en: 'Programming basics and OOP. A gentle field to start with.', ar: 'أساسيات البرمجة والبرمجة الكائنية. مجال لطيف للبداية.' },
    resources: [
      r('Microsoft Learn: .NET desktop', 'https://learn.microsoft.com/en-us/dotnet/desktop/', 'Official WinForms and WPF guides.', 'أدلة WinForms و WPF الرسمية.'),
      r('Electron documentation', 'https://www.electronjs.org/docs/latest', 'Official docs and tutorial.', 'التوثيق الرسمي والدرس التعليمي.'),
    ],
    nextSteps: [
      { en: 'Build a small inventory or expenses program that saves to a database.', ar: 'ابنِ برنامجًا صغيرًا للمخزون أو المصروفات يحفظ في قاعدة بيانات.' },
      { en: 'The roadmap’s C#, OOP and SQL phases are the same skills desktop apps need.', ar: 'مراحل C# والبرمجة الكائنية و SQL في خارطة الطريق هي نفس مهارات تطبيقات سطح المكتب.' },
    ],
    siteFit: { en: 'Partly covered: desktop UI frameworks are not covered, but the C#, OOP and SQL phases are the core of .NET desktop apps.', ar: 'مغطّى جزئيًا: أطر واجهات سطح المكتب غير مغطاة، لكن مراحل C# والبرمجة الكائنية و SQL هي أساس تطبيقات سطح المكتب بـ .NET.' },
    links: { phases: ['csharp-fundamentals', 'object-oriented-programming'] },
  },
  {
    id: 'embedded', icon: 'cpu', category: 'systems', difficulty: 'Advanced',
    title: { en: 'Embedded systems & IoT', ar: 'الأنظمة المدمجة وإنترنت الأشياء' },
    summary: {
      en: 'Programming the small computers inside devices — cars, washing machines, sensors — and connecting them to the internet.',
      ar: 'برمجة الحواسيب الصغيرة داخل الأجهزة، مثل السيارات والغسالات والحساسات، وربطها بالإنترنت.',
    },
    examples: [
      { en: 'Smart home devices and sensors', ar: 'أجهزة المنزل الذكي والحساسات' },
      { en: 'Car control units and medical devices', ar: 'وحدات التحكم في السيارات والأجهزة الطبية' },
      { en: 'Factory machines that report their status', ar: 'آلات المصانع التي ترسل حالتها' },
    ],
    technologies: ['C', 'C++', 'Arduino', 'ESP32', 'Raspberry Pi', 'MicroPython', 'RTOS', 'MQTT'],
    startWith: [
      { name: 'C', why: { en: 'Microcontrollers have little memory, and C gives direct, predictable control of the hardware.', ar: 'المتحكمات الدقيقة ذاكرتها صغيرة، و C تمنح تحكمًا مباشرًا ومتوقعًا في العتاد.' } },
      { name: 'Arduino', why: { en: 'Cheap boards, simple tools and thousands of examples — you make an LED blink on day one.', ar: 'لوحات رخيصة وأدوات بسيطة وآلاف الأمثلة، فتُشعل مصباحًا صغيرًا من اليوم الأول.' } },
    ],
    skills: [
      { en: 'Basic electronics: voltage, current, sensors', ar: 'أساسيات الإلكترونيات: الجهد والتيار والحساسات' },
      { en: 'Memory and timing constraints', ar: 'قيود الذاكرة والتوقيت' },
      { en: 'Reading datasheets', ar: 'قراءة النشرات الفنية (Datasheets)' },
    ],
    prerequisites: { en: 'Programming basics, then C. An electronics or engineering background helps a lot.', ar: 'أساسيات البرمجة ثم لغة C. وخلفية في الإلكترونيات أو الهندسة تساعد كثيرًا.' },
    resources: [
      r('Arduino documentation', 'https://docs.arduino.cc', 'Official getting-started guides and examples.', 'أدلة البدء والأمثلة الرسمية.'),
      r('CS50x', 'https://cs50.harvard.edu/x/', 'Harvard’s free course; its C weeks build the right base.', 'دورة هارفارد المجانية، وأسابيع لغة C فيها تبني الأساس المناسب.'),
    ],
    nextSteps: [
      { en: 'Buy a starter kit and build a sensor that sends readings over Wi-Fi.', ar: 'اشترِ عدة بداية، وابنِ حساسًا يرسل قراءاته عبر الواي فاي.' },
    ],
    siteFit: { en: 'Not covered by this site’s roadmap. The fundamentals on this page still apply.', ar: 'غير مغطّى في خارطة الطريق على هذا الموقع، لكن الأساسيات في هذه الصفحة تنطبق عليه.' },
    links: {},
  },
];

export const FUNDAMENTALS: readonly Fundamental[] = [
  {
    id: 'logic', icon: 'target', group: 'thinking',
    title: { en: 'Programming logic & problem-solving', ar: 'المنطق البرمجي وحل المشكلات' },
    summary: { en: 'Breaking a problem into small, exact steps before writing any code.', ar: 'تقسيم المشكلة إلى خطوات صغيرة ودقيقة قبل كتابة أي شيفرة.' },
    why: { en: 'This is the real skill behind every language. Most beginner struggles are not syntax, they are not knowing the steps.', ar: 'هذه هي المهارة الحقيقية خلف كل لغة. أغلب ما يتعثر فيه المبتدئ ليس صياغة اللغة، بل عدم معرفة الخطوات.' },
    resources: [
      r('Exercism', 'https://exercism.org', 'Free practice problems with mentoring in many languages.', 'تمارين مجانية مع إرشاد في لغات كثيرة.'),
      r('Codewars', 'https://www.codewars.com', 'Short challenges ranked by difficulty.', 'تحديات قصيرة مرتبة حسب الصعوبة.'),
    ],
    links: { topics: ['pro-breaking-down-features'] },
  },
  {
    id: 'dsa', icon: 'branch', group: 'thinking',
    title: { en: 'Algorithms & data structures', ar: 'الخوارزميات وهياكل البيانات' },
    summary: { en: 'Standard ways to organise data (lists, dictionaries, trees) and step-by-step methods to search and sort it.', ar: 'طرق قياسية لتنظيم البيانات، مثل القوائم والقواميس والأشجار، وطرق خطوة بخطوة للبحث فيها وترتيبها.' },
    why: { en: 'Choosing the right structure makes code fast and simple, and these questions appear in many job interviews.', ar: 'اختيار الهيكل المناسب يجعل الشيفرة سريعة وبسيطة، وأسئلتها تظهر في كثير من المقابلات.' },
    resources: [
      r('VisuAlgo', 'https://visualgo.net/en', 'Animations of sorting, searching and data structures.', 'رسوم متحركة للترتيب والبحث وهياكل البيانات.'),
      r('Khan Academy: Algorithms', 'https://www.khanacademy.org/computing/computer-science/algorithms', 'A gentle, free introduction.', 'مقدمة مجانية سهلة.'),
      r('NeetCode', 'https://neetcode.io', 'Interview problems grouped by pattern.', 'مسائل المقابلات مجمّعة حسب النمط.'),
    ],
    links: { topics: ['cs-collections'] },
  },
  {
    id: 'variables', icon: 'database', group: 'code',
    title: { en: 'Variables, data types & operators', ar: 'المتغيرات وأنواع البيانات والعمليات' },
    summary: { en: 'Named boxes that hold values (numbers, text, true/false) and the operations you can do on them.', ar: 'صناديق لها أسماء تحفظ القيم (أرقام ونصوص وصح أو خطأ)، والعمليات التي تجريها عليها.' },
    why: { en: 'Every program stores and changes data; this is the first building block in every language.', ar: 'كل برنامج يحفظ البيانات ويغيّرها، وهذه أول لبنة في كل لغة.' },
    resources: [
      r('Microsoft Learn: C# first steps', 'https://learn.microsoft.com/en-us/training/paths/csharp-first-steps/', 'Interactive beginner lessons.', 'دروس تفاعلية للمبتدئين.'),
      r('Python tutorial', 'https://docs.python.org/3/tutorial/', 'The official, readable Python tutorial.', 'درس Python الرسمي السهل.'),
      r('Hsoub Wiki: Python', 'https://wiki.hsoub.com/Python', 'Python reference in Arabic.', 'مرجع Python بالعربية.', 'Arabic'),
    ],
    links: { topics: ['cs-variables-types', 'cs-operators'] },
  },
  {
    id: 'control', icon: 'repeat', group: 'code',
    title: { en: 'Conditions, loops & functions', ar: 'الشروط والحلقات والدوال' },
    summary: { en: 'Making decisions (if/else), repeating work (loops) and packaging steps into reusable functions.', ar: 'اتخاذ القرارات (if/else)، وتكرار العمل (الحلقات)، وتجميع الخطوات في دوال يُعاد استخدامها.' },
    why: { en: 'With variables, these are enough to write almost any small program.', ar: 'مع المتغيرات، تكفي هذه لكتابة أي برنامج صغير تقريبًا.' },
    resources: [
      r('W3Schools Python', 'https://www.w3schools.com/python/', 'Short examples you can edit and run.', 'أمثلة قصيرة تعدّلها وتشغلها.'),
      r('freeCodeCamp', 'https://www.freecodecamp.org/learn', 'Practise each idea with small exercises.', 'تدرّب على كل فكرة بتمارين صغيرة.'),
    ],
    links: { topics: ['cs-conditions', 'cs-loops', 'cs-methods'] },
  },
  {
    id: 'oop', icon: 'layers', group: 'code',
    title: { en: 'Object-oriented programming (OOP)', ar: 'البرمجة الكائنية (OOP)' },
    summary: { en: 'Organising code around objects that combine data and behaviour, such as a Customer or an Order.', ar: 'تنظيم الشيفرة حول كائنات تجمع البيانات والسلوك، مثل العميل أو الطلب.' },
    why: { en: 'Most business software (C#, Java, Kotlin, Swift) is written this way, and it keeps large code bases understandable.', ar: 'أغلب برمجيات الأعمال مكتوبة بهذه الطريقة (C# و Java و Kotlin و Swift)، وهي تحافظ على وضوح المشاريع الكبيرة.' },
    resources: [
      r('Refactoring.Guru', 'https://refactoring.guru/design-patterns', 'Clear illustrated explanations of design patterns.', 'شروح مصوّرة واضحة لأنماط التصميم.'),
      HSOUB('programming/general/', 'General Arabic programming articles, including OOP.', 'مقالات برمجة عامة بالعربية، منها البرمجة الكائنية.'),
    ],
    links: { phases: ['object-oriented-programming'] },
  },
  {
    id: 'git', icon: 'branch', group: 'tools',
    title: { en: 'Git & GitHub', ar: 'Git و GitHub' },
    summary: { en: 'Git records every change to your code; GitHub stores it online so you can share and work in teams.', ar: 'يسجّل Git كل تغيير في شيفرتك، ويحفظها GitHub على الإنترنت لتشاركها وتعمل ضمن فريق.' },
    why: { en: 'Every company uses version control, and your GitHub profile is your portfolio.', ar: 'كل الشركات تستخدم إدارة الإصدارات، وحسابك على GitHub هو معرض أعمالك.' },
    resources: [
      r('Pro Git book', 'https://git-scm.com/book/en/v2', 'The free official Git book (also translated).', 'كتاب Git الرسمي المجاني، ومترجم للغات عدة.'),
      r('Atlassian Git tutorials', 'https://www.atlassian.com/git/tutorials', 'Illustrated guides from basics to branching.', 'أدلة مصوّرة من الأساسيات حتى الفروع.'),
      r('GitHub Docs: Get started', 'https://docs.github.com/en/get-started', 'Official GitHub guide.', 'دليل GitHub الرسمي.'),
    ],
    links: { phases: ['git-github'] },
  },
  {
    id: 'debugging', icon: 'bug', group: 'tools',
    title: { en: 'Debugging & error handling', ar: 'تتبّع الأخطاء ومعالجتها' },
    summary: { en: 'Finding why code misbehaves (reading errors, breakpoints, stepping through) and handling failures gracefully.', ar: 'معرفة سبب الخلل في الشيفرة (قراءة الأخطاء ونقاط التوقف والتنفيذ خطوة بخطوة)، والتعامل مع الفشل بهدوء.' },
    why: { en: 'Developers spend a large part of their day debugging. Reading an error message calmly is a superpower.', ar: 'يقضي المطورون جزءًا كبيرًا من يومهم في تتبع الأخطاء، وقراءة رسالة الخطأ بهدوء مهارة ثمينة.' },
    resources: [
      r('Visual Studio debugger tour', 'https://learn.microsoft.com/en-us/visualstudio/debugger/debugger-feature-tour', 'Breakpoints, stepping and watches.', 'نقاط التوقف والتنفيذ خطوة بخطوة ومراقبة القيم.'),
      r('Chrome DevTools', 'https://developer.chrome.com/docs/devtools', 'Debugging web pages in the browser.', 'تتبع أخطاء صفحات الويب في المتصفح.'),
    ],
    links: { topics: ['pro-debugging', 'cs-exceptions'] },
  },
  {
    id: 'sql', icon: 'database', group: 'tools',
    title: { en: 'Databases & SQL fundamentals', ar: 'أساسيات قواعد البيانات و SQL' },
    summary: { en: 'Storing data in tables and asking questions of it with SQL: select, filter, join and summarise.', ar: 'حفظ البيانات في جداول وسؤالها باستخدام SQL: الاختيار والتصفية والربط والتلخيص.' },
    why: { en: 'Nearly every app keeps data, and SQL is useful in web, mobile, data and backend jobs alike.', ar: 'كل تطبيق تقريبًا يحفظ بيانات، و SQL مفيدة في وظائف الويب والموبايل والبيانات والخلفية على حد سواء.' },
    resources: [
      r('W3Schools SQL', 'https://www.w3schools.com/sql/', 'Try every statement in the browser.', 'جرّب كل جملة في المتصفح.'),
      HSOUB('programming/sql/', 'Arabic SQL articles.', 'مقالات SQL بالعربية.'),
    ],
    links: { topics: ['db-relational-basics', 'sql-select-basics'] },
  },
  {
    id: 'http', icon: 'globe', group: 'tools',
    title: { en: 'APIs & HTTP basics', ar: 'أساسيات الواجهات البرمجية و HTTP' },
    summary: { en: 'How programs talk over the internet: requests, responses, methods (GET, POST) and status codes.', ar: 'كيف تتواصل البرامج عبر الإنترنت: الطلبات والردود والطرق مثل GET و POST ورموز الحالة.' },
    why: { en: 'Frontend, mobile and backend developers all build or call APIs every day.', ar: 'مطورو الواجهات والموبايل والخلفية جميعهم يبنون الواجهات البرمجية أو يستدعونها يوميًا.' },
    resources: [
      r('MDN: HTTP overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', 'A clear introduction to HTTP.', 'مقدمة واضحة عن HTTP.'),
      r('MDN: API (glossary)', 'https://developer.mozilla.org/en-US/docs/Glossary/API', 'What an API is, in one page.', 'ما هي الواجهة البرمجية في صفحة واحدة.'),
    ],
    links: { topics: ['api-http-rest', 'api-status-codes'] },
  },
  {
    id: 'cli', icon: 'terminal', group: 'tools',
    title: { en: 'Command-line fundamentals', ar: 'أساسيات سطر الأوامر' },
    summary: { en: 'Using the terminal to move between folders, run programs and use developer tools by typing commands.', ar: 'استخدام الطرفية للتنقل بين المجلدات وتشغيل البرامج واستخدام أدوات المطورين بكتابة الأوامر.' },
    why: { en: 'Git, package managers, build tools and servers are all used from the command line.', ar: 'Git ومديرو الحزم وأدوات البناء والخوادم كلها تُستخدم من سطر الأوامر.' },
    resources: [
      r('Ubuntu: Command line for beginners', 'https://ubuntu.com/tutorials/command-line-for-beginners', 'A short official tutorial.', 'درس رسمي قصير.'),
      r('MDN: Command line crash course', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line', 'The terminal for web developers.', 'الطرفية لمطوري الويب.'),
    ],
    links: {},
  },
  {
    id: 'cs', icon: 'cpu', group: 'thinking',
    title: { en: 'Computer science fundamentals', ar: 'أساسيات علوم الحاسوب' },
    summary: { en: 'How computers work underneath: binary, memory, the processor, operating systems and how code becomes instructions.', ar: 'كيف يعمل الحاسوب من الداخل: النظام الثنائي والذاكرة والمعالج وأنظمة التشغيل، وكيف تتحول الشيفرة إلى تعليمات.' },
    why: { en: 'It explains why programs are slow, why memory runs out, and makes every later topic easier.', ar: 'يفسّر لماذا تبطؤ البرامج ولماذا تنفد الذاكرة، ويجعل كل موضوع لاحق أسهل.' },
    resources: [
      r('CS50x (Harvard)', 'https://cs50.harvard.edu/x/', 'The most popular free intro to computer science.', 'أشهر مقدمة مجانية لعلوم الحاسوب.'),
      r('ComputerScience.org', 'https://www.computerscience.org', 'Guides to degrees and careers in computing.', 'أدلة عن الدراسة والمهن في الحوسبة.'),
    ],
    links: { topics: ['cs-value-reference-types'] },
  },
  {
    id: 'cleancode', icon: 'sparkle', group: 'work',
    title: { en: 'Clean code & best practices', ar: 'الشيفرة النظيفة وأفضل الممارسات' },
    summary: { en: 'Writing code that people can read and change: clear names, small functions, no duplication.', ar: 'كتابة شيفرة يستطيع الآخرون قراءتها وتعديلها: أسماء واضحة ودوال صغيرة ودون تكرار.' },
    why: { en: 'Code is read far more often than it is written — by teammates and by you, months later.', ar: 'الشيفرة تُقرأ أكثر بكثير مما تُكتب، يقرؤها زملاؤك وتقرؤها أنت بعد شهور.' },
    resources: [
      r('Refactoring.Guru', 'https://refactoring.guru/design-patterns', 'Refactoring and design patterns explained with pictures.', 'إعادة الهيكلة وأنماط التصميم بشرح مصوّر.'),
    ],
    links: { topics: ['pro-refactoring', 'oop-solid'] },
  },
  {
    id: 'workflow', icon: 'route', group: 'work',
    title: { en: 'Software development workflows', ar: 'سير عمل تطوير البرمجيات' },
    summary: { en: 'How teams build software: requirements, tasks, Agile and Scrum, code review, testing and releases.', ar: 'كيف تبني الفرق البرمجيات: المتطلبات والمهام و Agile و Scrum ومراجعة الشيفرة والاختبار والإصدار.' },
    why: { en: 'Jobs are teamwork. Knowing the process makes your first months at a company much smoother.', ar: 'العمل في الشركات عمل جماعي، ومعرفة طريقة العمل تجعل شهورك الأولى أسهل بكثير.' },
    resources: [
      r('Atlassian: Agile', 'https://www.atlassian.com/agile', 'Agile and Scrum explained by a tool maker teams use.', 'شرح Agile و Scrum من شركة تصنع أدوات تستخدمها الفرق.'),
    ],
    links: { topics: ['pro-agile-scrum', 'pro-code-review'] },
  },
  {
    id: 'networking', icon: 'wifi', group: 'thinking',
    title: { en: 'Basic networking concepts', ar: 'أساسيات الشبكات' },
    summary: { en: 'How devices find and talk to each other: IP addresses, DNS, ports, TCP and what happens when you open a website.', ar: 'كيف تجد الأجهزة بعضها وتتواصل: عناوين IP ونظام DNS والمنافذ و TCP، وماذا يحدث عند فتح موقع.' },
    why: { en: 'Web apps, APIs, cloud and security all sit on top of the network.', ar: 'تطبيقات الويب والواجهات البرمجية والسحابة والأمن كلها مبنية فوق الشبكة.' },
    resources: [
      r('MDN: How does the Internet work?', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work', 'A short, clear article.', 'مقال قصير وواضح.'),
    ],
    links: {},
  },
  {
    id: 'english', icon: 'chat', group: 'work',
    title: { en: 'English for developers', ar: 'اللغة الإنجليزية للمطورين' },
    summary: { en: 'Reading documentation, error messages and questions online, and writing clear commit messages and emails.', ar: 'قراءة التوثيق ورسائل الأخطاء والأسئلة على الإنترنت، وكتابة رسائل commit والبريد بوضوح.' },
    why: { en: 'Most documentation, tools and answers are in English first. You do not need to be fluent — reading well is enough to start.', ar: 'أغلب التوثيق والأدوات والإجابات بالإنجليزية أولًا. لا تحتاج إلى الطلاقة، فالقراءة الجيدة تكفي للبداية.' },
    resources: [
      r('dev.to', 'https://dev.to', 'Short developer articles — good daily reading practice.', 'مقالات قصيرة للمطورين، وتدريب يومي جيد على القراءة.'),
    ],
    links: {},
  },
  {
    id: 'docs', icon: 'book', group: 'work',
    title: { en: 'Reading technical documentation', ar: 'قراءة التوثيق التقني' },
    summary: { en: 'Finding answers in official docs: getting-started guides, API references and examples.', ar: 'إيجاد الإجابات في التوثيق الرسمي: أدلة البدء ومراجع الواجهات البرمجية والأمثلة.' },
    why: { en: 'Tutorials get old; the official docs are always current. Strong developers check the docs first.', ar: 'الدروس تقدم مع الوقت، أما التوثيق الرسمي فمحدّث دائمًا. والمطورون الأقوياء يرجعون إليه أولًا.' },
    resources: [
      r('Microsoft Learn', 'https://learn.microsoft.com/en-us/training/', 'Example of excellent official docs and training.', 'مثال على توثيق وتدريب رسمي ممتاز.'),
      r('Hsoub Wiki', 'https://wiki.hsoub.com', 'Arabic documentation for many languages.', 'توثيق عربي للغات كثيرة.', 'Arabic'),
    ],
    links: { topics: ['pro-reading-codebases'] },
  },
  {
    id: 'learning', icon: 'flame', group: 'work',
    title: { en: 'Effective learning & practical projects', ar: 'التعلم الفعّال والمشاريع العملية' },
    summary: { en: 'Learning by building: short daily practice, small projects, and not getting stuck watching tutorials.', ar: 'التعلم بالبناء: تدرّب يومي قصير ومشاريع صغيرة، ودون الوقوع في فخ مشاهدة الدروس فقط.' },
    why: { en: 'Watching is not learning. You learn when you build, get stuck and fix it — and projects are what employers look at.', ar: 'المشاهدة ليست تعلمًا. أنت تتعلم حين تبني وتتعثر وتصلح، والمشاريع هي ما ينظر إليه أصحاب العمل.' },
    resources: [
      r('Learning How to Learn (Coursera)', 'https://www.coursera.org/learn/learning-how-to-learn', 'A famous free course on how memory and practice work.', 'دورة مجانية شهيرة عن طريقة عمل الذاكرة والتدرّب.'),
      r('Elzero Web School', 'https://elzero.org', 'Popular Arabic courses for beginners.', 'دورات عربية مشهورة للمبتدئين.', 'Arabic'),
    ],
    links: {},
  },
];

/** Order of the journey steps at the top of the page. */
export const JOURNEY = ['intro', 'fields', 'fundamentals', 'next'] as const;
export type JourneyStep = (typeof JOURNEY)[number];
