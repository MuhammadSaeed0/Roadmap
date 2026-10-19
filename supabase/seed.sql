-- ============================================================================
-- DevPath content seed, generated from the local SQL Server database on 2026-10-19.
-- Content only: no user progress. Run schema.sql first.
-- Safe to re-run: every insert uses ON CONFLICT DO NOTHING, and the id
-- sequences are advanced at the end.
-- ============================================================================

insert into public.phases (id, slug, sort_order, title_en, title_ar, description_en, description_ar) values
  (1, 'csharp-fundamentals', 1, 'C# Fundamentals', 'أساسيات C#', 'The building blocks of every .NET program: types, control flow, methods, collections and error handling.', 'اللبنات الأساسية لأي برنامج .NET: الأنواع، والتحكم في التدفق، والدوال، والمجموعات، ومعالجة الأخطاء.'),
  (2, 'object-oriented-programming', 2, 'Object-Oriented Programming', 'البرمجة كائنية التوجه', 'Model real business concepts as classes and objects, and design code that is easy to change.', 'تمثيل مفاهيم العمل الحقيقية كـ Classes وكائنات، وتصميم كود يسهل تغييره.'),
  (3, 'modern-csharp', 3, 'Modern C#', 'C# الحديثة', 'The features you''ll see in every current .NET codebase: nullable references, records, pattern matching, LINQ and async/await.', 'الميزات التي ستراها في كل قاعدة كود .NET حديثة: Nullable references وRecords وPattern matching وLINQ وasync/await.'),
  (4, 'aspnet-core', 4, 'ASP.NET Core Web API', 'ASP.NET Core Web API', 'Build REST APIs: routing, dependency injection, configuration, validation, error handling, security and query features.', 'بناء واجهات REST: التوجيه، وحقن الاعتماديات، والإعدادات، والتحقق، ومعالجة الأخطاء، والأمان، وميزات الاستعلام.'),
  (5, 'ef-core', 5, 'Entity Framework Core', 'Entity Framework Core', 'Map C# classes to SQL Server tables, query with LINQ, manage schema with migrations and keep queries fast.', 'ربط أصناف C# بجداول SQL Server، والاستعلام بـ LINQ، وإدارة المخطط بالـ Migrations، والحفاظ على سرعة الاستعلامات.'),
  (6, 'sql-server-for-dotnet', 6, 'SQL Server for .NET Developers', 'SQL Server لمطوري .NET', 'No beginner SQL here. Connect what you already know to application code: performance, transactions, concurrency, security and data-access design. Mark topics you already know to personalise your roadmap.', 'لا يوجد SQL للمبتدئين هنا. اربط ما تعرفه بالفعل بكود التطبيقات: الأداء، والمعاملات، والتزامن، والأمان، وتصميم الوصول إلى البيانات. علّم المواضيع التي تعرفها لتخصيص خارطة طريقك.'),
  (7, 'typescript', 7, 'TypeScript', 'TypeScript', 'JavaScript with types — the language of Angular. Many concepts will feel familiar after C#.', 'JavaScript مع الأنواع، وهي لغة Angular، وستبدو لك مفاهيم كثيرة مألوفة بعد C#.'),
  (8, 'angular', 8, 'Angular', 'Angular', 'Build modern single-page applications with standalone components, signals, routing, reactive forms and HttpClient.', 'بناء تطبيقات الصفحة الواحدة الحديثة باستخدام المكونات المستقلة والـ Signals والتوجيه والنماذج التفاعلية وHttpClient.'),
  (9, 'full-stack-integration', 9, 'Angular + ASP.NET Core Integration', 'دمج Angular مع ASP.NET Core', 'Connect the frontend to the real API: contracts, CORS, CRUD flows, validation, errors, paging and concurrent updates.', 'ربط الواجهة بالـ API الحقيقي: العقود، وCORS، وتدفقات CRUD، والتحقق، والأخطاء، والتقسيم إلى صفحات، والتحديثات المتزامنة.'),
  (10, 'testing', 10, 'Testing', 'الاختبار', 'Write tests that catch real bugs: unit tests for business logic, API and integration tests, and Angular component and service tests.', 'اكتب اختبارات تكتشف الأخطاء الحقيقية: اختبارات الوحدة لمنطق العمل، واختبارات الـ API والتكامل، واختبارات مكونات Angular وخدماتها.'),
  (11, 'git-github', 11, 'Git and GitHub', 'Git وGitHub', 'Version control as teams use it: branches, merges, conflicts, pull requests and a portfolio that makes a good first impression.', 'إدارة الإصدارات كما تستخدمها الفرق: الفروع، والدمج، والتعارضات، وطلبات الدمج، ومعرض أعمال يترك انطباعًا أولًا جيدًا.'),
  (12, 'professional-skills', 12, 'Professional Development Skills', 'مهارات التطوير الاحترافي', 'The skills that make you effective in a real team: reading code, debugging, planning, reviewing, securing, diagnosing and shipping.', 'المهارات التي تجعلك فعالًا في فريق حقيقي: قراءة الكود، والتصحيح، والتخطيط، والمراجعة، والتأمين، والتشخيص، والتسليم.'),
  (13, 'full-stack-projects', 13, 'Full-Stack Projects', 'مشاريع Full-Stack', 'Apply everything in four progressively larger projects. Each project links back to the roadmap topics its tasks need.', 'طبّق كل ما تعلمته في أربعة مشاريع متدرجة الحجم، ويرتبط كل مشروع بمواضيع خارطة الطريق التي تحتاجها مهامه.')
on conflict do nothing;

insert into public.topics (id, slug, phase_id, sort_order, skill, priority, estimated_minutes, title_en, title_ar, summary_en, summary_ar, why_en, why_ar, how_en, how_ar, example_en, example_ar, code_sample, code_language, practice_task_en, practice_task_ar, challenge_en, challenge_ar) values
  (1, 'cs-project-structure', 1, 1, 'CSharp', 'Core', 30, 'Project structure and the dotnet CLI', 'هيكل المشروع وأداة dotnet CLI', 'A .NET application is a project (.csproj) containing C# files, usually grouped in a solution (.sln/.slnx). The dotnet CLI creates, builds, runs and tests projects.', 'تطبيق .NET هو مشروع (.csproj) يحتوي على ملفات C#، وعادةً ما تُجمَّع المشاريع داخل Solution (.sln/.slnx). أداة dotnet CLI تُنشئ المشاريع وتبنيها وتشغّلها وتختبرها.', 'Every codebase you join starts here. Knowing what Program.cs, the .csproj, bin/ and obj/ are lets you open an unfamiliar repository and run it within minutes.', 'كل قاعدة كود ستنضم إليها تبدأ من هنا. معرفة دور Program.cs وملف .csproj ومجلدي bin/ وobj/ تمكّنك من فتح أي مستودع جديد وتشغيله خلال دقائق.', 'The .csproj declares the target framework (e.g. net10.0) and NuGet package references. ''dotnet build'' compiles to bin/, ''dotnet run'' builds and starts the app, and top-level statements in Program.cs are the entry point.', 'يحدد ملف .csproj إطار العمل المستهدف (مثل net10.0) ومراجع حزم NuGet. الأمر dotnet build يترجم الكود إلى bin/، والأمر dotnet run يبني التطبيق ويشغّله، وتعليمات المستوى الأعلى (top-level statements) في Program.cs هي نقطة البداية.', 'Like a SQL Server database project groups scripts, a solution groups an API project, a class library and a test project that references both.', 'كما يجمع مشروع قاعدة بيانات SQL Server السكربتات معًا، تجمع الـ Solution مشروع API ومكتبة Class Library ومشروع اختبارات يشير إليهما.', '# Create a solution with an app and a library, then wire them together
dotnet new sln -n Inventory
dotnet new console -n Inventory.App
dotnet new classlib -n Inventory.Core
dotnet sln add Inventory.App Inventory.Core
dotnet add Inventory.App reference Inventory.Core

dotnet build              # compiles everything into bin/
dotnet run --project Inventory.App', 'bash', 'Create a console app with ''dotnet new console -n Hello'', run it, then open the .csproj and identify the target framework.', 'أنشئ تطبيق Console بالأمر dotnet new console -n Hello، وشغّله، ثم افتح ملف .csproj وحدد إطار العمل المستهدف.', 'Create a solution with a console app and a class library. Move a method into the library, add a project reference and call it from the console app.', 'أنشئ Solution تحتوي على تطبيق Console ومكتبة Class Library. انقل دالة إلى المكتبة، وأضف Project Reference، واستدعها من تطبيق Console.'),
  (2, 'cs-variables-types', 1, 2, 'CSharp', 'Core', 40, 'Variables and types', 'المتغيرات والأنواع', 'C# is statically typed: every variable has a type known at compile time, such as int, decimal, string, bool or DateTime. ''var'' lets the compiler infer it.', 'لغة C# ثابتة الأنواع: لكل متغير نوع معروف وقت الترجمة مثل int وdecimal وstring وbool وDateTime. وتسمح الكلمة var للمترجم باستنتاج النوع.', 'Choosing the right type prevents whole classes of bugs — for example using decimal, not double, for money, exactly like you''d pick DECIMAL over FLOAT in SQL Server.', 'اختيار النوع الصحيح يمنع فئات كاملة من الأخطاء، مثل استخدام decimal بدلًا من double للمبالغ المالية، تمامًا كما تختار DECIMAL بدلًا من FLOAT في SQL Server.', 'Declare with a type or var and assign a value. Conversions between types are explicit when data could be lost (casts, int.Parse, Convert). Constants use ''const''.', 'تُعرَّف المتغيرات بنوع محدد أو بـ var مع إسناد قيمة. التحويل بين الأنواع يكون صريحًا عند احتمال فقدان البيانات (Casting أو int.Parse أو Convert). والثوابت تُعرَّف بـ const.', 'An order line stores Quantity as int, UnitPrice as decimal and CreatedAt as DateTime — the same choices you''d make for the matching table columns.', 'سطر الطلب يخزّن الكمية Quantity كـ int، وسعر الوحدة UnitPrice كـ decimal، وتاريخ الإنشاء CreatedAt كـ DateTime، وهي نفس اختياراتك لأعمدة الجدول المقابل.', 'string productName = "Keyboard";
decimal unitPrice = 49.99m;      // decimal for money (like DECIMAL(18,2))
int stock = 120;
bool isActive = true;
DateTime createdAt = DateTime.UtcNow;
var sku = "KB-001";              // compiler infers string

Console.WriteLine($"{productName} ({sku}): {unitPrice:C} — {stock} in stock");

// Safe conversion from text
if (int.TryParse("42", out var quantity))
    Console.WriteLine(quantity * unitPrice);', 'csharp', 'Declare variables for a product (name, price, stock, isActive) and print a formatted line using string interpolation.', 'عرّف متغيرات لمنتج (الاسم، السعر، المخزون، isActive) واطبع سطرًا منسقًا باستخدام String Interpolation.', 'Read two numbers from the console with int.TryParse and print their sum, handling invalid input without crashing.', 'اقرأ رقمين من Console باستخدام int.TryParse واطبع مجموعهما، مع التعامل مع المدخلات غير الصحيحة دون توقف البرنامج.'),
  (3, 'cs-operators', 1, 3, 'CSharp', 'Important', 25, 'Operators and expressions', 'العوامل والتعابير', 'Operators combine values: arithmetic (+ - * / %), comparison (== != < >), logical (&& || !), and null-related operators (?? and ?.).', 'العوامل تجمع القيم: الحسابية (+ - * / %)، والمقارنة (== != < >)، والمنطقية (&& || !)، والعوامل الخاصة بـ null مثل ?? و?.', 'Expressions are everywhere in business rules. Mistakes like integer division (7 / 2 == 3) or missing null checks are common sources of bugs.', 'التعابير موجودة في كل قواعد العمل. وأخطاء مثل القسمة الصحيحة (7 / 2 == 3) أو نسيان التحقق من null من أكثر مصادر الأخطاء شيوعًا.', '&& and || short-circuit, so the right side runs only if needed. ''a ?? b'' returns b when a is null — like ISNULL/COALESCE. ''x?.Name'' returns null instead of throwing when x is null.', 'العاملان && و|| يتوقفان مبكرًا (Short-circuit) فلا يُنفَّذ الطرف الأيمن إلا عند الحاجة. التعبير a ?? b يُرجع b إذا كانت a تساوي null، مثل ISNULL/COALESCE. والتعبير x?.Name يُرجع null بدلًا من رمي استثناء عندما تكون x تساوي null.', 'discount = customer?.IsVip == true ? total * 0.1m : 0m; safely calculates a discount even when customer is null.', 'التعبير discount = customer?.IsVip == true ? total * 0.1m : 0m; يحسب الخصم بأمان حتى لو كان customer يساوي null.', 'int a = 7, b = 2;
Console.WriteLine(a / b);          // 3   (integer division)
Console.WriteLine(a / (double)b);  // 3.5
Console.WriteLine(a % b);          // 1   (remainder)

string? nickname = null;
string display = nickname ?? "Guest";      // like COALESCE(nickname, ''Guest'')
int? length = nickname?.Length;            // null instead of NullReferenceException

bool lowStock = stock < 10 && isActive;    // right side only runs if needed', 'csharp', 'Write expressions that compute a VAT amount, check if stock is low (below 10) and default a missing nickname to the full name.', 'اكتب تعابير تحسب قيمة ضريبة القيمة المضافة، وتتحقق مما إذا كان المخزون منخفضًا (أقل من 10)، وتستخدم الاسم الكامل عند غياب الاسم المستعار.', 'Explain why 7 / 2 returns 3 and fix it to return 3.5 in two different ways.', 'اشرح لماذا يُرجع 7 / 2 القيمة 3، ثم عدّله ليُرجع 3.5 بطريقتين مختلفتين.'),
  (4, 'cs-conditions', 1, 4, 'CSharp', 'Core', 30, 'Conditions: if and switch', 'الشروط: if وswitch', 'if/else and switch choose which code runs. Modern switch expressions return a value and read like a lookup table.', 'تحدد if/else وswitch الكود الذي سيُنفَّذ. وتعابير switch الحديثة تُرجع قيمة وتُقرأ مثل جدول بحث.', 'Business rules — order status transitions, pricing tiers, validation — are mostly conditions. Clear conditions make rules easy to review.', 'قواعد العمل مثل تغيّر حالة الطلب وشرائح الأسعار والتحقق من البيانات هي في الغالب شروط. والشروط الواضحة تجعل مراجعة القواعد سهلة.', 'Use if for one or two branches, a switch expression to map a value to a result, and guard clauses (early return) to avoid deep nesting. It''s the C# counterpart of CASE WHEN.', 'استخدم if لفرع أو فرعين، وتعبير switch لتحويل قيمة إلى نتيجة، وعبارات الحماية (Guard clauses) بالعودة المبكرة لتجنب التداخل العميق. إنه المقابل في C# لـ CASE WHEN.', 'A shipping fee switch: Express => 50, Standard => 20, Pickup => 0, with a default branch that throws for unknown methods.', 'تعبير switch لرسوم الشحن: Express => 50، وStandard => 20، وPickup => 0، مع فرع افتراضي يرمي استثناءً للطرق غير المعروفة.', 'decimal ShippingFee(string method) => method switch
{
    "Express"  => 50m,
    "Standard" => 20m,
    "Pickup"   => 0m,
    _ => throw new ArgumentException($"Unknown method: {method}")
};

string Grade(int score) => score switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    _     => "F"
};

// Guard clause instead of deep nesting
void Ship(Order? order)
{
    if (order is null) return;
    if (!order.IsPaid) throw new InvalidOperationException("Order is not paid.");
    // ... ship it
}', 'csharp', 'Write a method that returns a grade letter (A–F) from a score using a switch expression with relational patterns.', 'اكتب دالة تُرجع حرف التقدير (A–F) من الدرجة باستخدام تعبير switch مع أنماط المقارنة (Relational patterns).', 'Refactor a nested if/else pyramid of 4 levels into guard clauses and compare readability.', 'أعد هيكلة سلسلة if/else متداخلة بأربعة مستويات إلى Guard clauses وقارن سهولة القراءة.'),
  (5, 'cs-loops', 1, 5, 'CSharp', 'Core', 30, 'Loops', 'الحلقات التكرارية', 'for, foreach, while and do-while repeat code. foreach is the most common: it walks through every item of a collection.', 'تكرر الحلقات for وforeach وwhile وdo-while تنفيذ الكود. وforeach هي الأكثر استخدامًا: تمر على كل عنصر في المجموعة.', 'Processing lists of records is daily work. In SQL you think in sets; in C# you often loop — knowing when to loop and when to use LINQ is an important skill.', 'معالجة قوائم السجلات عمل يومي. في SQL تفكر بالمجموعات (Sets)، أما في C# فغالبًا ما تستخدم الحلقات، ومعرفة متى تستخدم الحلقة ومتى تستخدم LINQ مهارة مهمة.', 'foreach (var item in items) runs once per item. ''break'' exits the loop and ''continue'' skips to the next item. You can''t add or remove items from a list while iterating it with foreach.', 'الحلقة foreach (var item in items) تُنفَّذ مرة لكل عنصر. تخرج break من الحلقة، وتنتقل continue إلى العنصر التالي. لا يمكنك إضافة عناصر أو حذفها من القائمة أثناء المرور عليها بـ foreach.', 'Loop over order lines to sum the total, skipping cancelled lines with ''continue''.', 'المرور على أسطر الطلب لحساب الإجمالي، مع تخطي الأسطر الملغاة باستخدام continue.', 'decimal total = 0;
foreach (var line in order.Lines)
{
    if (line.IsCancelled) continue;   // skip this line
    total += line.Quantity * line.UnitPrice;
}

for (int i = 1; i <= 3; i++)
    Console.WriteLine($"Attempt {i}");

// Removing while iterating: loop backwards (or use RemoveAll)
for (int i = products.Count - 1; i >= 0; i--)
    if (products[i].Stock == 0) products.RemoveAt(i);', 'csharp', 'Print the numbers 1–100, replacing multiples of 3 with ''Fizz'', of 5 with ''Buzz'' and of both with ''FizzBuzz''.', 'اطبع الأرقام من 1 إلى 100، مع استبدال مضاعفات 3 بكلمة Fizz، ومضاعفات 5 بكلمة Buzz، ومضاعفاتهما معًا بكلمة FizzBuzz.', 'Remove all out-of-stock products from a List<Product> without getting an InvalidOperationException. Find two solutions.', 'احذف جميع المنتجات غير المتوفرة من List<Product> دون الحصول على InvalidOperationException. ابحث عن حلّين.'),
  (6, 'cs-methods', 1, 6, 'CSharp', 'Core', 40, 'Methods', 'الدوال (Methods)', 'A method is a named block of code with parameters and an optional return value. Methods keep code reusable and testable.', 'الدالة (Method) هي كتلة كود لها اسم ومعاملات (Parameters) وقيمة مُرجعة اختيارية. تجعل الدوال الكود قابلًا لإعادة الاستخدام والاختبار.', 'Small, well-named methods are the first step to readable code. They''re the C# equivalent of breaking a 2,000-line stored procedure into focused procedures and functions.', 'الدوال الصغيرة ذات الأسماء الواضحة هي الخطوة الأولى نحو كود مقروء. وهي ما يقابل تقسيم Stored Procedure من 2000 سطر إلى إجراءات ودوال مركّزة.', 'Declare return type, name and parameters. Parameters can have default values, be passed by name, or use ''out'' for extra results (as in TryParse). Expression-bodied methods use =>.', 'عرّف نوع القيمة المُرجعة والاسم والمعاملات. يمكن أن تكون للمعاملات قيم افتراضية، أو تُمرَّر بالاسم، أو تستخدم out لإرجاع نتائج إضافية (كما في TryParse). والدوال المختصرة تستخدم =>.', 'CalculateTotal(lines, taxRate: 0.14m) returns a decimal; IsValidEmail(text) returns a bool and is easy to unit-test.', 'الدالة CalculateTotal(lines, taxRate: 0.14m) تُرجع decimal، والدالة IsValidEmail(text) تُرجع bool ويسهل اختبارها.', 'static decimal CalculateSubtotal(IEnumerable<OrderLine> lines)
{
    decimal subtotal = 0;
    foreach (var line in lines) subtotal += line.Quantity * line.UnitPrice;
    return subtotal;
}

static decimal CalculateTotal(IEnumerable<OrderLine> lines, decimal taxRate = 0.14m)
{
    var subtotal = CalculateSubtotal(lines);
    return subtotal + subtotal * taxRate;
}

static bool IsAdult(int age) => age >= 18;   // expression-bodied

var total = CalculateTotal(lines, taxRate: 0.10m);   // named argument', 'csharp', 'Write methods CalculateSubtotal, CalculateTax and CalculateTotal, where the last one calls the other two.', 'اكتب الدوال CalculateSubtotal وCalculateTax وCalculateTotal، بحيث تستدعي الأخيرة الدالتين الأخريين.', 'Write a TryParseDiscountCode(string code, out decimal percent) method following the TryParse pattern.', 'اكتب دالة TryParseDiscountCode(string code, out decimal percent) باتباع نمط TryParse.'),
  (7, 'cs-collections', 1, 7, 'CSharp', 'Core', 45, 'Collections: arrays, List, Dictionary, HashSet', 'المجموعات: Array وList وDictionary وHashSet', 'Collections hold many values. List<T> is a growable list, Dictionary<TKey,TValue> maps keys to values, and HashSet<T> stores unique values with fast lookups.', 'المجموعات تحمل قيمًا متعددة. List<T> قائمة قابلة للتوسع، وDictionary<TKey,TValue> تربط المفاتيح بالقيم، وHashSet<T> تخزن قيمًا فريدة مع بحث سريع.', 'Picking the right collection is like picking the right index: a Dictionary lookup is O(1), while searching a List is O(n). It matters when you process thousands of rows.', 'اختيار المجموعة المناسبة يشبه اختيار الفهرس المناسب: البحث في Dictionary يتم في O(1) بينما البحث في List يتم في O(n). وهذا مهم عند معالجة آلاف السجلات.', 'Use List<T> for ordered data, Dictionary when you look things up by key (like a primary key), and HashSet to check membership or remove duplicates. Arrays have a fixed size.', 'استخدم List<T> للبيانات المرتبة، وDictionary عند البحث بالمفتاح (مثل Primary Key)، وHashSet للتحقق من وجود عنصر أو إزالة التكرار. أما المصفوفات (Arrays) فحجمها ثابت.', 'Load products into a Dictionary<int, Product> keyed by Id so that each order line can find its product instantly.', 'حمّل المنتجات في Dictionary<int, Product> مفتاحه Id حتى يجد كل سطر طلب منتجه فورًا.', 'var names = new List<string> { "Sara", "Omar" };
names.Add("Lina");

// Dictionary: O(1) lookup by key — like seeking a primary key
var productsById = new Dictionary<int, Product>();
foreach (var p in products) productsById[p.Id] = p;

if (productsById.TryGetValue(lineProductId, out var product))
    Console.WriteLine(product.Name);

// HashSet: unique values and set operations
var a = new HashSet<string> { "x@a.com", "y@a.com" };
var b = new HashSet<string> { "y@a.com", "z@a.com" };
a.IntersectWith(b);   // a = { "y@a.com" }  — like INTERSECT', 'csharp', 'Count how many times each word appears in a sentence using a Dictionary<string, int>.', 'احسب عدد مرات ظهور كل كلمة في جملة باستخدام Dictionary<string, int>.', 'Given two lists of customer emails, find who is in both, who is only in the first, and the union — using HashSet operations.', 'لديك قائمتان ببريد العملاء الإلكتروني: أوجد الموجودين في القائمتين، والموجودين في الأولى فقط، والاتحاد بينهما باستخدام عمليات HashSet.'),
  (8, 'cs-exceptions', 1, 8, 'CSharp', 'Core', 40, 'Exception handling', 'معالجة الاستثناءات', 'Exceptions signal that something went wrong. try/catch handles them, finally always runs, and ''throw'' raises a new exception.', 'الاستثناءات (Exceptions) تشير إلى حدوث خطأ. تتعامل معها try/catch، وتُنفَّذ finally دائمًا، وتُستخدم throw لرمي استثناء جديد.', 'Good error handling is what separates a demo from production code. Swallowing exceptions hides bugs; catching too broadly makes them hard to diagnose.', 'المعالجة الجيدة للأخطاء هي ما يميز الكود الإنتاجي عن العرض التجريبي. ابتلاع الاستثناءات يخفي الأخطاء، والتقاطها بشكل واسع جدًا يصعّب تشخيصها.', 'Catch specific exceptions you can handle, let others bubble up, and use ''throw;'' (not ''throw ex;'') to keep the stack trace. ''using'' disposes resources automatically — similar to TRY...CATCH with cleanup in T-SQL.', 'التقط الاستثناءات المحددة التي يمكنك التعامل معها، واترك غيرها يصعد للأعلى، واستخدم throw; وليس throw ex; للحفاظ على Stack trace. والكلمة using تتخلص من الموارد تلقائيًا، وهذا يشبه TRY...CATCH مع التنظيف في T-SQL.', 'When reading a config file, catch FileNotFoundException to show a clear message, but don''t catch Exception around the whole program.', 'عند قراءة ملف إعدادات، التقط FileNotFoundException لعرض رسالة واضحة، لكن لا تلتقط Exception حول البرنامج كله.', 'public class InsufficientStockException(int productId, int requested, int available)
    : Exception($"Product {productId}: requested {requested}, only {available} available.");

try
{
    var text = File.ReadAllText("settings.json");
}
catch (FileNotFoundException ex)
{
    Console.WriteLine($"Settings file missing: {ex.FileName}");
}
catch (IOException ex) when (ex.HResult == -2147024864)
{
    Console.WriteLine("The file is locked by another process.");
}
finally
{
    Console.WriteLine("Always runs");
}

// Re-throw without losing the stack trace
try { Process(); }
catch (Exception ex) { logger.LogError(ex, "Processing failed"); throw; }', 'csharp', 'Write a method that divides two numbers and handles DivideByZeroException, then create your own InsufficientStockException.', 'اكتب دالة تقسم رقمين وتتعامل مع DivideByZeroException، ثم أنشئ استثناءك الخاص InsufficientStockException.', 'Find a place in your code where an exception is used for normal control flow and replace it with a TryXxx method or a result value.', 'ابحث عن موضع في كودك يُستخدم فيه الاستثناء للتحكم الطبيعي في التدفق، واستبدله بدالة TryXxx أو بقيمة نتيجة.'),
  (9, 'cs-generics', 1, 9, 'CSharp', 'Important', 40, 'Generics', 'الأنواع العامة (Generics)', 'Generics let you write a class or method once and use it with any type: List<T>, Dictionary<TKey,TValue> and Task<T> are all generic.', 'تتيح Generics كتابة Class أو دالة مرة واحدة واستخدامها مع أي نوع، فـ List<T> وDictionary<TKey,TValue> وTask<T> كلها أنواع عامة.', 'Generics give you reuse without losing type safety. You''ll use them constantly and write your own for things like PagedResult<T> or Result<T>.', 'تمنحك Generics إعادة الاستخدام دون فقدان أمان الأنواع. ستستخدمها باستمرار وستكتب أنواعك الخاصة مثل PagedResult<T> أو Result<T>.', 'Declare a type parameter in angle brackets: class Box<T>. Constraints (where T : class, new(), IComparable<T>) limit which types are allowed so you can use their members.', 'عرّف معامل النوع بين علامتي < >: class Box<T>. والقيود (where T : class, new(), IComparable<T>) تحدد الأنواع المسموحة لتتمكن من استخدام أعضائها.', 'A PagedResult<T> type with Items, Page and TotalCount is returned by every list endpoint in an API, whatever the item type.', 'النوع PagedResult<T> الذي يحتوي على Items وPage وTotalCount تُرجعه كل نقاط النهاية الخاصة بالقوائم في API أيًا كان نوع العنصر.', 'public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public static T Max<T>(T a, T b) where T : IComparable<T> =>
    a.CompareTo(b) >= 0 ? a : b;

public class Repository<T> where T : class
{
    private readonly List<T> _items = [];
    public void Add(T item) => _items.Add(item);
    public IReadOnlyList<T> All() => _items;
}

var biggest = Max(3, 9);              // T inferred as int
var page = new PagedResult<string>(["a", "b"], 1, 20, 2);', 'csharp', 'Write a generic method T Max<T>(T a, T b) where T : IComparable<T>.', 'اكتب دالة عامة T Max<T>(T a, T b) where T : IComparable<T>.', 'Write a generic Result<T> type with Success/Failure factory methods and use it instead of throwing for validation errors.', 'اكتب نوعًا عامًا Result<T> مع دوال إنشاء Success/Failure واستخدمه بدلًا من رمي الاستثناءات عند أخطاء التحقق.'),
  (10, 'cs-delegates', 1, 10, 'CSharp', 'Important', 35, 'Delegates, Func and Action', 'المفوِّضات Delegates وFunc وAction', 'A delegate is a variable that holds a method. Func<T, TResult> returns a value, Action<T> doesn''t, and Predicate<T> returns bool.', 'الـ Delegate متغير يحمل دالة. النوع Func<T, TResult> يُرجع قيمة، وAction<T> لا يُرجع شيئًا، وPredicate<T> يُرجع bool.', 'Delegates let you pass behaviour as a parameter. They are the foundation of LINQ, events, callbacks and ASP.NET Core''s middleware pipeline.', 'تتيح Delegates تمرير السلوك كمعامل. وهي أساس LINQ والأحداث (Events) ودوال الاستدعاء (Callbacks) وسلسلة Middleware في ASP.NET Core.', 'Declare a parameter of type Func<Product, bool> and call it like a method. You can pass a named method or a lambda. Events are delegates that others subscribe to.', 'عرّف معاملًا من النوع Func<Product, bool> واستدعه كأنه دالة. يمكنك تمرير دالة مسماة أو تعبير Lambda. والأحداث (Events) هي Delegates يشترك فيها الآخرون.', 'A Filter(products, p => p.Stock < 5) method can filter by any rule the caller chooses, without changing Filter.', 'الدالة Filter(products, p => p.Stock < 5) يمكنها التصفية بأي قاعدة يختارها المستدعي دون تغيير Filter نفسها.', '// Func<in, out>, Action<in>, Predicate<in>
Func<decimal, decimal> addVat = price => price * 1.14m;
Action<string> log = message => Console.WriteLine($"[LOG] {message}");
Predicate<Product> isLow = p => p.Stock < 5;

static List<Product> Filter(IEnumerable<Product> source, Func<Product, bool> rule)
{
    var result = new List<Product>();
    foreach (var p in source)
        if (rule(p)) result.Add(p);
    return result;
}

var lowStock = Filter(products, p => p.Stock < 5);
log($"{lowStock.Count} products are low on stock");', 'csharp', 'Write a method ApplyToAll(List<decimal> prices, Func<decimal, decimal> rule) and call it with a 10% discount rule.', 'اكتب دالة ApplyToAll(List<decimal> prices, Func<decimal, decimal> rule) واستدعها بقاعدة خصم 10%.', 'Implement a tiny retry helper: Retry(Action action, int attempts) that re-runs the action when it throws.', 'نفّذ أداة إعادة محاولة بسيطة: Retry(Action action, int attempts) تعيد تنفيذ الإجراء عند رمي استثناء.'),
  (11, 'cs-lambdas', 1, 11, 'CSharp', 'Core', 30, 'Lambda expressions', 'تعابير Lambda', 'A lambda is an inline, anonymous function: x => x * 2. Lambdas are how you pass logic to LINQ, EF Core queries and many .NET APIs.', 'تعبير Lambda دالة مجهولة مكتوبة في السطر نفسه: x => x * 2. وهي الطريقة التي تمرر بها المنطق إلى LINQ واستعلامات EF Core والعديد من واجهات .NET.', 'You''ll read and write lambdas in almost every C# file. Understanding captured variables (closures) avoids subtle bugs.', 'ستقرأ تعابير Lambda وتكتبها في كل ملف C# تقريبًا. وفهم المتغيرات الملتقطة (Closures) يجنّبك أخطاء خفية.', 'Parameters go on the left of =>, the body on the right. Multi-line bodies use braces and return. A lambda can use variables from the surrounding method — it captures them.', 'تُكتب المعاملات على يسار => والجسم على يمينها. الأجسام متعددة الأسطر تستخدم الأقواس و return. ويمكن للـ Lambda استخدام متغيرات الدالة المحيطة بها، أي أنها تلتقطها.', 'orders.Where(o => o.Total > minTotal) uses the local variable minTotal inside the lambda.', 'التعبير orders.Where(o => o.Total > minTotal) يستخدم المتغير المحلي minTotal داخل الـ Lambda.', 'var minTotal = 500m;

// Lambda capturing a local variable (closure)
var bigOrders = orders.Where(o => o.Total > minTotal).ToList();

// Multi-line lambda body
Func<Order, string> describe = o =>
{
    var status = o.IsPaid ? "paid" : "unpaid";
    return $"#{o.Id} {o.Total:C} ({status})";
};

products.Sort((a, b) => a.Price.CompareTo(b.Price));', 'csharp', 'Sort a list of products by price with list.Sort((a, b) => a.Price.CompareTo(b.Price)), then by name.', 'رتّب قائمة منتجات حسب السعر باستخدام list.Sort((a, b) => a.Price.CompareTo(b.Price))، ثم حسب الاسم.', 'Create a List<Func<int>> in a for loop that captures the loop variable. Predict the output, run it, and explain what happened.', 'أنشئ List<Func<int>> داخل حلقة for تلتقط متغير الحلقة. توقّع الناتج، ثم شغّله، واشرح ما حدث.'),
  (12, 'oop-classes-objects', 2, 1, 'CSharp', 'Core', 45, 'Classes and objects', 'الأصناف (Classes) والكائنات', 'A class is a blueprint that groups data (properties) and behaviour (methods). An object is one instance of that class, created with ''new''.', 'الـ Class مخطط يجمع البيانات (Properties) والسلوك (Methods). والكائن (Object) نسخة واحدة من هذا الـ Class تُنشأ بالكلمة new.', 'Every entity in an application — Product, Order, Customer — is a class. Think of a class as a table definition and each object as a row that also knows how to behave.', 'كل كيان في التطبيق مثل Product وOrder وCustomer هو Class. فكّر في الـ Class كتعريف جدول، وفي كل كائن كصفّ يعرف أيضًا كيف يتصرف.', 'Define properties with { get; set; }, a constructor to set required values, and methods for behaviour. Each object has its own copy of the property values.', 'عرّف الخصائص باستخدام { get; set; }، ومُنشئًا (Constructor) لتعيين القيم المطلوبة، ودوال للسلوك. ولكل كائن نسخته الخاصة من قيم الخصائص.', 'new Employee("Sara", 12000m) creates an employee object with a GiveRaise(percent) method that updates its own salary.', 'التعبير new Employee("Sara", 12000m) يُنشئ كائن موظف يحتوي على دالة GiveRaise(percent) تحدّث راتبه الخاص.', 'public class Employee
{
    public Employee(string name, decimal salary)
    {
        Name = name;
        Salary = salary;
    }

    public string Name { get; }
    public decimal Salary { get; private set; }

    public void GiveRaise(decimal percent) => Salary += Salary * percent / 100;
}

var sara = new Employee("Sara", 12_000m);
sara.GiveRaise(10);
Console.WriteLine($"{sara.Name}: {sara.Salary:N2}");   // Sara: 13,200.00', 'csharp', 'Create a Product class with Name, Price and Stock, plus a method that reduces stock and returns false if not enough is available.', 'أنشئ Class باسم Product يحتوي على Name وPrice وStock، مع دالة تُنقص المخزون وتُرجع false إذا لم تكن الكمية كافية.', 'Add a static counter that tracks how many Product objects were created, and explain the difference between static and instance members.', 'أضف عدّادًا static يتتبع عدد كائنات Product التي تم إنشاؤها، واشرح الفرق بين الأعضاء static وأعضاء الكائن.'),
  (13, 'oop-encapsulation', 2, 2, 'CSharp', 'Core', 35, 'Encapsulation', 'التغليف (Encapsulation)', 'Encapsulation hides an object''s internal state and exposes only safe operations, so the object can never be put into an invalid state.', 'التغليف يخفي الحالة الداخلية للكائن ويكشف فقط العمليات الآمنة، بحيث لا يمكن وضع الكائن في حالة غير صالحة أبدًا.', 'It is the code equivalent of a CHECK constraint: if Stock can only change through RemoveStock(), nobody can set it to -5 by accident.', 'إنه ما يقابل قيد CHECK في الكود: إذا كان المخزون Stock لا يتغير إلا عبر RemoveStock() فلن يستطيع أحد ضبطه على -5 بالخطأ.', 'Use private fields or ''private set'', validate in constructors and methods, and expose read-only collections (IReadOnlyList<T>).', 'استخدم حقولًا private أو private set، وتحقق من القيم داخل المُنشئات والدوال، واكشف المجموعات للقراءة فقط (IReadOnlyList<T>).', 'An Order exposes AddLine(product, qty) instead of a public List<OrderLine>, so totals and rules are always applied.', 'الكائن Order يوفر AddLine(product, qty) بدلًا من List<OrderLine> عامة، فتُطبَّق الإجماليات والقواعد دائمًا.', 'public class Product
{
    public Product(string name, int stock)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (stock < 0) throw new ArgumentOutOfRangeException(nameof(stock));
        Name = name;
        Stock = stock;
    }

    public string Name { get; }
    public int Stock { get; private set; }   // can only change through methods

    public bool TryRemoveStock(int quantity)
    {
        if (quantity <= 0 || quantity > Stock) return false;
        Stock -= quantity;
        return true;
    }
}', 'csharp', 'Make BankAccount.Balance read-only from outside and add Deposit/Withdraw methods that reject invalid amounts.', 'اجعل BankAccount.Balance للقراءة فقط من الخارج، وأضف دالتي Deposit/Withdraw ترفضان المبالغ غير الصالحة.', 'Find a class with public setters everywhere and refactor it so every state change goes through a method with validation.', 'ابحث عن Class يحتوي على Setters عامة في كل مكان، وأعد هيكلته بحيث يمر كل تغيير للحالة عبر دالة تتحقق من القيم.'),
  (14, 'oop-inheritance', 2, 3, 'CSharp', 'Important', 35, 'Inheritance', 'الوراثة (Inheritance)', 'A derived class inherits members from a base class and can extend or override them. C# supports single class inheritance.', 'الـ Class المشتق يرث الأعضاء من الـ Class الأساسي ويمكنه توسيعها أو إعادة تعريفها. وتدعم C# الوراثة من Class واحد فقط.', 'Frameworks use inheritance heavily (ControllerBase, DbContext, Exception). Knowing its limits helps you avoid deep, fragile hierarchies in your own code.', 'تستخدم أطر العمل الوراثة بكثافة (ControllerBase وDbContext وException). ومعرفة حدودها تساعدك على تجنب التسلسلات العميقة والهشة في كودك.', 'class Manager : Employee. Mark base members ''virtual'' to allow overriding and use ''override'' in the derived class. ''abstract'' classes can''t be instantiated; ''sealed'' prevents further inheritance.', 'التعريف class Manager : Employee. علّم أعضاء الأساس بـ virtual للسماح بإعادة التعريف، واستخدم override في الـ Class المشتق. لا يمكن إنشاء كائنات من abstract classes، وتمنع sealed أي وراثة إضافية.', 'Your AppDbContext inherits from DbContext and overrides OnModelCreating to configure the model.', 'الـ AppDbContext الخاص بك يرث من DbContext ويعيد تعريف OnModelCreating لضبط النموذج.', 'public abstract class Employee(string name)
{
    public string Name { get; } = name;
    public abstract decimal CalculatePay();
    public virtual string Describe() => $"{Name}: {CalculatePay():C}";
}

public class SalariedEmployee(string name, decimal monthly) : Employee(name)
{
    public override decimal CalculatePay() => monthly;
}

public sealed class HourlyEmployee(string name, decimal rate, int hours) : Employee(name)
{
    public override decimal CalculatePay() => rate * hours;
    public override string Describe() => base.Describe() + $" ({hours}h)";
}', 'csharp', 'Create an abstract Employee with an abstract CalculatePay(), and two derived classes: SalariedEmployee and HourlyEmployee.', 'أنشئ Class مجردًا Employee يحتوي على دالة مجردة CalculatePay()، وصنفين مشتقين: SalariedEmployee وHourlyEmployee.', 'Explain with an example why ''Square inherits Rectangle'' can break code that uses Rectangle (Liskov substitution).', 'اشرح بمثال لماذا يمكن أن يكسر جعل Square يرث Rectangle الكودَ الذي يستخدم Rectangle (مبدأ Liskov).'),
  (15, 'oop-polymorphism', 2, 4, 'CSharp', 'Important', 35, 'Polymorphism', 'تعدد الأشكال (Polymorphism)', 'Polymorphism means code written against a base type or interface works with any derived type, and the right implementation runs at runtime.', 'تعدد الأشكال يعني أن الكود المكتوب لنوع أساسي أو Interface يعمل مع أي نوع مشتق، ويُنفَّذ التطبيق الصحيح وقت التشغيل.', 'It removes long switch statements on ''type'' and lets you add new behaviour (a new payment method, a new report) without editing existing code.', 'يزيل جمل switch الطويلة على النوع، ويتيح إضافة سلوك جديد (طريقة دفع جديدة أو تقرير جديد) دون تعديل الكود الموجود.', 'Store derived objects in a variable of the base type and call a virtual/abstract or interface method; .NET dispatches to the object''s real type.', 'خزّن الكائنات المشتقة في متغير من النوع الأساسي واستدعِ دالة virtual/abstract أو دالة Interface، وسيوجّه .NET الاستدعاء إلى النوع الحقيقي للكائن.', 'A List<Employee> containing salaried and hourly employees: payroll calls employee.CalculatePay() for each without knowing the concrete type.', 'قائمة List<Employee> تحتوي على موظفين برواتب شهرية وآخرين بالساعة: يستدعي نظام الرواتب employee.CalculatePay() لكل منهم دون معرفة النوع الفعلي.', 'List<Employee> staff =
[
    new SalariedEmployee("Omar", 15_000m),
    new HourlyEmployee("Lina", 120m, 80),
];

decimal payroll = 0;
foreach (var employee in staff)
    payroll += employee.CalculatePay();   // the right override runs for each object

// Instead of: switch (discountType) { case "Vip": ... case "Seasonal": ... }
public interface IDiscount { decimal Apply(decimal total); }
public class VipDiscount : IDiscount { public decimal Apply(decimal t) => t * 0.9m; }
public class NoDiscount : IDiscount { public decimal Apply(decimal t) => t; }', 'csharp', 'Create a list of shapes (Circle, Rectangle) and print the total area using a single loop and an Area() method.', 'أنشئ قائمة أشكال (Circle وRectangle) واطبع المساحة الإجمالية باستخدام حلقة واحدة ودالة Area().', 'Replace a switch on a ''DiscountType'' string with polymorphic discount classes and add a new discount without touching existing classes.', 'استبدل switch على نص DiscountType بأصناف خصم متعددة الأشكال، وأضف خصمًا جديدًا دون تعديل الأصناف الموجودة.'),
  (16, 'oop-interfaces', 2, 5, 'CSharp', 'Core', 40, 'Interfaces', 'الواجهات (Interfaces)', 'An interface is a contract: a list of members a class promises to implement. A class can implement many interfaces.', 'الـ Interface عقد: قائمة بالأعضاء التي يتعهد الـ Class بتنفيذها. ويمكن للـ Class تنفيذ عدة Interfaces.', 'Interfaces are central to modern .NET: dependency injection, testing with fakes and swapping implementations all rely on them.', 'الـ Interfaces محورية في .NET الحديثة: حقن الاعتماديات (DI) والاختبار باستخدام البدائل وتبديل التطبيقات كلها تعتمد عليها.', 'interface IEmailSender { Task SendAsync(string to, string body); }. Classes implement it with '': IEmailSender''. Code depends on the interface, not the concrete class.', 'التعريف interface IEmailSender { Task SendAsync(string to, string body); }. تنفذه الأصناف بكتابة : IEmailSender. ويعتمد الكود على الـ Interface وليس على الـ Class الفعلي.', 'OrderService depends on IPaymentGateway; in production it''s a real gateway, in tests a FakePaymentGateway that always succeeds.', 'تعتمد OrderService على IPaymentGateway؛ في الإنتاج تكون بوابة دفع حقيقية، وفي الاختبارات FakePaymentGateway تنجح دائمًا.', 'public interface IEmailSender
{
    Task SendAsync(string to, string subject, string body);
}

public class SmtpEmailSender : IEmailSender
{
    public Task SendAsync(string to, string subject, string body)
    {
        // real SMTP code
        return Task.CompletedTask;
    }
}

// In tests: a fake that records what was sent
public class FakeEmailSender : IEmailSender
{
    public List<string> Sent { get; } = [];
    public Task SendAsync(string to, string subject, string body)
    {
        Sent.Add(to);
        return Task.CompletedTask;
    }
}', 'csharp', 'Define INotifier with a Notify(string message) method and implement ConsoleNotifier and FileNotifier.', 'عرّف INotifier يحتوي على دالة Notify(string message)، ونفّذه في ConsoleNotifier وFileNotifier.', 'Introduce an IClock interface so code that uses DateTime.Now can be tested with a fixed date.', 'أضف Interface باسم IClock بحيث يمكن اختبار الكود الذي يستخدم DateTime.Now بتاريخ ثابت.'),
  (17, 'oop-composition', 2, 6, 'CSharp', 'Important', 30, 'Composition over inheritance', 'التركيب بدلًا من الوراثة', 'Composition builds behaviour by combining objects (''has-a'') rather than inheriting (''is-a''). It is usually more flexible than inheritance.', 'التركيب (Composition) يبني السلوك بدمج الكائنات (علاقة has-a) بدلًا من الوراثة (علاقة is-a). وهو عادةً أكثر مرونة من الوراثة.', 'Most services in ASP.NET Core are composed of smaller services injected through the constructor — this is composition in practice.', 'معظم الخدمات في ASP.NET Core مركّبة من خدمات أصغر تُحقن عبر المُنشئ، وهذا هو التركيب عمليًا.', 'Give a class fields of other types (ideally interfaces) and delegate work to them. Change behaviour by passing a different collaborator.', 'أعطِ الـ Class حقولًا من أنواع أخرى (ويُفضّل أن تكون Interfaces) وفوّض العمل إليها. وغيّر السلوك بتمرير متعاون مختلف.', 'OrderService has an IInventory, an IPricing and an ILogger instead of inheriting from a giant BaseService.', 'تحتوي OrderService على IInventory وIPricing وILogger بدلًا من الوراثة من BaseService ضخمة.', 'public interface IReportWriter { string Write(IEnumerable<SalesRow> rows); }

public class CsvReportWriter : IReportWriter
{
    public string Write(IEnumerable<SalesRow> rows) =>
        string.Join(''\n'', rows.Select(r => $"{r.Month},{r.Total}"));
}

// ReportGenerator HAS-A writer instead of IS-A CsvWriter
public class ReportGenerator(IReportWriter writer)
{
    public string Generate(IEnumerable<SalesRow> rows) => writer.Write(rows.OrderBy(r => r.Month));
}

var report = new ReportGenerator(new CsvReportWriter()).Generate(rows);', 'csharp', 'Refactor a ReportGenerator that inherits from CsvWriter so that it receives an IReportWriter instead.', 'أعد هيكلة ReportGenerator الذي يرث من CsvWriter بحيث يستقبل IReportWriter بدلًا من ذلك.', 'Add a second output format (JSON) to the report without changing ReportGenerator.', 'أضف صيغة إخراج ثانية (JSON) للتقرير دون تغيير ReportGenerator.'),
  (18, 'oop-solid', 2, 7, 'CSharp', 'Important', 60, 'SOLID principles', 'مبادئ SOLID', 'Five design guidelines: Single responsibility, Open/closed, Liskov substitution, Interface segregation and Dependency inversion.', 'خمسة مبادئ تصميم: المسؤولية الواحدة، والمفتوح/المغلق، واستبدال Liskov، وفصل الواجهات، وعكس الاعتماديات.', 'SOLID is common interview vocabulary and a practical checklist when reviewing code. Use it as guidance, not as a reason to over-engineer.', 'مبادئ SOLID من المصطلحات الشائعة في المقابلات وقائمة تحقق عملية عند مراجعة الكود. استخدمها كإرشاد، لا كمبرر للتعقيد الزائد.', 'S: one reason to change per class. O: extend via new classes, not edits. L: subtypes must honour the base contract. I: small focused interfaces. D: depend on abstractions injected from outside.', 'S: سبب واحد للتغيير لكل Class. O: التوسع عبر أصناف جديدة لا عبر التعديل. L: يجب أن تحترم الأنواع الفرعية عقد النوع الأساسي. I: Interfaces صغيرة ومركّزة. D: الاعتماد على تجريدات تُحقن من الخارج.', 'Splitting an OrderManager that validates, saves, emails and logs into OrderValidator, OrderService and an injected IEmailSender.', 'تقسيم OrderManager الذي يتحقق ويحفظ ويرسل البريد ويسجل إلى OrderValidator وOrderService وIEmailSender محقون.', '// Before: one class with many reasons to change
public class OrderManager
{
    public void Place(Order order)
    {
        // validate, save to database, send email, write log ...
    }
}

// After: focused classes, dependencies injected (S + D)
public class OrderService(IOrderValidator validator, AppDbContext db, IEmailSender email)
{
    public async Task PlaceAsync(Order order)
    {
        validator.EnsureValid(order);
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        await email.SendAsync(order.CustomerEmail, "Order received", $"Order #{order.Id}");
    }
}', 'csharp', 'For each SOLID letter, write one sentence and one tiny C# example in your notes.', 'لكل حرف من SOLID، اكتب جملة واحدة ومثالًا صغيرًا بلغة C# في ملاحظاتك.', 'Review one class from your Employee Management project and list which principle it violates and how you''d fix it.', 'راجع Class واحدًا من مشروع إدارة الموظفين واذكر المبدأ الذي يخالفه وكيف ستصلحه.'),
  (19, 'oop-object-modeling', 2, 8, 'CSharp', 'Core', 45, 'Practical object modeling', 'النمذجة العملية للكائنات', 'Turning requirements into classes: identify the nouns (entities), their data, their relationships and the rules they must enforce.', 'تحويل المتطلبات إلى Classes: تحديد الأسماء (الكيانات) وبياناتها وعلاقاتها والقواعد التي يجب أن تفرضها.', 'You already model data as tables. Object modeling adds behaviour: where does the ''order total'' rule live? Getting this right keeps business logic in one place.', 'أنت تنمذج البيانات كجداول بالفعل. والنمذجة الكائنية تضيف السلوك: أين تعيش قاعدة إجمالي الطلب؟ وإتقان ذلك يُبقي منطق العمل في مكان واحد.', 'Start from use cases, sketch entities and value objects, place each rule on the object that owns the data, and keep relationships navigable (Order.Lines, Line.Product).', 'ابدأ من حالات الاستخدام، وارسم الكيانات وكائنات القيمة (Value objects)، وضع كل قاعدة على الكائن الذي يملك البيانات، وحافظ على علاقات يمكن التنقل عبرها (Order.Lines وLine.Product).', 'Order owns its lines and calculates its total; Product owns stock and refuses to go negative; Customer owns contact details.', 'الطلب Order يملك أسطره ويحسب إجماليه، والمنتج Product يملك المخزون ويرفض أن يصبح سالبًا، والعميل Customer يملك بيانات التواصل.', 'public class Order
{
    private readonly List<OrderLine> _lines = [];

    public int Id { get; private set; }
    public int CustomerId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public IReadOnlyList<OrderLine> Lines => _lines;

    // The rule lives with the data it protects
    public decimal Total => _lines.Sum(l => l.Quantity * l.UnitPrice);

    public void AddLine(Product product, int quantity)
    {
        if (Status != OrderStatus.Draft) throw new InvalidOperationException("Only draft orders can change.");
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        _lines.Add(new OrderLine(product.Id, quantity, product.Price));
    }
}

public record OrderLine(int ProductId, int Quantity, decimal UnitPrice);
public enum OrderStatus { Draft, Submitted, Shipped, Cancelled }', 'csharp', 'Model a library: Book, Member and Loan with a rule that a member can borrow at most 3 books.', 'نمذج مكتبة: Book وMember وLoan مع قاعدة أن العضو يمكنه استعارة 3 كتب كحد أقصى.', 'Draw both the table design and the class design for an order system and list the differences.', 'ارسم تصميم الجداول وتصميم الأصناف لنظام طلبات، واذكر الفروق بينهما.'),
  (20, 'cs-nullable-reference-types', 3, 1, 'CSharp', 'Core', 35, 'Nullable reference types', 'الأنواع المرجعية القابلة لـ null', 'With nullable reference types enabled, ''string'' means ''never null'' and ''string?'' means ''may be null''. The compiler warns when you might dereference null.', 'عند تفعيل Nullable reference types يعني string أنه لن يكون null أبدًا، ويعني string? أنه قد يكون null. ويحذرك المترجم عند احتمال الوصول إلى قيمة null.', 'NullReferenceException is the most common runtime error in .NET. This feature moves many of those bugs to compile time — like NOT NULL vs NULL columns.', 'الاستثناء NullReferenceException هو أكثر أخطاء وقت التشغيل شيوعًا في .NET. وهذه الميزة تنقل كثيرًا من هذه الأخطاء إلى وقت الترجمة، تمامًا مثل الأعمدة NOT NULL مقابل NULL.', '<Nullable>enable</Nullable> in the .csproj turns it on. Use ''?'' for optional values, check with ''is null'' / ''is not null'', and avoid the ''!'' operator except when you are certain.', 'الإعداد <Nullable>enable</Nullable> في ملف .csproj يفعّل الميزة. استخدم ? للقيم الاختيارية، وتحقق بـ is null / is not null، وتجنب العامل ! إلا عند التأكد التام.', 'Customer.MiddleName is string? (optional), while Customer.Email is string and required by the constructor.', 'الخاصية Customer.MiddleName من النوع string? (اختيارية)، بينما Customer.Email من النوع string ويتطلبها المُنشئ.', 'public class Customer(string email)
{
    public string Email { get; } = email;       // never null
    public string? MiddleName { get; set; }     // optional
}

Customer? FindCustomer(int id) => customers.FirstOrDefault(c => c.Id == id);

var customer = FindCustomer(42);
if (customer is null)
{
    Console.WriteLine("Not found");
    return;
}
// The compiler knows customer is not null here
Console.WriteLine(customer.Email.ToUpper());
Console.WriteLine(customer.MiddleName?.ToUpper() ?? "(no middle name)");', 'csharp', 'Enable nullable in a small project, fix every warning properly (no ''!''), and note which ones were real bugs.', 'فعّل Nullable في مشروع صغير، وأصلح كل تحذير بشكل صحيح (دون استخدام !)، ودوّن أيها كان خطأً حقيقيًا.', 'Write FindCustomer(int id) returning Customer? and make every caller handle the not-found case.', 'اكتب الدالة FindCustomer(int id) التي تُرجع Customer? واجعل كل من يستدعيها يتعامل مع حالة عدم الوجود.'),
  (21, 'cs-records', 3, 2, 'CSharp', 'Core', 30, 'Records', 'السجلات (Records)', 'Records are concise types for data with value-based equality and built-in immutability: record ProductDto(int Id, string Name, decimal Price);', 'الـ Records أنواع مختصرة للبيانات تتميز بالمساواة القائمة على القيمة وعدم القابلية للتغيير: record ProductDto(int Id, string Name, decimal Price);', 'Records are perfect for DTOs, API requests/responses and value objects — you''ll use them throughout an ASP.NET Core API (this application''s API uses them).', 'الـ Records مثالية لكائنات DTO وطلبات واستجابات API وكائنات القيمة، وستستخدمها في كل أرجاء ASP.NET Core API (واجهة هذا التطبيق نفسه تستخدمها).', 'Two records with the same values are equal. Use ''with'' to create a modified copy. Positional parameters become init-only properties.', 'سجلان بنفس القيم يعتبران متساويين. استخدم with لإنشاء نسخة معدلة. وتتحول المعاملات الموضعية إلى خصائص init-only.', 'var updated = dto with { Price = 99m }; leaves the original DTO untouched.', 'التعبير var updated = dto with { Price = 99m }; يترك الـ DTO الأصلي دون تغيير.', 'public record ProductDto(int Id, string Name, decimal Price);

var a = new ProductDto(1, "Mouse", 25m);
var b = new ProductDto(1, "Mouse", 25m);
Console.WriteLine(a == b);              // True — value equality

var discounted = a with { Price = 20m }; // non-destructive copy
Console.WriteLine(a.Price);              // 25 — original unchanged

public record Money(decimal Amount, string Currency)
{
    public Money Add(Money other) =>
        Currency == other.Currency ? this with { Amount = Amount + other.Amount }
                                   : throw new InvalidOperationException("Currency mismatch");
}', 'csharp', 'Create a Money record (Amount, Currency) and show that two Money values with the same data are equal.', 'أنشئ Record باسم Money (Amount وCurrency) وأثبت أن قيمتين من Money بنفس البيانات متساويتان.', 'Explain when you would NOT use a record for an EF Core entity, and why.', 'اشرح متى لا تستخدم Record لكيان EF Core ولماذا.'),
  (22, 'cs-pattern-matching', 3, 3, 'CSharp', 'Important', 35, 'Pattern matching', 'مطابقة الأنماط (Pattern matching)', 'Patterns test a value''s type and shape: ''is'', switch expressions, property patterns ({ Status: Paid }), relational (> 100) and logical (and/or/not) patterns.', 'تختبر الأنماط نوع القيمة وشكلها: is، وتعابير switch، وأنماط الخصائص ({ Status: Paid })، وأنماط المقارنة (> 100)، والأنماط المنطقية (and/or/not).', 'Pattern matching turns complex conditional logic into short, readable rules — common in modern code reviews and in business rules like order transitions.', 'تحوّل مطابقة الأنماط المنطق الشرطي المعقد إلى قواعد قصيرة ومقروءة، وهي شائعة في مراجعات الكود الحديثة وقواعد العمل مثل انتقالات حالة الطلب.', 'Combine patterns inside a switch expression; the compiler warns if cases are unreachable or (for enums) not exhaustive.', 'ادمج الأنماط داخل تعبير switch، وسيحذرك المترجم إذا كانت هناك حالات لا يمكن الوصول إليها أو (في حالة Enums) حالات ناقصة.', '(current, next) switch { (Draft, Submitted) => true, (Submitted, Shipped or Cancelled) => true, _ => false } validates order status transitions.', 'التعبير (current, next) switch { (Draft, Submitted) => true, (Submitted, Shipped or Cancelled) => true, _ => false } يتحقق من صحة انتقالات حالة الطلب.', 'public enum OrderStatus { Draft, Submitted, Shipped, Delivered, Cancelled }

public static bool CanMove(OrderStatus from, OrderStatus to) => (from, to) switch
{
    (OrderStatus.Draft, OrderStatus.Submitted) => true,
    (OrderStatus.Submitted, OrderStatus.Shipped or OrderStatus.Cancelled) => true,
    (OrderStatus.Shipped, OrderStatus.Delivered) => true,
    _ => false
};

decimal Shipping(Order order) => order switch
{
    { IsVip: true } => 0m,
    { Country: "EG", Weight: <= 5 } => 30m,
    { Country: "EG" } => 60m,
    { Weight: > 20 } => 400m,
    _ => 150m
};

if (shape is Circle { Radius: > 10 } big)
    Console.WriteLine($"Big circle: {big.Radius}");', 'csharp', 'Write a shipping cost rule using property patterns on an Order (country, weight, isVip).', 'اكتب قاعدة تكلفة شحن باستخدام أنماط الخصائص على Order (الدولة، الوزن، isVip).', 'Implement the order status transition rule with a tuple switch and write tests for every allowed and forbidden transition.', 'نفّذ قاعدة انتقال حالة الطلب باستخدام switch على Tuple، واكتب اختبارات لكل انتقال مسموح وممنوع.'),
  (23, 'linq-fundamentals', 3, 4, 'CSharp', 'Core', 60, 'LINQ fundamentals', 'أساسيات LINQ', 'LINQ (Language Integrated Query) lets you query collections with methods like Where, Select, OrderBy, First, Any and Count.', 'تتيح LINQ (الاستعلام المدمج في اللغة) الاستعلام عن المجموعات بدوال مثل Where وSelect وOrderBy وFirst وAny وCount.', 'LINQ is where your SQL experience pays off: Where = WHERE, Select = SELECT, OrderBy = ORDER BY. With EF Core, LINQ is translated into SQL for you.', 'هنا تؤتي خبرتك في SQL ثمارها: Where تقابل WHERE، وSelect تقابل SELECT، وOrderBy تقابل ORDER BY. ومع EF Core تُترجم LINQ إلى SQL نيابةً عنك.', 'Chain methods with lambdas. Note the logical order differs from SQL: you write from → where → select. First() throws if empty; FirstOrDefault() returns null/default.', 'اربط الدوال مع تعابير Lambda. لاحظ أن الترتيب المنطقي يختلف عن SQL: تكتب المصدر ثم Where ثم Select. الدالة First() ترمي استثناءً عند عدم وجود عناصر، بينما FirstOrDefault() تُرجع null أو القيمة الافتراضية.', 'products.Where(p => p.Stock < 10).OrderBy(p => p.Name).Select(p => p.Name).ToList() is SELECT Name FROM Products WHERE Stock < 10 ORDER BY Name.', 'التعبير products.Where(p => p.Stock < 10).OrderBy(p => p.Name).Select(p => p.Name).ToList() يقابل SELECT Name FROM Products WHERE Stock < 10 ORDER BY Name.', '// SQL: SELECT TOP 5 Name, Salary FROM Employees
//      WHERE Department = ''IT'' ORDER BY Salary DESC
var top = employees
    .Where(e => e.Department == "IT")
    .OrderByDescending(e => e.Salary)
    .Take(5)
    .Select(e => new { e.Name, e.Salary })
    .ToList();

bool anyInactive = employees.Any(e => !e.IsActive);       // EXISTS
int itCount = employees.Count(e => e.Department == "IT"); // COUNT(*)
var first = employees.FirstOrDefault(e => e.Id == 7);     // null if not found', 'csharp', 'Given a list of employees, get the names of the 5 highest-paid employees in the IT department.', 'من قائمة موظفين، احصل على أسماء أعلى 5 موظفين راتبًا في قسم IT.', 'Rewrite three of your favourite SQL queries (filter, sort, projection) as LINQ method chains.', 'أعد كتابة ثلاثة من استعلامات SQL المفضلة لديك (تصفية وترتيب واختيار أعمدة) كسلاسل دوال LINQ.'),
  (24, 'linq-advanced', 3, 5, 'CSharp', 'Core', 60, 'Advanced LINQ: grouping, joins and aggregation', 'LINQ المتقدمة: التجميع والربط والتجميعات', 'GroupBy, Join, SelectMany, Sum/Average/Max, Distinct, Skip/Take and ToDictionary cover the report-style queries you write in SQL every day.', 'الدوال GroupBy وJoin وSelectMany وSum/Average/Max وDistinct وSkip/Take وToDictionary تغطي استعلامات التقارير التي تكتبها في SQL يوميًا.', 'Sales reports, dashboards and inventory summaries all need grouping and aggregation. This topic is required for the inventory and sales-reporting tasks in your projects.', 'تقارير المبيعات ولوحات المعلومات وملخصات المخزون كلها تحتاج إلى التجميع. وهذا الموضوع مطلوب لمهام المخزون وتقارير المبيعات في مشاريعك.', 'GroupBy(key) returns groups with a Key and the items; project each group with Select(g => new { g.Key, Total = g.Sum(...) }). SelectMany flattens nested lists (like joining parent to child rows).', 'تُرجع GroupBy(key) مجموعات لكل منها Key والعناصر؛ حوّل كل مجموعة باستخدام Select(g => new { g.Key, Total = g.Sum(...) }). وتعمل SelectMany على تسطيح القوائم المتداخلة (مثل ربط الصفوف الأب بالصفوف الأبناء).', 'orders.SelectMany(o => o.Lines).GroupBy(l => l.ProductId).Select(g => new { g.Key, Qty = g.Sum(l => l.Quantity) }) is GROUP BY ProductId with SUM(Quantity).', 'التعبير orders.SelectMany(o => o.Lines).GroupBy(l => l.ProductId).Select(g => new { g.Key, Qty = g.Sum(l => l.Quantity) }) يقابل GROUP BY ProductId مع SUM(Quantity).', '// SQL: SELECT c.Name AS Category, MONTH(o.Date) AS Month, SUM(l.Qty * l.Price) AS Total
//      ... GROUP BY c.Name, MONTH(o.Date)
var monthly = orders
    .SelectMany(o => o.Lines, (o, l) => new { o.Date, l.Product.Category, Amount = l.Quantity * l.UnitPrice })
    .GroupBy(x => new { x.Category, x.Date.Month })
    .Select(g => new { g.Key.Category, g.Key.Month, Total = g.Sum(x => x.Amount) })
    .OrderBy(x => x.Month).ThenBy(x => x.Category)
    .ToList();

// Top customer per city (like ROW_NUMBER() OVER (PARTITION BY City ORDER BY Spend DESC) = 1)
var topPerCity = customers
    .GroupBy(c => c.City)
    .Select(g => g.OrderByDescending(c => c.TotalSpend).First())
    .ToList();

var join = orders.Join(customers, o => o.CustomerId, c => c.Id, (o, c) => new { o.Id, c.Name });', 'csharp', 'Produce monthly sales totals per category from a list of orders, sorted by month.', 'أنتج إجمالي المبيعات الشهرية لكل فئة من قائمة طلبات، مرتبة حسب الشهر.', 'Find the top customer per city (highest total spend) using only LINQ — the equivalent of ROW_NUMBER() OVER (PARTITION BY City ...).', 'أوجد أفضل عميل في كل مدينة (الأعلى إنفاقًا) باستخدام LINQ فقط، وهو ما يعادل ROW_NUMBER() OVER (PARTITION BY City ...).'),
  (25, 'linq-deferred-execution', 3, 6, 'CSharp', 'Important', 30, 'Deferred execution', 'التنفيذ المؤجل (Deferred execution)', 'Most LINQ operators don''t run when you write them; they run when you enumerate the result (foreach, ToList, Count, First).', 'معظم عوامل LINQ لا تُنفَّذ لحظة كتابتها، بل عند المرور على النتيجة (foreach أو ToList أو Count أو First).', 'Not understanding this causes repeated database queries, surprising results after the source changes, and performance bugs in EF Core.', 'عدم فهم ذلك يسبب تكرار استعلامات قاعدة البيانات، ونتائج مفاجئة بعد تغيّر المصدر، ومشكلات أداء في EF Core.', 'A query is a recipe. Each enumeration re-runs it. Call ToList()/ToArray() once when you need a snapshot and want to iterate several times.', 'الاستعلام وصفة، وكل مرور عليه يعيد تنفيذه. استدعِ ToList() أو ToArray() مرة واحدة عندما تحتاج إلى لقطة ثابتة وتريد المرور عليها عدة مرات.', 'var q = db.Orders.Where(...); var count = q.Count(); var list = q.ToList(); sends two SQL queries to the database.', 'الكود var q = db.Orders.Where(...); var count = q.Count(); var list = q.ToList(); يرسل استعلامي SQL إلى قاعدة البيانات.', 'var numbers = new List<int> { 1, 2, 3 };
var evens = numbers.Where(n => n % 2 == 0);   // nothing runs yet

numbers.Add(4);
Console.WriteLine(string.Join(",", evens));   // 2,4 — runs NOW, sees the new item

// With EF Core: each enumeration is a database round trip
var query = db.Orders.Where(o => o.Total > 1000);
var count = query.Count();     // SQL #1: SELECT COUNT(*)
var list = query.ToList();     // SQL #2: SELECT ...

// Materialise once if you need the data several times
var snapshot = query.ToList();
var total = snapshot.Count;', 'csharp', 'Create a query over a list, add an item to the list afterwards, then enumerate. Explain the output.', 'أنشئ استعلامًا على قائمة، ثم أضف عنصرًا إلى القائمة بعد ذلك، ثم مرّ على النتيجة. اشرح الناتج.', 'Log every SQL query EF Core sends and remove an accidental double enumeration from an endpoint.', 'سجّل كل استعلام SQL يرسله EF Core، وأزل مرورًا مزدوجًا غير مقصود من إحدى نقاط النهاية.'),
  (26, 'cs-async-await', 3, 7, 'CSharp', 'Core', 60, 'Async and await', 'البرمجة غير المتزامنة: async وawait', 'async/await lets code wait for I/O (database, HTTP, files) without blocking a thread. Async methods return Task or Task<T>.', 'تتيح async/await للكود انتظار عمليات الإدخال والإخراج (قاعدة البيانات وHTTP والملفات) دون حجز Thread. وتُرجع الدوال غير المتزامنة Task أو Task<T>.', 'Every ASP.NET Core endpoint that touches the database should be async so the server can handle many requests with few threads.', 'كل نقطة نهاية في ASP.NET Core تتعامل مع قاعدة البيانات يجب أن تكون غير متزامنة، ليتمكن الخادم من معالجة طلبات كثيرة بعدد قليل من الـ Threads.', 'Mark the method async, await each I/O call, and name it with an Async suffix. Never use .Result or .Wait() — they block and can deadlock. Use Task.WhenAll for independent calls.', 'علّم الدالة بـ async، واستخدم await مع كل عملية إدخال/إخراج، وأضف اللاحقة Async إلى اسمها. لا تستخدم .Result أو .Wait() أبدًا لأنهما يحجزان الـ Thread وقد يسببان Deadlock. واستخدم Task.WhenAll للاستدعاءات المستقلة.', 'var product = await db.Products.FindAsync(id); frees the thread while SQL Server executes the query.', 'التعبير var product = await db.Products.FindAsync(id); يحرر الـ Thread أثناء تنفيذ SQL Server للاستعلام.', 'public async Task<ProductDto?> GetProductAsync(int id, CancellationToken ct)
{
    var product = await db.Products.AsNoTracking()
        .FirstOrDefaultAsync(p => p.Id == id, ct);   // thread is free while SQL runs

    return product is null ? null : new ProductDto(product.Id, product.Name, product.Price);
}

// Run independent I/O concurrently
var pricesTask = http.GetStringAsync("https://example.com/prices");
var stockTask = http.GetStringAsync("https://example.com/stock");
await Task.WhenAll(pricesTask, stockTask);

// ❌ Never block on async code:
// var p = GetProductAsync(1, ct).Result;', 'csharp', 'Write an async method that downloads two web pages concurrently with HttpClient and Task.WhenAll.', 'اكتب دالة غير متزامنة تنزّل صفحتي ويب بالتوازي باستخدام HttpClient وTask.WhenAll.', 'Explain the difference between concurrency and parallelism, and why async doesn''t make a CPU-bound calculation faster.', 'اشرح الفرق بين التزامن (Concurrency) والتوازي (Parallelism)، ولماذا لا تجعل async العمليات الحسابية الثقيلة أسرع.'),
  (27, 'cs-cancellation-tokens', 3, 8, 'CSharp', 'Important', 30, 'Cancellation tokens', 'رموز الإلغاء (Cancellation tokens)', 'A CancellationToken lets a caller ask an async operation to stop early — for example when the user closes the browser tab.', 'يتيح CancellationToken للمستدعي أن يطلب من عملية غير متزامنة التوقف مبكرًا، مثل عندما يغلق المستخدم تبويب المتصفح.', 'Without cancellation, an abandoned request keeps running an expensive SQL query. ASP.NET Core gives every request a token for free.', 'بدون الإلغاء يستمر الطلب المتروك في تنفيذ استعلام SQL مكلف. ويوفر ASP.NET Core رمزًا لكل طلب مجانًا.', 'Accept a CancellationToken parameter and pass it to every async call (ToListAsync(ct), SaveChangesAsync(ct)). Cancelled operations throw OperationCanceledException.', 'استقبل معاملًا من النوع CancellationToken ومرّره إلى كل استدعاء غير متزامن (ToListAsync(ct) وSaveChangesAsync(ct)). والعمليات الملغاة ترمي OperationCanceledException.', 'public Task<List<ProductDto>> Get(CancellationToken ct) => service.ListAsync(ct); — this application''s controllers do exactly that.', 'التعريف public Task<List<ProductDto>> Get(CancellationToken ct) => service.ListAsync(ct); ووحدات التحكم في هذا التطبيق تفعل ذلك تمامًا.', 'using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));

try
{
    foreach (var item in items)
    {
        cts.Token.ThrowIfCancellationRequested();
        await ProcessAsync(item, cts.Token);
        await Task.Delay(500, cts.Token);
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("Stopped early");
}

// ASP.NET Core binds the request''s token automatically
[HttpGet]
public Task<List<ProductDto>> Get(CancellationToken ct) => productService.ListAsync(ct);', 'csharp', 'Write a loop that processes items with a delay and stops when a CancellationTokenSource is cancelled after 2 seconds.', 'اكتب حلقة تعالج العناصر مع تأخير وتتوقف عند إلغاء CancellationTokenSource بعد ثانيتين.', 'Add cancellation support through all layers of one API endpoint and verify it by cancelling a slow request.', 'أضف دعم الإلغاء عبر جميع طبقات نقطة نهاية واحدة في API، وتحقق منه بإلغاء طلب بطيء.'),
  (28, 'cs-value-reference-types', 3, 9, 'CSharp', 'Important', 35, 'Value types and reference types', 'أنواع القيمة والأنواع المرجعية', 'Value types (int, decimal, DateTime, struct) hold their data directly and are copied on assignment. Reference types (class, string, arrays) hold a reference to an object on the heap.', 'أنواع القيمة (int وdecimal وDateTime وstruct) تحمل بياناتها مباشرة وتُنسخ عند الإسناد. أما الأنواع المرجعية (class وstring والمصفوفات) فتحمل مرجعًا إلى كائن في الـ Heap.', 'This explains why changing an object inside a method affects the caller, why == behaves differently for classes and records, and some performance characteristics.', 'يفسر ذلك لماذا يؤثر تغيير كائن داخل دالة على المستدعي، ولماذا يتصرف == بشكل مختلف مع الـ Classes والـ Records، وبعض خصائص الأداء.', 'Assigning a class variable copies the reference (both point to the same object). Assigning a struct copies the value. string is a reference type but immutable, so it behaves like a value.', 'إسناد متغير Class ينسخ المرجع (فيشير المتغيران إلى الكائن نفسه)، وإسناد struct ينسخ القيمة. والنوع string مرجعي لكنه غير قابل للتغيير، لذا يتصرف كقيمة.', 'Passing a List<Order> to a method that calls list.Clear() empties the caller''s list too.', 'تمرير List<Order> إلى دالة تستدعي list.Clear() يُفرغ قائمة المستدعي أيضًا.', 'public struct PointStruct { public int X; }
public class PointClass { public int X; }

var s1 = new PointStruct { X = 1 };
var s2 = s1;      // copy of the value
s2.X = 99;
Console.WriteLine(s1.X);   // 1

var c1 = new PointClass { X = 1 };
var c2 = c1;      // copy of the reference — same object
c2.X = 99;
Console.WriteLine(c1.X);   // 99

void Clear(List<int> list) => list.Clear();   // affects the caller''s list', 'csharp', 'Write a small program that demonstrates copying a struct vs copying a class reference.', 'اكتب برنامجًا صغيرًا يوضح الفرق بين نسخ struct ونسخ مرجع Class.', 'Explain boxing with an example and why it matters when storing ints in a List<object>.', 'اشرح Boxing بمثال، ولماذا يهم عند تخزين أعداد int في List<object>.'),
  (29, 'cs-modern-features', 3, 10, 'CSharp', 'Optional', 30, 'Useful modern C# features', 'ميزات C# حديثة مفيدة', 'Primary constructors, collection expressions ([1, 2, 3]), file-scoped namespaces, global usings, raw string literals, ''required'' members and target-typed new.', 'المُنشئات الأساسية (Primary constructors)، وتعابير المجموعات ([1, 2, 3])، وNamespaces على مستوى الملف، وGlobal usings، والنصوص الخام (Raw string literals)، والأعضاء required، وnew المستنتج من النوع.', 'Templates and modern codebases use these everywhere. Recognising them prevents confusion when you read existing code.', 'القوالب وقواعد الكود الحديثة تستخدمها في كل مكان، والتعرف عليها يمنع الارتباك عند قراءة الكود الموجود.', 'Primary constructors put parameters on the class declaration; collection expressions create any collection type; raw strings ("""...""") hold JSON or SQL without escaping.', 'تضع المُنشئات الأساسية المعاملات في تعريف الـ Class نفسه، وتعابير المجموعات تُنشئ أي نوع مجموعة، والنصوص الخام ("""...""") تحمل JSON أو SQL دون الحاجة للهروب.', 'public class OrderService(AppDbContext db, ILogger<OrderService> logger) — the style used by this application''s own services.', 'التعريف public class OrderService(AppDbContext db, ILogger<OrderService> logger) وهو الأسلوب المستخدم في خدمات هذا التطبيق نفسه.', 'namespace Inventory.Services;   // file-scoped namespace

// Primary constructor: parameters available in the whole class
public class StockService(AppDbContext db, ILogger<StockService> logger)
{
    public async Task<int> CountLowStockAsync(CancellationToken ct)
    {
        var count = await db.Products.CountAsync(p => p.Stock < 10, ct);
        logger.LogInformation("{Count} products are low on stock", count);
        return count;
    }
}

public class CreateProduct
{
    public required string Name { get; init; }   // must be set by the caller
    public decimal Price { get; init; }
}

int[] ids = [1, 2, 3];                  // collection expression
List<string> tags = ["new", "sale"];

var sql = """
    SELECT Name, Price
    FROM Products
    WHERE Name LIKE ''%"Pro"%''
    """;', 'csharp', 'Rewrite an older class using a primary constructor, file-scoped namespace and collection expressions.', 'أعد كتابة Class قديم باستخدام Primary constructor وNamespace على مستوى الملف وتعابير المجموعات.', 'Use a raw string literal to embed a multi-line SQL query with quotes, and explain how indentation is handled.', 'استخدم Raw string literal لتضمين استعلام SQL متعدد الأسطر يحتوي على علامات اقتباس، واشرح كيف تُعالَج المسافات البادئة.'),
  (30, 'api-startup', 4, 1, 'AspNetCore', 'Core', 40, 'Application startup (Program.cs)', 'بدء تشغيل التطبيق (Program.cs)', 'Program.cs builds the app in two phases: register services on builder.Services, then configure the HTTP pipeline on ''app'' and call app.Run().', 'يبني الملف Program.cs التطبيق على مرحلتين: تسجيل الخدمات في builder.Services، ثم ضبط مسار HTTP على app واستدعاء app.Run().', 'Program.cs is the map of an API. When you join a team, reading it tells you which database, authentication, logging and middleware the app uses.', 'الملف Program.cs هو خريطة الـ API. وعند انضمامك لفريق، تخبرك قراءته بقاعدة البيانات والمصادقة والتسجيل والـ Middleware التي يستخدمها التطبيق.', 'WebApplication.CreateBuilder loads configuration and logging. AddControllers/AddDbContext register services. After Build(), Use... and Map... calls define middleware order and endpoints.', 'يحمّل WebApplication.CreateBuilder الإعدادات والتسجيل، وتسجّل AddControllers/AddDbContext الخدمات. وبعد Build() تحدد استدعاءات Use... وMap... ترتيب الـ Middleware ونقاط النهاية.', 'Open this application''s backend/DevPath.Api/Program.cs: it registers EF Core, CORS and services, then maps controllers and a health check.', 'افتح ملف backend/DevPath.Api/Program.cs في هذا التطبيق: ستجده يسجل EF Core وCORS والخدمات، ثم يربط وحدات التحكم وفحص الصحة.', 'var builder = WebApplication.CreateBuilder(args);

// 1) Register services (dependency injection container)
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<ProductService>();

var app = builder.Build();

// 2) Configure the HTTP pipeline — order matters
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();', 'csharp', 'Create a new project with ''dotnet new webapi --use-controllers'', run it and call the sample endpoint from the .http file.', 'أنشئ مشروعًا جديدًا بالأمر dotnet new webapi --use-controllers، وشغّله، واستدعِ نقطة النهاية التجريبية من ملف .http.', 'Annotate each line of DevPath''s Program.cs with a comment explaining what it does and why its position matters.', 'أضف تعليقًا لكل سطر في Program.cs الخاص بـ DevPath يشرح وظيفته ولماذا يهم موضعه.'),
  (31, 'api-http-rest', 4, 2, 'AspNetCore', 'Core', 45, 'HTTP and REST', 'بروتوكول HTTP ومبادئ REST', 'HTTP requests have a method (GET, POST, PUT, PATCH, DELETE), a URL, headers and an optional body. REST models data as resources addressed by URLs.', 'لطلبات HTTP طريقة (GET وPOST وPUT وPATCH وDELETE) وعنوان URL ورؤوس (Headers) ومحتوى اختياري. ويمثّل REST البيانات كموارد يُشار إليها بعناوين URL.', 'Every Angular screen talks to the API over HTTP. Designing clear resource URLs and using methods correctly makes the API predictable for everyone.', 'كل شاشة في Angular تتواصل مع الـ API عبر HTTP. وتصميم عناوين موارد واضحة واستخدام الطرق بشكل صحيح يجعل الـ API متوقعًا للجميع.', 'GET reads (safe), POST creates, PUT replaces (idempotent), PATCH updates partially, DELETE removes. Use nouns in URLs: /api/products/42, not /api/getProduct?id=42.', 'تقرأ GET البيانات (آمنة)، وتنشئ POST، وتستبدل PUT (Idempotent)، وتحدّث PATCH جزئيًا، وتحذف DELETE. استخدم الأسماء في العناوين: /api/products/42 وليس /api/getProduct?id=42.', 'GET /api/orders?status=Open&page=2 lists orders; POST /api/orders creates one and returns 201 with a Location header.', 'الطلب GET /api/orders?status=Open&page=2 يعرض الطلبات، والطلب POST /api/orders ينشئ طلبًا ويُرجع 201 مع رأس Location.', '### List (safe, cacheable)
GET http://localhost:5080/api/products?page=1&pageSize=20

### Create → 201 Created + Location header
POST http://localhost:5080/api/products
Content-Type: application/json

{ "name": "Mouse", "price": 25.5, "categoryId": 3 }

### Replace (idempotent)
PUT http://localhost:5080/api/products/42
Content-Type: application/json

{ "name": "Wireless Mouse", "price": 29.9, "categoryId": 3 }

### Delete → 204 No Content
DELETE http://localhost:5080/api/products/42', 'http', 'Open the browser dev tools Network tab on this application and identify the method, URL, status and response of three requests.', 'افتح تبويب Network في أدوات مطوري المتصفح على هذا التطبيق، وحدد الطريقة والعنوان والحالة والاستجابة لثلاثة طلبات.', 'Design the URLs and methods for a library API (books, members, loans) including returning a book.', 'صمّم العناوين والطرق لواجهة مكتبة (الكتب والأعضاء والإعارات)، بما في ذلك إرجاع كتاب.'),
  (32, 'api-controllers-routing', 4, 3, 'AspNetCore', 'Core', 45, 'Controllers and routing', 'وحدات التحكم (Controllers) والتوجيه', 'Controllers group related endpoints. Attribute routing ([Route], [HttpGet("{id:int}")]) maps URLs and methods to action methods.', 'تجمع وحدات التحكم نقاط النهاية المرتبطة، ويربط التوجيه بالسمات ([Route] و[HttpGet("{id:int}")]) العناوين والطرق بدوال الإجراءات.', 'Controllers are where requests enter your code. Keeping them thin (delegating to services) keeps business logic testable.', 'وحدات التحكم هي نقطة دخول الطلبات إلى كودك، وإبقاؤها رفيعة (بتفويض العمل للخدمات) يجعل منطق العمل قابلًا للاختبار.', '[ApiController] enables automatic model validation and binding. Parameters bind from route, query string ([FromQuery]) or body. Route constraints like {id:int} reject bad URLs early.', 'تفعّل السمة [ApiController] التحقق التلقائي من النموذج وربط البيانات. تُربط المعاملات من المسار أو Query string ([FromQuery]) أو المحتوى. وقيود المسار مثل {id:int} ترفض العناوين الخاطئة مبكرًا.', '[HttpGet("{id:int}")] public Task<ProductDto> Get(int id, CancellationToken ct) handles GET /api/products/5.', 'التعريف [HttpGet("{id:int}")] public Task<ProductDto> Get(int id, CancellationToken ct) يعالج GET /api/products/5.', '[ApiController]
[Route("api/products")]
public class ProductsController(ProductService products) : ControllerBase
{
    [HttpGet]                         // GET api/products?q=mouse
    public Task<List<ProductDto>> List([FromQuery] string? q, CancellationToken ct) =>
        products.ListAsync(q, ct);

    [HttpGet("{id:int}")]             // GET api/products/5
    public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct)
    {
        var product = await products.FindAsync(id, ct);
        return product is null ? NotFound() : product;
    }

    [HttpPost]                        // body is bound from JSON
    public async Task<ActionResult<ProductDto>> Create(CreateProductRequest request, CancellationToken ct)
    {
        var created = await products.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }
}', 'csharp', 'Create a ProductsController with GET all, GET by id, POST, PUT and DELETE using an in-memory list.', 'أنشئ ProductsController يحتوي على GET للجميع وGET بالمعرف وPOST وPUT وDELETE باستخدام قائمة في الذاكرة.', 'Add a nested route GET /api/categories/{id}/products and explain when nesting URLs is a good idea.', 'أضف مسارًا متداخلًا GET /api/categories/{id}/products واشرح متى يكون تداخل العناوين فكرة جيدة.'),
  (33, 'api-dependency-injection', 4, 4, 'AspNetCore', 'Core', 45, 'Dependency injection', 'حقن الاعتماديات (Dependency Injection)', 'Instead of creating dependencies with ''new'', classes declare them in their constructor and the built-in DI container provides them.', 'بدلًا من إنشاء الاعتماديات بـ new، تعلن الأصناف عنها في المُنشئ، وتوفرها حاوية DI المدمجة.', 'DI is how every ASP.NET Core app is wired together. It enables testing with fakes, central configuration and controlled lifetimes.', 'حقن الاعتماديات هو طريقة ربط كل تطبيق ASP.NET Core. ويتيح الاختبار بالبدائل والإعداد المركزي والتحكم في أعمار الكائنات.', 'Register with builder.Services.AddScoped<IOrderService, OrderService>(). Ask for IOrderService in a constructor and the container builds the whole object graph.', 'سجّل الخدمة بـ builder.Services.AddScoped<IOrderService, OrderService>(). اطلب IOrderService في المُنشئ وستبني الحاوية شبكة الكائنات كاملة.', 'OrdersController receives OrderService, which receives AppDbContext and ILogger — none of them is created with ''new''.', 'يستقبل OrdersController الخدمة OrderService، التي تستقبل بدورها AppDbContext وILogger، دون إنشاء أي منها بـ new.', '// Program.cs — registration
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddSingleton(TimeProvider.System);

// The container builds the whole graph for you
public class OrderService(AppDbContext db, TimeProvider clock, ILogger<OrderService> logger) : IOrderService
{
    public async Task<int> PlaceAsync(CreateOrderRequest request, CancellationToken ct)
    {
        var order = new Order { CreatedAt = clock.GetUtcNow().UtcDateTime };
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Order {OrderId} placed", order.Id);
        return order.Id;
    }
}

[ApiController, Route("api/orders")]
public class OrdersController(IOrderService orders) : ControllerBase { /* ... */ }', 'csharp', 'Register an IClock service and inject it into a controller that returns the current time.', 'سجّل خدمة IClock واحقنها في وحدة تحكم تُرجع الوقت الحالي.', 'Find every service registration in DevPath''s Program.cs and draw the dependency graph for DashboardService.', 'اعثر على كل تسجيلات الخدمات في Program.cs الخاص بـ DevPath، وارسم شبكة الاعتماديات الخاصة بـ DashboardService.'),
  (34, 'api-service-lifetimes', 4, 5, 'AspNetCore', 'Core', 30, 'Service lifetimes', 'أعمار الخدمات (Service lifetimes)', 'Transient: new instance every time. Scoped: one instance per HTTP request. Singleton: one instance for the whole application.', 'Transient: نسخة جديدة في كل مرة. Scoped: نسخة واحدة لكل طلب HTTP. Singleton: نسخة واحدة للتطبيق بأكمله.', 'Wrong lifetimes cause real production bugs: a Singleton holding a DbContext shares it across threads and users.', 'الأعمار الخاطئة تسبب أخطاء حقيقية في الإنتاج: Singleton يحمل DbContext سيشاركه بين الـ Threads والمستخدمين.', 'DbContext is Scoped. Stateless helpers can be Singleton. Never inject a Scoped service into a Singleton (captive dependency) — the development environment detects this.', 'الـ DbContext يكون Scoped، والأدوات عديمة الحالة يمكن أن تكون Singleton. لا تحقن أبدًا خدمة Scoped داخل Singleton (Captive dependency)، وبيئة التطوير تكتشف ذلك.', 'TimeProvider.System is registered as a singleton in DevPath; all business services are scoped because they use AppDbContext.', 'يُسجَّل TimeProvider.System كـ Singleton في DevPath، وكل خدمات العمل Scoped لأنها تستخدم AppDbContext.', 'builder.Services.AddTransient<IPriceFormatter, PriceFormatter>(); // new every time
builder.Services.AddScoped<OrderService>();                        // one per HTTP request
builder.Services.AddSingleton<ICurrencyRates, CachedRates>();      // one for the app

// ❌ Captive dependency: a singleton holding a scoped DbContext
public class CachedRates(AppDbContext db) : ICurrencyRates { }

// ✅ Create a scope when a singleton really needs scoped services
public class CachedRatesFixed(IServiceScopeFactory scopes) : ICurrencyRates
{
    public async Task RefreshAsync()
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // ... use db
    }
}', 'csharp', 'Register the same class as transient, scoped and singleton and log a Guid from its constructor to observe the difference.', 'سجّل نفس الـ Class كـ Transient ثم Scoped ثم Singleton، وسجّل Guid من المُنشئ لملاحظة الفرق.', 'Reproduce the ''Cannot consume scoped service from singleton'' error and fix it with IServiceScopeFactory.', 'أعد إنتاج الخطأ Cannot consume scoped service from singleton، ثم أصلحه باستخدام IServiceScopeFactory.'),
  (35, 'api-configuration', 4, 6, 'AspNetCore', 'Core', 35, 'Configuration and the options pattern', 'الإعدادات ونمط Options', 'Configuration merges appsettings.json, appsettings.{Environment}.json, user secrets and environment variables. The options pattern binds sections to typed classes.', 'تدمج الإعدادات بين appsettings.json وappsettings.{Environment}.json وUser secrets ومتغيرات البيئة، ويربط نمط Options الأقسام بأصناف ذات أنواع محددة.', 'Connection strings, feature flags and limits differ between development and production. Secrets must never be committed to Git.', 'سلاسل الاتصال وأعلام الميزات والحدود تختلف بين التطوير والإنتاج، ويجب ألا تُرفع الأسرار إلى Git أبدًا.', 'Later sources override earlier ones. builder.Services.Configure<MyOptions>(config.GetSection("My")) then inject IOptions<MyOptions>. Use ''dotnet user-secrets set'' for local secrets.', 'المصادر اللاحقة تتغلب على السابقة. استخدم builder.Services.Configure<MyOptions>(config.GetSection("My")) ثم احقن IOptions<MyOptions>. واستخدم dotnet user-secrets set للأسرار المحلية.', 'DevPath binds the ''Progress'' section to ProgressOptions so you can change progress weights in appsettings.json without code changes.', 'يربط DevPath القسم Progress بالصنف ProgressOptions، فيمكنك تغيير أوزان التقدم في appsettings.json دون تعديل الكود.', '// appsettings.json
// { "Store": { "Name": "DevPath Shop", "MaxItemsPerOrder": 50 } }

public class StoreOptions
{
    public string Name { get; set; } = "";
    public int MaxItemsPerOrder { get; set; } = 20;
}

builder.Services.Configure<StoreOptions>(builder.Configuration.GetSection("Store"));

public class OrderValidator(IOptions<StoreOptions> options)
{
    public bool IsTooLarge(int items) => items > options.Value.MaxItemsPerOrder;
}

// Secrets stay out of Git:
//   dotnet user-secrets set "ConnectionStrings:Default" "Server=...;Password=..."', 'csharp', 'Add a ''Store'' section with Name and MaxItemsPerOrder, bind it to a class and use it in a controller.', 'أضف قسمًا باسم Store يحتوي على Name وMaxItemsPerOrder، واربطه بـ Class واستخدمه في وحدة تحكم.', 'Move a connection string with a password into user secrets and verify the app still runs.', 'انقل سلسلة اتصال تحتوي على كلمة مرور إلى User secrets وتحقق أن التطبيق لا يزال يعمل.'),
  (36, 'api-dtos', 4, 7, 'AspNetCore', 'Core', 35, 'DTOs (Data Transfer Objects)', 'كائنات نقل البيانات (DTOs)', 'DTOs are the shapes your API sends and receives. They are separate from database entities and expose only what the client needs.', 'الـ DTOs هي الأشكال التي يرسلها الـ API ويستقبلها، وهي منفصلة عن كيانات قاعدة البيانات وتكشف فقط ما يحتاجه العميل.', 'Returning entities directly leaks internal fields, causes JSON cycles and lets clients overwrite fields they shouldn''t (over-posting).', 'إرجاع الكيانات مباشرة يسرّب الحقول الداخلية، ويسبب حلقات في JSON، ويسمح للعملاء بتعديل حقول لا يجب تعديلها (Over-posting).', 'Define request DTOs (CreateProductRequest) and response DTOs (ProductDto) as records. Map with a Select projection so EF Core reads only the needed columns.', 'عرّف DTOs للطلبات (CreateProductRequest) وأخرى للاستجابات (ProductDto) كـ Records، وحوّل البيانات باستخدام Select لكي يقرأ EF Core الأعمدة المطلوبة فقط.', 'The User entity has PasswordHash; UserDto has only Id, Name and Email.', 'يحتوي الكيان User على PasswordHash، بينما يحتوي UserDto على Id وName وEmail فقط.', '// Entity (database shape) — never returned directly
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool IsAdmin { get; set; }
}

// DTOs (API contract)
public record UserDto(int Id, string Email);
public record UpdateProfileRequest(string Email);   // no IsAdmin → no over-posting

// Projection: EF Core selects only Id and Email
var users = await db.Users
    .Select(u => new UserDto(u.Id, u.Email))
    .ToListAsync(ct);', 'csharp', 'Create CreateProductRequest, UpdateProductRequest and ProductDto records for your inventory API.', 'أنشئ Records باسم CreateProductRequest وUpdateProductRequest وProductDto لواجهة المخزون.', 'Demonstrate an over-posting bug by binding directly to an entity, then fix it with a DTO.', 'أظهر خطأ Over-posting بربط الطلب مباشرة بكيان، ثم أصلحه باستخدام DTO.'),
  (37, 'api-validation', 4, 8, 'AspNetCore', 'Core', 40, 'Validation', 'التحقق من صحة البيانات (Validation)', 'Validate every request: data annotations ([Required], [Range], [MaxLength]) for shape, and service-level checks for business rules.', 'تحقق من كل طلب: استخدم Data annotations ([Required] و[Range] و[MaxLength]) لشكل البيانات، وتحققات على مستوى الخدمة لقواعد العمل.', 'Never trust the client. The browser can be bypassed with any HTTP tool, so the API is the last line of defence — just like database constraints.', 'لا تثق بالعميل أبدًا. يمكن تجاوز المتصفح بأي أداة HTTP، لذا فالـ API هو خط الدفاع الأخير، تمامًا مثل قيود قاعدة البيانات.', 'With [ApiController], invalid models return 400 with a ValidationProblemDetails body automatically. Use IValidatableObject for cross-field rules and return field errors the UI can show.', 'مع [ApiController] تُرجع النماذج غير الصالحة 400 تلقائيًا مع محتوى ValidationProblemDetails. استخدم IValidatableObject للقواعد بين الحقول، وأرجع أخطاء الحقول التي يمكن للواجهة عرضها.', 'In DevPath, NoteRequest uses [Required, MaxLength(200)] on Title and IValidatableObject to forbid linking a note to two items at once.', 'في DevPath يستخدم NoteRequest السمتين [Required, MaxLength(200)] على Title، وIValidatableObject لمنع ربط الملاحظة بعنصرين في الوقت نفسه.', 'public record CreateProductRequest(
    [Required, MaxLength(100)] string? Name,
    [Range(0.01, 1_000_000)] decimal Price,
    [Range(0, int.MaxValue)] int Stock,
    decimal? DiscountPrice) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (DiscountPrice >= Price)
            yield return new ValidationResult("Discount price must be lower than price.", [nameof(DiscountPrice)]);
    }
}

// With [ApiController], an invalid body never reaches your action:
// 400 { "title": "One or more validation errors occurred.",
//       "errors": { "Name": ["The Name field is required."] } }', 'csharp', 'Add validation to CreateProductRequest: name required (max 100), price > 0, stock >= 0. Test with invalid JSON.', 'أضف التحقق إلى CreateProductRequest: الاسم مطلوب (100 حرف كحد أقصى)، والسعر > 0، والمخزون >= 0. واختبر بإرسال JSON غير صالح.', 'Add a rule that DiscountPrice must be lower than Price, and show the error next to the right field in the UI.', 'أضف قاعدة أن DiscountPrice يجب أن يكون أقل من Price، واعرض الخطأ بجوار الحقل الصحيح في الواجهة.'),
  (38, 'api-status-codes', 4, 9, 'AspNetCore', 'Core', 30, 'HTTP status codes', 'رموز حالة HTTP', 'Status codes tell the client what happened: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401/403, 404 Not Found, 409 Conflict, 500 Server Error.', 'تخبر رموز الحالة العميل بما حدث: 200 OK، و201 Created، و204 No Content، و400 Bad Request، و401/403، و404 Not Found، و409 Conflict، و500 Server Error.', 'Correct status codes let the frontend react properly (show a form error vs a ''not found'' page) and make logs and monitoring meaningful.', 'رموز الحالة الصحيحة تتيح للواجهة التفاعل بشكل مناسب (عرض خطأ في النموذج أو صفحة غير موجود)، وتجعل السجلات والمراقبة ذات معنى.', 'Return ActionResult<T>: Ok(dto), CreatedAtAction(...), NoContent(), NotFound(), Conflict(). 4xx = the client''s fault, 5xx = the server''s fault.', 'أرجع ActionResult<T>: Ok(dto) وCreatedAtAction(...) وNoContent() وNotFound() وConflict(). الرموز 4xx خطأ العميل، و5xx خطأ الخادم.', 'Revealing a practice solution before writing an attempt returns 409 Conflict with code ''attempt_required'' in DevPath.', 'محاولة كشف حل تمرين قبل كتابة محاولتك تُرجع 409 Conflict مع الرمز attempt_required في DevPath.', '[HttpPut("{id:int}")]
public async Task<IActionResult> Update(int id, UpdateProductRequest request, CancellationToken ct)
{
    var product = await db.Products.FindAsync([id], ct);
    if (product is null) return NotFound();                         // 404

    if (product.IsArchived)
        return Conflict(new { code = "product_archived" });         // 409

    product.Name = request.Name;
    await db.SaveChangesAsync(ct);
    return NoContent();                                             // 204
}

// 200 Ok(body)      201 Created(location, body)   204 NoContent()
// 400 validation    401 not logged in   403 not allowed   404 not found
// 409 conflict      500 unexpected server error', 'csharp', 'Make your POST endpoint return 201 with a Location header and your DELETE endpoint return 204.', 'اجعل نقطة POST تُرجع 201 مع رأس Location، ونقطة DELETE تُرجع 204.', 'List five situations in an order API and the correct status code for each, with a one-line justification.', 'اذكر خمس حالات في واجهة طلبات ورمز الحالة الصحيح لكل منها، مع تبرير في سطر واحد.'),
  (39, 'api-error-handling', 4, 10, 'AspNetCore', 'Core', 40, 'Error handling and ProblemDetails', 'معالجة الأخطاء وProblemDetails', 'Handle exceptions in one place and return consistent RFC 7807 ProblemDetails responses, without leaking stack traces to users.', 'عالج الاستثناءات في مكان واحد وأرجع استجابات ProblemDetails متسقة وفق RFC 7807، دون تسريب Stack traces للمستخدمين.', 'A consistent error format means the frontend needs only one error handler, and central handling guarantees every error is logged.', 'صيغة الأخطاء الموحدة تعني أن الواجهة تحتاج إلى معالج أخطاء واحد فقط، والمعالجة المركزية تضمن تسجيل كل خطأ.', 'AddProblemDetails() + an IExceptionHandler + app.UseExceptionHandler(). Map your own exceptions (NotFoundException → 404) and log unexpected ones as errors.', 'استخدم AddProblemDetails() مع IExceptionHandler وapp.UseExceptionHandler(). حوّل استثناءاتك الخاصة (NotFoundException → 404) وسجّل الاستثناءات غير المتوقعة كأخطاء.', 'DevPath''s Middleware/GlobalExceptionHandler.cs maps domain exceptions to 404, 409 and 400 and returns a ''code'' the UI translates to Arabic or English.', 'يحوّل الملف Middleware/GlobalExceptionHandler.cs في DevPath استثناءات المجال إلى 404 و409 و400، ويُرجع رمزًا code تترجمه الواجهة إلى العربية أو الإنجليزية.', 'public class NotFoundException(string entity, object id) : Exception($"{entity} ''{id}'' was not found.");

public class GlobalExceptionHandler(IProblemDetailsService problems, ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            NotFoundException => (404, "Not found"),
            _ => (500, "An unexpected error occurred.")
        };
        if (status == 500) logger.LogError(ex, "Unhandled exception");

        context.Response.StatusCode = status;
        return await problems.TryWriteAsync(new() { HttpContext = context, ProblemDetails = { Status = status, Title = title } });
    }
}

// Program.cs
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
app.UseExceptionHandler();', 'csharp', 'Throw a NotFoundException from a service and make it produce a 404 ProblemDetails response.', 'ارمِ NotFoundException من خدمة واجعله ينتج استجابة ProblemDetails برمز 404.', 'Add a traceId to every error response and show how to find the matching log entry.', 'أضف traceId إلى كل استجابة خطأ، ووضّح كيف تجد سجل الأحداث المطابق.'),
  (40, 'api-middleware', 4, 11, 'AspNetCore', 'Important', 40, 'Middleware and the request pipeline', 'الـ Middleware ومسار الطلب', 'Middleware components form a pipeline: each one can inspect the request, call the next component, and inspect the response on the way back.', 'تشكّل مكونات الـ Middleware مسارًا: يمكن لكل مكون فحص الطلب، واستدعاء المكون التالي، وفحص الاستجابة في طريق العودة.', 'Authentication, CORS, error handling and logging are all middleware. Order matters: authentication must run before authorization.', 'المصادقة وCORS ومعالجة الأخطاء والتسجيل كلها Middleware، والترتيب مهم: يجب أن تعمل المصادقة قبل التفويض.', 'app.Use... calls run in registration order. A custom middleware is a class with InvokeAsync(HttpContext) that awaits next(context).', 'تعمل استدعاءات app.Use... بترتيب تسجيلها. والـ Middleware المخصص هو Class يحتوي على InvokeAsync(HttpContext) وينتظر next(context).', 'DevPath''s RequestTimingMiddleware logs every request with its status code and duration, warning on requests slower than 500 ms.', 'يسجّل RequestTimingMiddleware في DevPath كل طلب مع رمز حالته ومدته، ويحذّر عند الطلبات الأبطأ من 500 مللي ثانية.', 'public class RequestIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var id = Guid.NewGuid().ToString("N");
        context.Response.Headers["X-Request-Id"] = id;   // before the response starts
        await next(context);                              // call the rest of the pipeline
        // code here runs on the way back out
    }
}

app.UseMiddleware<RequestIdMiddleware>();

// Inline middleware
app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();
    await next();
    Console.WriteLine($"{context.Request.Path} took {sw.ElapsedMilliseconds} ms");
});', 'csharp', 'Write a middleware that adds an X-Request-Id header to every response.', 'اكتب Middleware يضيف الرأس X-Request-Id إلى كل استجابة.', 'Move UseCors after MapControllers in a test project and explain the resulting browser error.', 'انقل UseCors بعد MapControllers في مشروع تجريبي واشرح خطأ المتصفح الناتج.'),
  (41, 'api-logging', 4, 12, 'AspNetCore', 'Important', 35, 'Logging', 'تسجيل الأحداث (Logging)', 'ILogger<T> writes structured log messages with levels (Trace → Critical). Message templates keep values as searchable properties.', 'يكتب ILogger<T> رسائل سجل منظمة بمستويات (من Trace إلى Critical)، وتحافظ قوالب الرسائل على القيم كخصائص قابلة للبحث.', 'Logs are how you investigate production problems you can''t reproduce locally. Good logs answer: what happened, to which record, and how long it took.', 'السجلات هي وسيلتك للتحقيق في مشكلات الإنتاج التي لا يمكنك إعادة إنتاجها محليًا. والسجلات الجيدة تجيب: ماذا حدث، ولأي سجل، وكم استغرق.', 'Inject ILogger<T> and use templates: logger.LogInformation("Order {OrderId} placed", id) — not string interpolation. Configure minimum levels per category in appsettings.json.', 'احقن ILogger<T> واستخدم القوالب: logger.LogInformation("Order {OrderId} placed", id) وليس String interpolation. واضبط الحد الأدنى للمستويات لكل فئة في appsettings.json.', 'Setting ''Microsoft.EntityFrameworkCore.Database.Command'' to Information prints every SQL statement EF Core runs.', 'ضبط الفئة Microsoft.EntityFrameworkCore.Database.Command على Information يطبع كل جملة SQL ينفذها EF Core.', 'public class ProductService(AppDbContext db, ILogger<ProductService> logger)
{
    public async Task RemoveStockAsync(int productId, int quantity, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([productId], ct)
            ?? throw new NotFoundException("Product", productId);

        product.Stock -= quantity;
        await db.SaveChangesAsync(ct);

        // ✅ message template: ProductId and Stock become searchable properties
        logger.LogInformation("Removed {Quantity} from product {ProductId}", quantity, productId);
        if (product.Stock < 5)
            logger.LogWarning("Product {ProductId} is low on stock ({Stock})", productId, product.Stock);

        // ❌ logger.LogInformation($"Removed {quantity} from {productId}");
    }
}', 'csharp', 'Add Information logs for created/updated products and a Warning when stock drops below 5.', 'أضف سجلات Information لإنشاء المنتجات وتحديثها، وسجل Warning عندما ينخفض المخزون عن 5.', 'Enable EF Core SQL logging and use it to find the query behind a slow endpoint.', 'فعّل تسجيل SQL في EF Core واستخدمه لاكتشاف الاستعلام المسؤول عن نقطة نهاية بطيئة.'),
  (42, 'api-authentication', 4, 13, 'AspNetCore', 'Core', 60, 'Authentication (JWT basics)', 'المصادقة (أساسيات JWT)', 'Authentication answers ''who are you?''. APIs commonly use bearer tokens (JWT): the client sends Authorization: Bearer <token> and the API validates its signature.', 'تجيب المصادقة عن سؤال: من أنت؟ وتستخدم الواجهات عادةً رموز Bearer (JWT): يرسل العميل Authorization: Bearer <token> ويتحقق الـ API من توقيعه.', 'Almost every business application has users. You need to understand tokens, claims and the authentication middleware even when a provider issues the tokens.', 'كل تطبيق أعمال تقريبًا لديه مستخدمون، وتحتاج إلى فهم الرموز والـ Claims ووسيط المصادقة حتى لو كان مزود خارجي هو من يصدر الرموز.', 'AddAuthentication().AddJwtBearer(...) validates issuer, audience, lifetime and signing key. app.UseAuthentication() populates HttpContext.User with claims.', 'تتحقق AddAuthentication().AddJwtBearer(...) من المُصدر والجمهور والصلاحية الزمنية ومفتاح التوقيع، ويملأ app.UseAuthentication() الكائن HttpContext.User بالـ Claims.', 'A login endpoint verifies a password hash and issues a 1-hour JWT containing the user id and role claims.', 'نقطة نهاية لتسجيل الدخول تتحقق من Hash كلمة المرور وتصدر JWT صالحًا لساعة واحدة يحتوي على معرف المستخدم ودوره كـ Claims.', 'builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))   // from user secrets!
        };
    });

app.UseAuthentication();   // reads "Authorization: Bearer <token>"
app.UseAuthorization();

// Inside a controller
var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);', 'csharp', 'Decode a sample JWT at jwt.io (never paste real tokens) and identify the header, payload and signature.', 'فك ترميز JWT تجريبي في jwt.io (لا تلصق رموزًا حقيقية أبدًا) وحدد الـ Header والـ Payload والتوقيع.', 'Add JWT authentication to Project 4 with a hard-coded demo user and protect the orders endpoints.', 'أضف مصادقة JWT إلى المشروع الرابع بمستخدم تجريبي ثابت، واحمِ نقاط نهاية الطلبات.'),
  (43, 'api-authorization', 4, 14, 'AspNetCore', 'Core', 40, 'Authorization: roles and policies', 'التفويض: الأدوار والسياسات', 'Authorization answers ''are you allowed to do this?''. Use [Authorize], roles ([Authorize(Roles = "Admin")]) and policies built from claims.', 'يجيب التفويض عن سؤال: هل يُسمح لك بفعل هذا؟ استخدم [Authorize] والأدوار ([Authorize(Roles = "Admin")]) والسياسات المبنية على الـ Claims.', 'Most security bugs are authorization bugs: a user reading another user''s orders because the API only checked that they were logged in.', 'معظم الثغرات الأمنية أخطاء تفويض: مستخدم يقرأ طلبات مستخدم آخر لأن الـ API تحقق فقط من أنه سجّل الدخول.', 'Unauthenticated → 401, authenticated but not allowed → 403. Policies (AddAuthorization(o => o.AddPolicy(...))) express rules; resource checks verify ownership in the service.', 'غير المصادق عليه يحصل على 401، والمصادق عليه غير المسموح له يحصل على 403. تعبّر السياسات (AddAuthorization(o => o.AddPolicy(...))) عن القواعد، وتتحقق فحوص الموارد من الملكية داخل الخدمة.', 'Only ''Manager'' can cancel shipped orders; a customer can only GET /api/orders/{id} for their own orders.', 'فقط المدير Manager يمكنه إلغاء الطلبات المشحونة، والعميل يمكنه فقط طلب GET /api/orders/{id} لطلباته الخاصة.', 'builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanCancelShipped", p => p.RequireRole("Manager"));
});

[Authorize]                                    // must be logged in (else 401)
[ApiController, Route("api/orders")]
public class OrdersController(OrderService orders) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> Get(int id, CancellationToken ct)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // Resource check: only your own orders
        var order = await orders.FindForUserAsync(id, userId, ct);
        return order is null ? NotFound() : order;
    }

    [Authorize(Policy = "CanCancelShipped")]   // logged in but not Manager → 403
    [HttpPost("{id:int}/cancel")]
    public Task Cancel(int id, CancellationToken ct) => orders.CancelAsync(id, ct);
}', 'csharp', 'Protect a controller with [Authorize] and allow one action with [AllowAnonymous].', 'احمِ وحدة تحكم بـ [Authorize] واسمح لإجراء واحد بـ [AllowAnonymous].', 'Write an integration test proving a user receives 404 (not 403) when requesting another user''s order, and justify the choice.', 'اكتب اختبار تكامل يثبت أن المستخدم يتلقى 404 (وليس 403) عند طلب طلبية مستخدم آخر، وبرّر هذا الاختيار.'),
  (44, 'api-versioning', 4, 15, 'AspNetCore', 'Optional', 25, 'API versioning concepts', 'مفاهيم إصدارات الـ API', 'Versioning lets you change an API without breaking existing clients, via URL segments (/api/v2/...), query strings or headers.', 'تتيح الإصدارات تغيير الـ API دون كسر العملاء الحاليين، عبر مقاطع في العنوان (/api/v2/...) أو Query string أو الرؤوس.', 'Once a mobile app or another team depends on your API, renaming a field becomes a breaking change. Teams need a strategy.', 'بمجرد أن يعتمد تطبيق جوال أو فريق آخر على الـ API، يصبح تغيير اسم حقل تغييرًا كاسرًا، وتحتاج الفرق إلى استراتيجية.', 'Prefer additive, non-breaking changes. When breaking changes are unavoidable, publish a new version, keep the old one for a deprecation period and document the differences.', 'فضّل التغييرات الإضافية غير الكاسرة. وعندما يكون التغيير الكاسر حتميًا، انشر إصدارًا جديدًا، واحتفظ بالقديم لفترة إيقاف تدريجي، ووثّق الفروق.', 'Adding a new optional field is safe; changing ''price'' from a number to an object requires a v2.', 'إضافة حقل اختياري جديد آمنة، أما تغيير price من رقم إلى كائن فيتطلب إصدارًا ثانيًا v2.', 'Non-breaking (safe) changes
  + add a new endpoint
  + add an optional request field
  + add a new field to a response

Breaking changes (need a new version)
  - rename or remove a field            qty  -> quantity
  - change a field''s type               price: 10.5 -> price: { amount, currency }
  - make an optional field required
  - change the meaning of a status code

URL versioning example
  GET /api/v1/orders/42   -> { "qty": 3 }
  GET /api/v2/orders/42   -> { "quantity": 3 }', 'text', 'Classify ten example API changes as breaking or non-breaking.', 'صنّف عشرة أمثلة لتغييرات API إلى كاسرة وغير كاسرة.', 'Write a short deprecation plan for renaming ''qty'' to ''quantity'' in an order endpoint.', 'اكتب خطة إيقاف تدريجي قصيرة لتغيير اسم qty إلى quantity في نقطة نهاية الطلبات.'),
  (45, 'api-pagination', 4, 16, 'AspNetCore', 'Core', 35, 'Pagination', 'تقسيم النتائج إلى صفحات (Pagination)', 'Return large lists in pages (page + pageSize, or a cursor) together with the total count, instead of every row at once.', 'أرجع القوائم الكبيرة على صفحات (page وpageSize أو Cursor) مع العدد الإجمالي، بدلًا من إرجاع كل الصفوف دفعة واحدة.', 'An endpoint returning 50,000 rows is slow, wastes memory and freezes the browser. Pagination is expected in every list API.', 'نقطة نهاية تُرجع 50,000 صف بطيئة وتهدر الذاكرة وتجمّد المتصفح. والتقسيم إلى صفحات متوقع في كل واجهة قوائم.', 'Apply OrderBy, then Skip((page - 1) * size).Take(size) — EF Core turns this into OFFSET/FETCH. Clamp pageSize to a maximum and always sort deterministically.', 'طبّق OrderBy ثم Skip((page - 1) * size).Take(size)، وسيحوّل EF Core ذلك إلى OFFSET/FETCH. وحدد قيمة قصوى لـ pageSize ورتّب دائمًا بشكل حتمي.', 'GET /api/topics?page=2&pageSize=20 in DevPath returns a PagedResult with items, page, pageSize, totalCount and totalPages.', 'الطلب GET /api/topics?page=2&pageSize=20 في DevPath يُرجع PagedResult يحتوي على العناصر والصفحة وحجمها والعدد الإجمالي وعدد الصفحات.', 'public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public async Task<PagedResult<ProductDto>> ListAsync(int page, int pageSize, CancellationToken ct)
{
    page = Math.Max(1, page);
    pageSize = Math.Clamp(pageSize, 1, 100);     // never let a client ask for 1,000,000 rows

    var query = db.Products.AsNoTracking();
    var total = await query.CountAsync(ct);

    var items = await query
        .OrderBy(p => p.Name).ThenBy(p => p.Id)  // deterministic order
        .Skip((page - 1) * pageSize)             // OFFSET
        .Take(pageSize)                          // FETCH NEXT
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .ToListAsync(ct);

    return new PagedResult<ProductDto>(items, page, pageSize, total);
}', 'csharp', 'Add pagination to your products endpoint and return a PagedResult<ProductDto>.', 'أضف التقسيم إلى صفحات لنقطة نهاية المنتجات، وأرجع PagedResult<ProductDto>.', 'Explain why OFFSET pagination gets slower on deep pages and sketch keyset (seek) pagination instead.', 'اشرح لماذا يصبح التقسيم بـ OFFSET أبطأ في الصفحات العميقة، وارسم بديل Keyset (Seek) pagination.'),
  (46, 'api-filtering', 4, 17, 'AspNetCore', 'Core', 30, 'Filtering', 'التصفية (Filtering)', 'Accept optional query parameters (?categoryId=3&minPrice=10&q=mouse) and add Where clauses only for the filters that were supplied.', 'استقبل معاملات استعلام اختيارية (?categoryId=3&minPrice=10&q=mouse) وأضف شروط Where فقط للمرشحات التي أُرسلت.', 'Filtering on the server keeps responses small and fast and avoids sending all data to the browser.', 'التصفية على الخادم تُبقي الاستجابات صغيرة وسريعة وتتجنب إرسال كل البيانات إلى المتصفح.', 'Build an IQueryable step by step: if (categoryId is not null) query = query.Where(...). EF Core produces one SQL query with parameters for the active filters.', 'ابنِ IQueryable خطوة بخطوة: if (categoryId is not null) query = query.Where(...). وسينتج EF Core استعلام SQL واحدًا بمعاملات للمرشحات المفعّلة فقط.', 'DevPath''s TopicService.SearchAsync composes filters for text, skill, phase, priority and status the same way.', 'تبني الدالة TopicService.SearchAsync في DevPath المرشحات للنص والمهارة والمرحلة والأولوية والحالة بالطريقة نفسها.', 'public record ProductQuery(string? Q, int? CategoryId, decimal? MinPrice, decimal? MaxPrice);

IQueryable<Product> query = db.Products.AsNoTracking();

if (!string.IsNullOrWhiteSpace(filter.Q))
    query = query.Where(p => p.Name.Contains(filter.Q));    // LIKE @p0 (parameterised)
if (filter.CategoryId is { } categoryId)
    query = query.Where(p => p.CategoryId == categoryId);
if (filter.MinPrice is { } min)
    query = query.Where(p => p.Price >= min);
if (filter.MaxPrice is { } max)
    query = query.Where(p => p.Price <= max);

// Still ONE SQL statement, with only the active filters in its WHERE clause
var results = await query.Take(50).ToListAsync(ct);', 'csharp', 'Add category, price range and text search filters to your products endpoint.', 'أضف مرشحات الفئة ونطاق السعر والبحث النصي إلى نقطة نهاية المنتجات.', 'Check the generated SQL for three filter combinations and confirm each value is sent as a parameter.', 'افحص SQL الناتج لثلاث تركيبات من المرشحات، وتأكد أن كل قيمة تُرسل كمعامل.'),
  (47, 'api-sorting', 4, 18, 'AspNetCore', 'Important', 25, 'Sorting', 'الترتيب (Sorting)', 'Let clients choose the sort column and direction (?sortBy=price&desc=true) using an allow-list of sortable fields.', 'اسمح للعملاء باختيار عمود الترتيب واتجاهه (?sortBy=price&desc=true) باستخدام قائمة مسموحة من الحقول القابلة للترتيب.', 'Tables in the UI need sorting, and sorting must happen before pagination on the server — otherwise you only sort one page.', 'تحتاج الجداول في الواجهة إلى الترتيب، ويجب أن يتم الترتيب قبل التقسيم إلى صفحات على الخادم، وإلا فأنت ترتّب صفحة واحدة فقط.', 'Map the sortBy string to an expression with a switch (never build SQL from it). Add a unique tie-breaker (ThenBy(Id)) so pages are stable.', 'حوّل النص sortBy إلى تعبير باستخدام switch (ولا تبنِ SQL منه أبدًا). وأضف عامل ترتيب ثانويًا فريدًا (ThenBy(Id)) لتكون الصفحات مستقرة.', 'sortBy switch { "price" => q.OrderBy(p => p.Price), "name" => q.OrderBy(p => p.Name), _ => q.OrderBy(p => p.Id) }', 'التعبير sortBy switch { "price" => q.OrderBy(p => p.Price), "name" => q.OrderBy(p => p.Name), _ => q.OrderBy(p => p.Id) }', 'IQueryable<Product> ApplySort(IQueryable<Product> q, string? sortBy, bool desc) =>
    (sortBy?.ToLowerInvariant(), desc) switch
    {
        ("price", false) => q.OrderBy(p => p.Price).ThenBy(p => p.Id),
        ("price", true)  => q.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
        ("stock", false) => q.OrderBy(p => p.Stock).ThenBy(p => p.Id),
        ("stock", true)  => q.OrderByDescending(p => p.Stock).ThenBy(p => p.Id),
        (_, true)        => q.OrderByDescending(p => p.Name).ThenBy(p => p.Id),
        _                => q.OrderBy(p => p.Name).ThenBy(p => p.Id)   // allow-list default
    };

// Sort BEFORE paging, otherwise you only sort the current page
var page = await ApplySort(query, sortBy, desc).Skip(skip).Take(size).ToListAsync(ct);', 'csharp', 'Support sorting by name, price and stock in both directions on your products endpoint.', 'ادعم الترتيب حسب الاسم والسعر والمخزون في الاتجاهين في نقطة نهاية المنتجات.', 'Show how two products with the same price can jump between pages without a tie-breaker, and fix it.', 'وضّح كيف يمكن لمنتجين بنفس السعر أن ينتقلا بين الصفحات بدون عامل ترتيب ثانوي، ثم أصلح ذلك.'),
  (48, 'ef-dbcontext', 5, 1, 'EfCore', 'Core', 40, 'DbContext', 'الـ DbContext', 'DbContext is your session with the database: it opens connections, tracks changes to entities and saves them as one unit of work.', 'الـ DbContext هو جلستك مع قاعدة البيانات: يفتح الاتصالات، ويتتبع التغييرات على الكيانات، ويحفظها كوحدة عمل واحدة.', 'Every EF Core operation goes through a DbContext. Understanding its lifetime (one per request) avoids threading bugs and stale data.', 'كل عملية في EF Core تمر عبر DbContext، وفهم عمره (واحد لكل طلب) يجنّبك أخطاء الـ Threads والبيانات القديمة.', 'Create a class deriving from DbContext with DbSet properties, configure the model in OnModelCreating and register it with AddDbContext (scoped).', 'أنشئ Class يرث من DbContext يحتوي على خصائص DbSet، واضبط النموذج في OnModelCreating، وسجّله بـ AddDbContext (Scoped).', 'DevPath''s AppDbContext configures unique indexes, check constraints and delete behaviours for 21 tables.', 'يضبط AppDbContext في DevPath الفهارس الفريدة وقيود CHECK وسلوك الحذف لـ 21 جدولًا.', 'public class InventoryDbContext(DbContextOptions<InventoryDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().Property(p => p.Name).HasMaxLength(100);
    }
}

// Program.cs — registered as Scoped (one instance per HTTP request)
builder.Services.AddDbContext<InventoryDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Inventory")));', 'csharp', 'Create an InventoryDbContext with Products and Categories and register it with a LocalDB connection string.', 'أنشئ InventoryDbContext يحتوي على Products وCategories، وسجّله بسلسلة اتصال LocalDB.', 'Explain why DbContext is not thread-safe and what happens if two tasks use the same instance at once.', 'اشرح لماذا لا يكون DbContext آمنًا للاستخدام من عدة Threads، وماذا يحدث إذا استخدمت مهمتان النسخة نفسها في الوقت ذاته.'),
  (49, 'ef-dbset', 5, 2, 'EfCore', 'Core', 25, 'DbSet', 'الـ DbSet', 'A DbSet<T> represents a table you can query with LINQ and add to or remove from.', 'يمثل DbSet<T> جدولًا يمكنك الاستعلام عنه بـ LINQ والإضافة إليه أو الحذف منه.', 'DbSets are the entry point for every query. Knowing which operations hit the database (and when) is essential for performance.', 'الـ DbSets نقطة البداية لكل استعلام، ومعرفة العمليات التي تصل إلى قاعدة البيانات (ومتى) أمر أساسي للأداء.', 'db.Products is an IQueryable<Product>. Add/Remove only change the tracker; SaveChangesAsync sends the SQL. FindAsync checks the tracker first, then the database.', 'التعبير db.Products هو IQueryable<Product>. الدالتان Add/Remove تغيّران المتتبع فقط، وSaveChangesAsync ترسل SQL. أما FindAsync فتبحث في المتتبع أولًا ثم في قاعدة البيانات.', 'db.Products.Add(p); does nothing in SQL Server until await db.SaveChangesAsync();', 'الأمر db.Products.Add(p); لا يفعل شيئًا في SQL Server حتى تستدعي await db.SaveChangesAsync();', '// Nothing is sent to SQL Server yet
db.Products.Add(new Product { Name = "Keyboard", Price = 49.99m, Stock = 10 });
db.Products.Add(new Product { Name = "Mouse", Price = 19.99m, Stock = 25 });

// One round trip: INSERT ... ; INSERT ... ; (in a transaction)
await db.SaveChangesAsync(ct);

// Queries run when materialised
var cheap = await db.Products.Where(p => p.Price < 30).ToListAsync(ct);

// FindAsync returns a tracked entity without a query if it''s already loaded
var product = await db.Products.FindAsync([id], ct);', 'csharp', 'Add three products, save, query them back and print their generated Ids.', 'أضف ثلاثة منتجات، واحفظها، ثم استعلم عنها واطبع المعرفات المولّدة لها.', 'Compare FindAsync with FirstOrDefaultAsync(p => p.Id == id) using SQL logging and explain the difference.', 'قارن FindAsync بـ FirstOrDefaultAsync(p => p.Id == id) باستخدام تسجيل SQL، واشرح الفرق.'),
  (50, 'ef-entities', 5, 3, 'EfCore', 'Core', 40, 'Entities and model configuration', 'الكيانات وضبط النموذج', 'Entities are classes mapped to tables. Conventions infer keys and columns; the Fluent API configures lengths, indexes, precision and constraints.', 'الكيانات أصناف مرتبطة بالجداول. تستنتج الاصطلاحات المفاتيح والأعمدة، ويضبط Fluent API الأطوال والفهارس والدقة والقيود.', 'You know what a good schema looks like. EF Core lets you express it in C#: nvarchar(200) instead of nvarchar(max), DECIMAL(18,2), unique indexes.', 'أنت تعرف شكل المخطط الجيد، ويتيح لك EF Core التعبير عنه بـ C#: nvarchar(200) بدلًا من nvarchar(max)، وDECIMAL(18,2)، والفهارس الفريدة.', 'A property named Id is the key. In OnModelCreating use HasMaxLength, HasPrecision, HasIndex(...).IsUnique() and ToTable(t => t.HasCheckConstraint(...)).', 'الخاصية المسماة Id هي المفتاح. في OnModelCreating استخدم HasMaxLength وHasPrecision وHasIndex(...).IsUnique() وToTable(t => t.HasCheckConstraint(...)).', 'Product.Price is configured with HasPrecision(18, 2) so SQL Server stores DECIMAL(18,2), not the default.', 'تُضبط الخاصية Product.Price بـ HasPrecision(18, 2) ليخزنها SQL Server كـ DECIMAL(18,2) بدلًا من القيمة الافتراضية.', 'public class Product
{
    public int Id { get; set; }                 // primary key by convention
    public string Name { get; set; } = "";
    public string Sku { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

protected override void OnModelCreating(ModelBuilder b)
{
    b.Entity<Product>(e =>
    {
        e.Property(p => p.Name).HasMaxLength(100).IsRequired();   // nvarchar(100) NOT NULL
        e.Property(p => p.Sku).HasMaxLength(20);
        e.HasIndex(p => p.Sku).IsUnique();                         // UNIQUE index
        e.Property(p => p.Price).HasPrecision(18, 2);              // decimal(18,2)
        e.ToTable(t => t.HasCheckConstraint("CK_Product_Stock", "Stock >= 0"));
    });
}', 'csharp', 'Configure Product: Name max 100 and required, Sku unique, Price DECIMAL(18,2), Stock >= 0 check constraint.', 'اضبط Product: الاسم مطلوب وطوله 100 كحد أقصى، والـ Sku فريد، والسعر DECIMAL(18,2)، وقيد CHECK للمخزون >= 0.', 'Generate a migration and compare the CREATE TABLE script with the one you would have written by hand.', 'أنشئ Migration وقارن سكربت CREATE TABLE الناتج بالسكربت الذي كنت ستكتبه يدويًا.'),
  (51, 'ef-migrations', 5, 4, 'EfCore', 'Core', 45, 'Migrations', 'الترحيلات (Migrations)', 'Migrations are versioned C# files that evolve the database schema to match your model. They are applied with ''dotnet ef database update''.', 'الـ Migrations ملفات C# ذات إصدارات تطوّر مخطط قاعدة البيانات ليطابق نموذجك، وتُطبَّق بالأمر dotnet ef database update.', 'They replace hand-run ALTER scripts with a repeatable history in Git, so every developer and environment has the same schema.', 'تستبدل سكربتات ALTER اليدوية بسجل قابل للتكرار في Git، فيحصل كل مطور وكل بيئة على المخطط نفسه.', 'Change the model → ''dotnet ef migrations add Name'' → review the Up/Down code → ''dotnet ef database update''. EF records applied migrations in __EFMigrationsHistory.', 'غيّر النموذج ← نفّذ dotnet ef migrations add Name ← راجع كود Up/Down ← نفّذ dotnet ef database update. ويسجل EF الـ Migrations المطبقة في الجدول __EFMigrationsHistory.', 'Adding a Barcode property creates a migration with AddColumn; ''dotnet ef migrations script'' produces the SQL a DBA can review.', 'إضافة خاصية Barcode تنتج Migration تحتوي على AddColumn، والأمر dotnet ef migrations script يُنتج SQL يمكن لمسؤول قاعدة البيانات مراجعته.', '# Install the tool once
dotnet tool install --global dotnet-ef

# After changing the model
dotnet ef migrations add AddProductBarcode
#   → Migrations/20261019_AddProductBarcode.cs  (review Up() and Down()!)

dotnet ef database update            # apply pending migrations
dotnet ef migrations list            # see applied / pending
dotnet ef migrations script --idempotent -o deploy.sql   # SQL for a DBA to review

# Undo the last (unapplied) migration
dotnet ef migrations remove', 'bash', 'Create the initial migration for your inventory model, apply it, and inspect the tables in SSMS.', 'أنشئ الـ Migration الأولى لنموذج المخزون، وطبّقها، وافحص الجداول في SSMS.', 'Rename a column and make sure the migration renames it instead of dropping and re-adding (data loss!).', 'غيّر اسم عمود وتأكد أن الـ Migration تعيد تسميته بدلًا من حذفه وإضافته من جديد (فقدان بيانات!).'),
  (52, 'ef-relationships', 5, 5, 'EfCore', 'Core', 50, 'Relationships', 'العلاقات (Relationships)', 'One-to-many, one-to-one and many-to-many relationships are expressed with navigation properties and foreign keys.', 'يُعبَّر عن علاقات واحد-إلى-متعدد وواحد-إلى-واحد ومتعدد-إلى-متعدد بخصائص التنقل (Navigation properties) والمفاتيح الأجنبية.', 'Orders have lines, products have categories. Configuring them correctly gives you proper foreign keys, indexes and delete behaviour.', 'للطلبات أسطر، وللمنتجات فئات، وضبط العلاقات بشكل صحيح يمنحك مفاتيح أجنبية وفهارس وسلوك حذف سليمًا.', 'Add CategoryId and a Category navigation on Product, plus List<Product> on Category. Use HasOne/WithMany/HasForeignKey and choose OnDelete (Cascade, Restrict, SetNull).', 'أضف CategoryId وخاصية التنقل Category في Product، وأضف List<Product> في Category. استخدم HasOne/WithMany/HasForeignKey واختر OnDelete (Cascade أو Restrict أو SetNull).', 'SQL Server rejects multiple cascade paths; DevPath sets Restrict on TopicPrerequisite.PrerequisiteTopicId for exactly that reason.', 'يرفض SQL Server مسارات الحذف المتتالي المتعددة، ولهذا السبب تحديدًا يضبط DevPath السلوك Restrict على TopicPrerequisite.PrerequisiteTopicId.', 'public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Product> Products { get; set; } = [];
}

public class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }            // foreign key
    public Category Category { get; set; } = null!; // navigation
    public List<ProductSupplier> Suppliers { get; set; } = [];
}

// Explicit join entity for many-to-many with extra data
public class ProductSupplier
{
    public int ProductId { get; set; }
    public int SupplierId { get; set; }
    public decimal SupplierPrice { get; set; }
}

b.Entity<Product>()
    .HasOne(p => p.Category).WithMany(c => c.Products)
    .HasForeignKey(p => p.CategoryId)
    .OnDelete(DeleteBehavior.Restrict);           // can''t delete a category in use

b.Entity<ProductSupplier>().HasKey(x => new { x.ProductId, x.SupplierId });', 'csharp', 'Model Product → Category (many-to-one) and Product ↔ Supplier (many-to-many with a join entity holding SupplierPrice).', 'نمذج العلاقة Product → Category (متعدد-إلى-واحد)، والعلاقة Product ↔ Supplier (متعدد-إلى-متعدد مع كيان ربط يحتوي على SupplierPrice).', 'Decide the delete behaviour for each relationship in Project 4 and justify each choice in one sentence.', 'حدد سلوك الحذف لكل علاقة في المشروع الرابع، وبرّر كل اختيار في جملة واحدة.'),
  (53, 'ef-crud', 5, 6, 'EfCore', 'Core', 45, 'CRUD with EF Core', 'عمليات CRUD باستخدام EF Core', 'Create with Add, read with LINQ, update by modifying tracked entities, delete with Remove — then SaveChangesAsync. ExecuteUpdate/ExecuteDelete run set-based SQL directly.', 'أنشئ بـ Add، واقرأ بـ LINQ، وحدّث بتعديل الكيانات المتتبَّعة، واحذف بـ Remove، ثم SaveChangesAsync. وتنفّذ ExecuteUpdate/ExecuteDelete أوامر SQL على المجموعات مباشرة.', 'These are the operations behind every API endpoint you''ll write. Doing them correctly avoids lost updates and unnecessary queries.', 'هذه هي العمليات وراء كل نقطة نهاية ستكتبها، وتنفيذها بشكل صحيح يجنّبك فقدان التحديثات والاستعلامات غير الضرورية.', 'Load the entity, change properties, save: EF Core generates an UPDATE with only the changed columns. Use ExecuteDeleteAsync for bulk deletes without loading rows.', 'حمّل الكيان، وغيّر الخصائص، ثم احفظ: سينشئ EF Core جملة UPDATE للأعمدة المتغيرة فقط. واستخدم ExecuteDeleteAsync للحذف الجماعي دون تحميل الصفوف.', 'db.Products.Where(p => p.Discontinued).ExecuteDeleteAsync() becomes a single DELETE ... WHERE statement.', 'التعبير db.Products.Where(p => p.Discontinued).ExecuteDeleteAsync() يتحول إلى جملة DELETE ... WHERE واحدة.', '// Create
var category = new Category { Name = "Peripherals" };
db.Categories.Add(category);
await db.SaveChangesAsync(ct);

// Read (no tracking needed)
var list = await db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

// Update: load, change, save → UPDATE with only the changed column
var c = await db.Categories.FindAsync([id], ct) ?? throw new NotFoundException("Category", id);
c.Name = "Computer peripherals";
await db.SaveChangesAsync(ct);

// Delete
db.Categories.Remove(c);
await db.SaveChangesAsync(ct);

// Set-based operations without loading entities
await db.Products.Where(p => p.CategoryId == id)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 1.05m), ct);
await db.Products.Where(p => p.Discontinued).ExecuteDeleteAsync(ct);', 'csharp', 'Implement create, get, update and delete for Category in a service class with async methods.', 'نفّذ عمليات الإنشاء والقراءة والتحديث والحذف لـ Category في Class خدمة بدوال غير متزامنة.', 'Increase all prices in a category by 5% with one ExecuteUpdateAsync call and verify the SQL.', 'ارفع أسعار كل المنتجات في فئة بنسبة 5% باستدعاء ExecuteUpdateAsync واحد، وتحقق من SQL الناتج.'),
  (54, 'ef-tracking', 5, 7, 'EfCore', 'Core', 30, 'Tracking vs no-tracking queries', 'الاستعلامات المتتبَّعة وغير المتتبَّعة', 'By default EF Core tracks loaded entities to detect changes. AsNoTracking() skips that for read-only queries and is faster.', 'يتتبع EF Core الكيانات المحمّلة افتراضيًا لاكتشاف التغييرات، وتتخطى AsNoTracking() ذلك في استعلامات القراءة فقط وتكون أسرع.', 'Most API GET endpoints only read data. Tracking thousands of entities you never modify wastes memory and CPU.', 'معظم نقاط النهاية GET في الـ API تقرأ البيانات فقط، وتتبع آلاف الكيانات التي لن تعدّلها يهدر الذاكرة والمعالج.', 'Use AsNoTracking() (or project with Select to a DTO, which is untracked) for reads. Keep tracking when you load an entity to modify and save it.', 'استخدم AsNoTracking() (أو حوّل بـ Select إلى DTO، وهو غير متتبَّع) في القراءة. وأبقِ التتبع عند تحميل كيان لتعديله وحفظه.', 'All of DevPath''s list endpoints use AsNoTracking(); its update methods load tracked entities.', 'كل نقاط النهاية الخاصة بالقوائم في DevPath تستخدم AsNoTracking()، بينما تحمّل دوال التحديث كيانات متتبَّعة.', '// Read-only: no change tracking overhead
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.Stock > 0)
    .ToListAsync(ct);

// Projection to a DTO is never tracked
var dtos = await db.Products
    .Select(p => new ProductDto(p.Id, p.Name, p.Price))
    .ToListAsync(ct);

// Update: tracking IS required
var product = await db.Products.FirstAsync(p => p.Id == id, ct);
product.Price = 59m;
await db.SaveChangesAsync(ct);      // EF detected the change

Console.WriteLine(db.ChangeTracker.Entries().Count());', 'csharp', 'Load 1,000 products with and without AsNoTracking and compare db.ChangeTracker.Entries().Count().', 'حمّل 1000 منتج مع AsNoTracking وبدونها، وقارن قيمة db.ChangeTracker.Entries().Count().', 'Modify an entity loaded with AsNoTracking, call SaveChanges, and explain why nothing is saved.', 'عدّل كيانًا محمّلًا بـ AsNoTracking، واستدعِ SaveChanges، واشرح لماذا لم يُحفظ شيء.'),
  (55, 'ef-loading', 5, 8, 'EfCore', 'Core', 40, 'Eager, explicit and lazy loading', 'التحميل المسبق والصريح والكسول', 'Related data isn''t loaded automatically. Include() loads it eagerly in the same query; explicit loading loads it later on demand.', 'البيانات المرتبطة لا تُحمَّل تلقائيًا. تحمّلها Include() مسبقًا في الاستعلام نفسه، ويحمّلها التحميل الصريح لاحقًا عند الطلب.', 'Forgetting Include gives you empty navigation properties; including too much creates huge joins. Projection with Select is often the best option.', 'نسيان Include يعطيك خصائص تنقل فارغة، وتضمين الكثير يُنتج عمليات ربط ضخمة، وغالبًا ما يكون التحويل بـ Select هو الخيار الأفضل.', 'db.Orders.Include(o => o.Lines).ThenInclude(l => l.Product). For explicit loading: db.Entry(order).Collection(o => o.Lines).LoadAsync(). AsSplitQuery avoids cartesian explosion.', 'استخدم db.Orders.Include(o => o.Lines).ThenInclude(l => l.Product). وللتحميل الصريح: db.Entry(order).Collection(o => o.Lines).LoadAsync(). وتتجنب AsSplitQuery الانفجار الديكارتي.', 'An order details endpoint includes lines and products; the order list endpoint projects only Id, Date, CustomerName and Total.', 'نقطة نهاية تفاصيل الطلب تضمّن الأسطر والمنتجات، بينما تحوّل نقطة نهاية قائمة الطلبات إلى Id وDate وCustomerName وTotal فقط.', '// Eager loading: one query with JOINs
var order = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Lines).ThenInclude(l => l.Product)
    .AsSplitQuery()                 // separate queries per collection, avoids row explosion
    .FirstOrDefaultAsync(o => o.Id == id, ct);

// Explicit loading: load a navigation later
var customer = await db.Customers.FirstAsync(c => c.Id == customerId, ct);
await db.Entry(customer).Collection(c => c.Orders).LoadAsync(ct);

// Often best: project exactly what the screen needs
var rows = await db.Orders
    .Select(o => new { o.Id, o.Date, Customer = o.Customer.Name, Total = o.Lines.Sum(l => l.Quantity * l.UnitPrice) })
    .ToListAsync(ct);', 'csharp', 'Load an order with its lines and products using Include/ThenInclude and print the receipt.', 'حمّل طلبًا مع أسطره ومنتجاته باستخدام Include/ThenInclude واطبع الإيصال.', 'Compare the SQL of a single query vs AsSplitQuery for an entity with two collections.', 'قارن SQL الاستعلام الواحد مع AsSplitQuery لكيان لديه مجموعتان.'),
  (56, 'ef-iqueryable-ienumerable', 5, 9, 'EfCore', 'Core', 30, 'IQueryable vs IEnumerable', 'الفرق بين IQueryable وIEnumerable', 'IQueryable builds an expression that EF Core translates to SQL. IEnumerable runs in memory. Switching too early means filtering in C# after loading every row.', 'يبني IQueryable تعبيرًا يترجمه EF Core إلى SQL، بينما يعمل IEnumerable في الذاكرة. والتحويل المبكر يعني التصفية في C# بعد تحميل كل الصفوف.', 'This is one of the most common performance bugs in .NET code: a .ToList() or AsEnumerable() before .Where() turns a 10-row query into a full table scan.', 'هذا من أكثر أخطاء الأداء شيوعًا في كود .NET: استدعاء .ToList() أو AsEnumerable() قبل .Where() يحوّل استعلامًا لعشرة صفوف إلى مسح كامل للجدول.', 'Keep composing on IQueryable (Where, OrderBy, Select, Skip, Take) and materialise last (ToListAsync). A method returning IEnumerable<T> from a DbSet silently loses translation.', 'استمر في البناء على IQueryable (Where وOrderBy وSelect وSkip وTake) ونفّذ في النهاية (ToListAsync). والدالة التي تُرجع IEnumerable<T> من DbSet تفقد الترجمة إلى SQL دون أن تلاحظ.', 'db.Orders.AsEnumerable().Where(o => o.CustomerId == 5) downloads all orders; db.Orders.Where(...) sends WHERE CustomerId = @p0.', 'التعبير db.Orders.AsEnumerable().Where(o => o.CustomerId == 5) ينزّل كل الطلبات، بينما db.Orders.Where(...) يرسل WHERE CustomerId = @p0.', '// ❌ AsEnumerable switches to LINQ-to-Objects: SELECT * FROM Orders, then filter in C#
var bad = db.Orders.AsEnumerable().Where(o => o.CustomerId == 5).ToList();

// ✅ Stays IQueryable: WHERE [o].[CustomerId] = @customerId runs in SQL Server
var good = await db.Orders.Where(o => o.CustomerId == 5).ToListAsync(ct);

// ❌ Hidden trap: the return type forces in-memory filtering for every caller
IEnumerable<Order> AllOrders() => db.Orders;

// ✅ Return IQueryable (or better, a finished result) from data-access code
IQueryable<Order> OrdersQuery() => db.Orders.AsNoTracking();', 'csharp', 'Write the same filter both ways and compare the SQL in the logs.', 'اكتب التصفية نفسها بالطريقتين وقارن SQL في السجلات.', 'Find a LINQ method that EF Core can''t translate, read the exception, and rewrite the query so it runs in SQL.', 'ابحث عن دالة LINQ لا يستطيع EF Core ترجمتها، واقرأ الاستثناء، وأعد كتابة الاستعلام ليُنفَّذ في SQL.'),
  (57, 'ef-transactions', 5, 10, 'EfCore', 'Core', 40, 'Transactions in EF Core', 'المعاملات (Transactions) في EF Core', 'SaveChanges is already atomic. For several SaveChanges calls or mixed operations, use db.Database.BeginTransactionAsync().', 'الدالة SaveChanges ذرية بالفعل، ولعدة استدعاءات SaveChanges أو عمليات مختلطة استخدم db.Database.BeginTransactionAsync().', 'Placing an order must create the order AND reduce stock — or do neither. You know transactions from SQL; here you control them from C#.', 'يجب أن يُنشئ تقديم الطلب الطلبَ ويُنقص المخزون معًا، أو لا يفعل أيًا منهما. أنت تعرف المعاملات من SQL، وهنا تتحكم بها من C#.', 'Group changes before one SaveChangesAsync when possible. Otherwise: await using var tx = await db.Database.BeginTransactionAsync(); ... await tx.CommitAsync(); With retry strategies, wrap it in CreateExecutionStrategy().', 'اجمع التغييرات قبل استدعاء SaveChangesAsync واحد قدر الإمكان، وإلا: await using var tx = await db.Database.BeginTransactionAsync(); ... await tx.CommitAsync(); ومع استراتيجيات إعادة المحاولة غلّفها بـ CreateExecutionStrategy().', 'DevPath''s seeder runs all content upserts in one transaction inside the execution strategy, because the API enables EnableRetryOnFailure.', 'ينفذ المُعبّئ (Seeder) في DevPath كل عمليات الإدراج والتحديث للمحتوى في معاملة واحدة داخل استراتيجية التنفيذ، لأن الـ API يفعّل EnableRetryOnFailure.', '// Usually enough: one SaveChanges = one transaction
var order = new Order { CustomerId = request.CustomerId };
foreach (var line in request.Lines)
{
    var product = products[line.ProductId];
    product.Stock -= line.Quantity;               // tracked change
    order.Lines.Add(new OrderLine { ProductId = product.Id, Quantity = line.Quantity, UnitPrice = product.Price });
}
db.Orders.Add(order);
await db.SaveChangesAsync(ct);                     // INSERTs + UPDATEs commit together

// Several SaveChanges in one transaction (with retry strategy support)
var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var tx = await db.Database.BeginTransactionAsync(ct);
    await db.SaveChangesAsync(ct);
    await auditService.WriteAsync(order.Id, ct);   // also uses db
    await tx.CommitAsync(ct);                      // rollback happens automatically if not committed
});', 'csharp', 'Place an order that creates an Order with lines and decrements product stock in one SaveChangesAsync call.', 'نفّذ تقديم طلب يُنشئ Order بأسطره ويُنقص مخزون المنتجات في استدعاء SaveChangesAsync واحد.', 'Force an exception after the first of two SaveChanges calls inside a transaction and verify nothing was committed.', 'افرض استثناءً بعد أول استدعاء من استدعاءين لـ SaveChanges داخل معاملة، وتحقق أنه لم يُعتمد أي شيء.'),
  (58, 'ef-concurrency', 5, 11, 'EfCore', 'Important', 40, 'Optimistic concurrency', 'التزامن المتفائل (Optimistic concurrency)', 'A rowversion concurrency token makes EF Core add ''WHERE RowVersion = @original'' to updates; if someone else changed the row, it throws DbUpdateConcurrencyException.', 'يجعل رمز التزامن rowversion المكتبة EF Core تضيف WHERE RowVersion = @original إلى التحديثات، وإذا غيّر شخص آخر الصف ترمي DbUpdateConcurrencyException.', 'Without it, two users editing the same order silently overwrite each other (lost update). The API should return 409 and let the user reload.', 'بدونه يكتب مستخدمان يعدّلان الطلب نفسه فوق تعديلات بعضهما دون علم (Lost update). ويجب أن يُرجع الـ API الرمز 409 ويسمح للمستخدم بإعادة التحميل.', 'Add [Timestamp] public byte[] RowVersion { get; set; }. Send it to the client in the DTO, receive it back on update, set OriginalValue, and catch DbUpdateConcurrencyException.', 'أضف [Timestamp] public byte[] RowVersion { get; set; }. أرسلها إلى العميل في الـ DTO، واستقبلها عند التحديث، واضبط OriginalValue، والتقط DbUpdateConcurrencyException.', 'Two managers open order #42; the second save returns 409 Conflict: ''The order was changed by someone else.''', 'يفتح مديران الطلب رقم 42، ويُرجع الحفظ الثاني 409 Conflict: لقد غيّر شخص آخر هذا الطلب.', 'public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];   // SQL Server rowversion
}

public async Task UpdateStatusAsync(int id, UpdateStatusRequest request, CancellationToken ct)
{
    var order = await db.Orders.FindAsync([id], ct) ?? throw new NotFoundException("Order", id);

    // Tell EF which version the client saw
    db.Entry(order).Property(o => o.RowVersion).OriginalValue = request.RowVersion;
    order.Status = request.Status;

    try
    {
        await db.SaveChangesAsync(ct);   // UPDATE ... WHERE Id = @id AND RowVersion = @original
    }
    catch (DbUpdateConcurrencyException)
    {
        throw new BusinessRuleException("concurrency_conflict", "The order was changed by someone else.");
    }
}', 'csharp', 'Add a RowVersion to Product and simulate two updates of the same product from two DbContext instances.', 'أضف RowVersion إلى Product وحاكِ تحديثين للمنتج نفسه من نسختين مختلفتين من DbContext.', 'Implement the full flow in Project 4: rowVersion in the DTO, 409 response, and an Angular message offering to reload.', 'نفّذ التدفق الكامل في المشروع الرابع: rowVersion في الـ DTO، واستجابة 409، ورسالة في Angular تعرض إعادة التحميل.'),
  (59, 'ef-generated-sql', 5, 12, 'EfCore', 'Core', 30, 'Inspecting generated SQL', 'فحص SQL المولَّد', 'EF Core translates LINQ into SQL. You can see it with ToQueryString(), logging, or SQL Server tools like Extended Events and Query Store.', 'يترجم EF Core استعلامات LINQ إلى SQL، ويمكنك رؤيتها باستخدام ToQueryString() أو التسجيل أو أدوات SQL Server مثل Extended Events وQuery Store.', 'This is your superpower as a SQL developer: you can read the generated SQL, spot problems and check its execution plan like any other query.', 'هذه قوتك الخارقة كمطور SQL: يمكنك قراءة SQL المولَّد واكتشاف المشكلات وفحص خطة تنفيذه مثل أي استعلام آخر.', 'Call query.ToQueryString() in the debugger, or set the ''Microsoft.EntityFrameworkCore.Database.Command'' log level to Information. Copy the SQL into SSMS with its parameters.', 'استدعِ query.ToQueryString() في المصحح، أو اضبط مستوى السجل Microsoft.EntityFrameworkCore.Database.Command على Information. وانسخ SQL إلى SSMS مع معاملاته.', 'A Contains() on a list becomes IN (...) or OPENJSON depending on the version — worth checking for large lists.', 'الدالة Contains() على قائمة تتحول إلى IN (...) أو OPENJSON حسب الإصدار، ويستحق ذلك الفحص عند القوائم الكبيرة.', 'var query = db.Products
    .Where(p => p.Price > 100 && p.Category.Name == "Laptops")
    .OrderBy(p => p.Name)
    .Select(p => new { p.Id, p.Name });

Console.WriteLine(query.ToQueryString());
// SELECT [p].[Id], [p].[Name]
// FROM [Products] AS [p]
// INNER JOIN [Categories] AS [c] ON [p].[CategoryId] = [c].[Id]
// WHERE [p].[Price] > 100.0 AND [c].[Name] = N''Laptops''
// ORDER BY [p].[Name]

// appsettings.Development.json
// "Logging": { "LogLevel": { "Microsoft.EntityFrameworkCore.Database.Command": "Information" } }', 'csharp', 'Turn on SQL logging in DevPath (appsettings.Development.json) and read the SQL behind GET /api/roadmap.', 'فعّل تسجيل SQL في DevPath (appsettings.Development.json) واقرأ SQL وراء GET /api/roadmap.', 'Take one EF query from your project and show its actual execution plan in SSMS.', 'خذ استعلام EF واحدًا من مشروعك واعرض خطة التنفيذ الفعلية له في SSMS.'),
  (60, 'ef-n-plus-one', 5, 13, 'EfCore', 'Core', 35, 'The N+1 query problem', 'مشكلة استعلامات N+1', 'N+1 happens when you run 1 query for a list and then 1 more query per row to load related data — 101 round trips for 100 orders.', 'تحدث مشكلة N+1 عندما تنفّذ استعلامًا واحدًا لقائمة ثم استعلامًا إضافيًا لكل صف لتحميل البيانات المرتبطة، أي 101 رحلة لـ 100 طلب.', 'It''s invisible with 5 test rows and devastating with 5,000 production rows. Interviewers love asking about it.', 'لا تظهر مع 5 صفوف تجريبية وتكون مدمرة مع 5000 صف في الإنتاج، ويحب المحاورون السؤال عنها.', 'Detect it in SQL logs (the same query repeated with different parameters). Fix it with a Select projection, Include, or by loading related data in one query and joining in memory.', 'اكتشفها في سجلات SQL (الاستعلام نفسه يتكرر بمعاملات مختلفة)، وأصلحها بتحويل Select أو Include أو بتحميل البيانات المرتبطة في استعلام واحد وربطها في الذاكرة.', 'foreach (var o in orders) total += db.OrderLines.Where(l => l.OrderId == o.Id).Sum(...) — replace with one grouped query.', 'الكود foreach (var o in orders) total += db.OrderLines.Where(l => l.OrderId == o.Id).Sum(...) يجب استبداله باستعلام تجميعي واحد.', '// ❌ N+1: one query for orders, then one query PER order
var orders = await db.Orders.AsNoTracking().ToListAsync(ct);
foreach (var o in orders)
{
    var customer = await db.Customers.FindAsync([o.CustomerId], ct);   // runs N times
    Console.WriteLine($"{o.Id}: {customer!.Name}");
}

// ✅ One query with a JOIN
var rows = await db.Orders.AsNoTracking()
    .Select(o => new { o.Id, CustomerName = o.Customer.Name })
    .ToListAsync(ct);

// ✅ Or: load the related rows in one batch and join in memory
var ids = orders.Select(o => o.CustomerId).Distinct().ToList();
var names = await db.Customers.Where(c => ids.Contains(c.Id)).ToDictionaryAsync(c => c.Id, c => c.Name, ct);', 'csharp', 'Write an N+1 version of ''orders with customer names'', count the SQL statements, then fix it.', 'اكتب نسخة N+1 من الطلبات مع أسماء العملاء، واحسب عدد جمل SQL، ثم أصلحها.', 'Find an N+1 in an Angular + API flow where the UI calls the API once per row, and design a batch endpoint.', 'ابحث عن N+1 في تدفق Angular + API حيث تستدعي الواجهة الـ API مرة لكل صف، وصمم نقطة نهاية مجمّعة.'),
  (61, 'ef-query-performance', 5, 14, 'EfCore', 'Important', 45, 'EF Core query performance', 'أداء استعلامات EF Core', 'Fast EF Core code: project only needed columns, use AsNoTracking, page results, avoid N+1, filter in SQL, and add the right indexes.', 'كود EF Core السريع: اختر الأعمدة المطلوبة فقط، واستخدم AsNoTracking، وقسّم النتائج إلى صفحات، وتجنب N+1، وصفِّ في SQL، وأضف الفهارس المناسبة.', 'Most slow APIs are slow because of database access. Combining EF Core knowledge with your SQL tuning skills makes you very valuable.', 'معظم الواجهات البطيئة بطيئة بسبب الوصول إلى قاعدة البيانات، والجمع بين معرفة EF Core ومهارات ضبط SQL يجعلك ذا قيمة عالية.', 'Measure first (logs, timings), then fix the biggest cost. Consider compiled queries for hot paths and raw SQL (FromSql, parameterised) for complex reports.', 'قِس أولًا (السجلات والأزمنة)، ثم أصلح التكلفة الأكبر. وفكّر في الاستعلامات المترجمة مسبقًا (Compiled queries) للمسارات الساخنة، وفي SQL الخام (FromSql بمعاملات) للتقارير المعقدة.', 'Replacing Include(...) of whole entities with Select(new OrderListItemDto(...)) cut a list endpoint from 800 ms to 40 ms.', 'استبدال Include(...) لكيانات كاملة بـ Select(new OrderListItemDto(...)) خفّض زمن نقطة نهاية قائمة من 800 إلى 40 مللي ثانية.', '// Hot path: compiled query skips LINQ translation on every call
private static readonly Func<AppDbContext, int, Task<ProductDto?>> GetById =
    EF.CompileAsyncQuery((AppDbContext db, int id) =>
        db.Products.Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Name, p.Price))
            .FirstOrDefault());

// Complex report: parameterised raw SQL is fine (interpolation becomes parameters)
var report = await db.Database
    .SqlQuery<MonthlySales>($"""
        SELECT YEAR(o.OrderDate) AS [Year], MONTH(o.OrderDate) AS [Month], SUM(l.Quantity * l.UnitPrice) AS Total
        FROM Orders o JOIN OrderLines l ON l.OrderId = o.Id
        WHERE o.OrderDate >= {from}
        GROUP BY YEAR(o.OrderDate), MONTH(o.OrderDate)
        """)
    .ToListAsync(ct);

// Index the columns you filter and sort by
b.Entity<Order>().HasIndex(o => new { o.CustomerId, o.OrderDate });', 'csharp', 'Seed 50,000 products and measure a list endpoint before and after projection, AsNoTracking and paging.', 'أدخل 50,000 منتج وقِس نقطة نهاية القائمة قبل وبعد التحويل وAsNoTracking والتقسيم إلى صفحات.', 'Write a performance checklist for EF Core queries you would use in code review.', 'اكتب قائمة تحقق لأداء استعلامات EF Core تستخدمها عند مراجعة الكود.'),
  (62, 'ef-schema-changes', 5, 15, 'EfCore', 'Important', 35, 'Safe database schema changes', 'التغييرات الآمنة على مخطط قاعدة البيانات', 'Change schemas without losing data: review every migration, split risky changes into steps, and back up before destructive operations.', 'غيّر المخطط دون فقدان البيانات: راجع كل Migration، وقسّم التغييرات الخطرة إلى خطوات، وخذ نسخة احتياطية قبل العمليات المدمرة.', 'A migration that drops a column runs in seconds and loses data forever. Production databases need careful, reversible changes.', 'الـ Migration التي تحذف عمودًا تعمل في ثوانٍ وتفقد البيانات للأبد، وقواعد بيانات الإنتاج تحتاج إلى تغييرات حذرة وقابلة للتراجع.', 'Add new columns as nullable or with defaults, backfill data, then make them required. Use migrationBuilder.Sql for data migrations and generate idempotent scripts (--idempotent) for deployment.', 'أضف الأعمدة الجديدة كقابلة لـ null أو بقيم افتراضية، ثم املأ البيانات، ثم اجعلها مطلوبة. استخدم migrationBuilder.Sql لترحيل البيانات، وأنشئ سكربتات Idempotent (--idempotent) للنشر.', 'Splitting FullName into FirstName/LastName: add columns → copy data with SQL → update code → drop FullName in a later release.', 'تقسيم FullName إلى FirstName/LastName: أضف الأعمدة ← انسخ البيانات بـ SQL ← حدّث الكود ← احذف FullName في إصدار لاحق.', 'public partial class AddBarcode : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Step 1: add as nullable so existing rows are valid
        migrationBuilder.AddColumn<string>("Barcode", "Products", maxLength: 20, nullable: true);

        // Step 2: backfill existing data
        migrationBuilder.Sql("UPDATE Products SET Barcode = CONCAT(''LEGACY-'', Id) WHERE Barcode IS NULL;");

        // Step 3: now make it required
        migrationBuilder.AlterColumn<string>("Barcode", "Products", maxLength: 20, nullable: false,
            oldClrType: typeof(string), oldMaxLength: 20, oldNullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn("Barcode", "Products");
}', 'csharp', 'Add a required Barcode column to a table with existing rows without breaking the migration.', 'أضف عمود Barcode مطلوبًا إلى جدول يحتوي على صفوف موجودة دون كسر الـ Migration.', 'Generate an idempotent script for all your migrations and explain how a DBA would apply it.', 'أنشئ سكربتًا Idempotent لكل الـ Migrations الخاصة بك، واشرح كيف يطبقه مسؤول قاعدة البيانات.'),
  (63, 'sql-indexing', 6, 1, 'SqlServer', 'Important', 40, 'Indexing for application queries', 'الفهرسة لاستعلامات التطبيقات', 'Design indexes from the application''s real access patterns: the WHERE, JOIN and ORDER BY columns of the queries EF Core generates.', 'صمّم الفهارس بناءً على أنماط الوصول الحقيقية للتطبيق: أعمدة WHERE وJOIN وORDER BY في الاستعلامات التي يولّدها EF Core.', 'You know indexes well; the new skill is finding which indexes an application needs by reading its code and generated SQL — and declaring them in EF Core.', 'أنت تعرف الفهارس جيدًا، والمهارة الجديدة هي معرفة الفهارس التي يحتاجها التطبيق من قراءة كوده وSQL المولَّد، والإعلان عنها في EF Core.', 'Declare indexes with HasIndex (composite, unique, filtered with HasFilter, covering with IncludeProperties). Foreign keys get indexes by convention in EF Core.', 'عرّف الفهارس بـ HasIndex (مركبة، وفريدة، ومُرشّحة بـ HasFilter، ومغطية بـ IncludeProperties). ويُنشئ EF Core فهارس للمفاتيح الأجنبية تلقائيًا بالاصطلاح.', 'An orders screen filtered by customer and sorted by date needs IX_Orders_CustomerId_OrderDate, declared as HasIndex(o => new { o.CustomerId, o.OrderDate }).', 'شاشة طلبات مُصفّاة حسب العميل ومرتبة حسب التاريخ تحتاج إلى IX_Orders_CustomerId_OrderDate، ويُعرَّف بـ HasIndex(o => new { o.CustomerId, o.OrderDate }).', 'protected override void OnModelCreating(ModelBuilder b)
{
    // Supports: WHERE CustomerId = @id ORDER BY OrderDate DESC
    b.Entity<Order>()
        .HasIndex(o => new { o.CustomerId, o.OrderDate })
        .HasDatabaseName("IX_Orders_CustomerId_OrderDate");

    // Covering index for a list screen (INCLUDE columns)
    b.Entity<Product>()
        .HasIndex(p => p.CategoryId)
        .IncludeProperties(p => new { p.Name, p.Price });

    // Filtered unique index: SKU unique among active products only
    b.Entity<Product>()
        .HasIndex(p => p.Sku)
        .IsUnique()
        .HasFilter("[IsActive] = 1");
}', 'csharp', 'List every query of your Inventory API and propose the indexes it needs, then add them in OnModelCreating.', 'اكتب قائمة بكل استعلامات واجهة المخزون، واقترح الفهارس التي تحتاجها، ثم أضفها في OnModelCreating.', 'Add a filtered unique index (unique Sku only for active products) through EF Core.', 'أضف فهرسًا فريدًا مُرشّحًا (Sku فريد للمنتجات النشطة فقط) عبر EF Core.'),
  (64, 'sql-execution-plans', 6, 2, 'SqlServer', 'Important', 40, 'Execution plans for EF Core queries', 'خطط التنفيذ لاستعلامات EF Core', 'Capture the SQL your API sends, run it in SSMS with its parameters and read the actual execution plan to find scans, key lookups and bad estimates.', 'التقط SQL الذي يرسله الـ API، وشغّله في SSMS مع معاملاته، واقرأ خطة التنفيذ الفعلية لاكتشاف عمليات المسح وKey lookups والتقديرات الخاطئة.', 'Parameterised queries from applications behave differently from ad-hoc scripts (parameter sniffing, plan reuse). This is where your SQL tuning experience meets .NET.', 'الاستعلامات ذات المعاملات القادمة من التطبيقات تتصرف بشكل مختلف عن السكربتات العشوائية (Parameter sniffing وإعادة استخدام الخطط)، وهنا تلتقي خبرتك في ضبط SQL مع .NET.', 'Get SQL from EF logs or Query Store, recreate it with sp_executesql and the same parameter types, then compare estimated vs actual rows.', 'احصل على SQL من سجلات EF أو Query Store، وأعد إنشاءه بـ sp_executesql وبنفس أنواع المعاملات، ثم قارن الصفوف المقدّرة بالفعلية.', 'A string parameter typed nvarchar(4000) against a varchar column causes an implicit conversion and an index scan; fixing the column type mapping restores a seek.', 'معامل نصي من النوع nvarchar(4000) مقابل عمود varchar يسبب تحويلًا ضمنيًا ومسحًا للفهرس، وإصلاح ربط نوع العمود يعيد عملية Seek.', '-- What EF Core actually sends (copied from the log), runnable in SSMS
EXEC sp_executesql
    N''SELECT [p].[Id], [p].[Name]
      FROM [Products] AS [p]
      WHERE [p].[Sku] = @__sku_0'',
    N''@__sku_0 nvarchar(4000)'',          -- ⚠ nvarchar vs a varchar(20) column
    @__sku_0 = N''KB-001'';

-- Implicit conversion → index scan. Fix the mapping in EF Core:
--   e.Property(p => p.Sku).HasMaxLength(20).IsUnicode(false);
-- Now the parameter is varchar(20) and the plan uses an index seek.

SET STATISTICS IO, TIME ON;', 'sql', 'Pick DevPath''s search endpoint, capture its SQL and inspect the plan for the topics query.', 'اختر نقطة نهاية البحث في DevPath، والتقط SQL الخاص بها، وافحص خطة استعلام المواضيع.', 'Reproduce an implicit conversion caused by a column type mismatch and fix it with HasColumnType or IsUnicode(false).', 'أعد إنتاج تحويل ضمني ناتج عن عدم تطابق نوع العمود، وأصلحه بـ HasColumnType أو IsUnicode(false).'),
  (65, 'sql-transactions', 6, 3, 'SqlServer', 'Important', 30, 'Transactions from application code', 'المعاملات من كود التطبيق', 'Who owns the transaction — the stored procedure, EF Core''s SaveChanges, or an explicit DbTransaction? Keep transactions short and never wait for user input inside one.', 'من يملك المعاملة: الإجراء المخزن، أم SaveChanges في EF Core، أم DbTransaction صريحة؟ اجعل المعاملات قصيرة ولا تنتظر مدخلات المستخدم داخلها أبدًا.', 'Long-running application transactions hold locks and cause blocking that DBAs then have to investigate.', 'المعاملات الطويلة في التطبيقات تحجز الأقفال وتسبب حجبًا (Blocking) يضطر مسؤولو قواعد البيانات لاحقًا إلى التحقيق فيه.', 'Do validation and loading first, open the transaction late, commit early. Don''t call external HTTP services while a transaction is open.', 'نفّذ التحقق والتحميل أولًا، وافتح المعاملة متأخرًا، واعتمدها مبكرًا. ولا تستدعِ خدمات HTTP خارجية أثناء فتح معاملة.', 'Sending a confirmation email inside the order transaction made every order hold locks for 3 seconds.', 'إرسال بريد التأكيد داخل معاملة الطلب جعل كل طلب يحجز الأقفال لمدة 3 ثوانٍ.', 'public async Task<int> PlaceOrderAsync(PlaceOrderRequest request, CancellationToken ct)
{
    // 1) Validate and load OUTSIDE the transaction
    var products = await LoadAndValidateAsync(request, ct);

    // 2) Short transaction: only the writes
    var order = BuildOrder(request, products);
    db.Orders.Add(order);
    await db.SaveChangesAsync(ct);          // implicit transaction, commits immediately

    // 3) Slow external work AFTER commit — never inside the transaction
    await emailSender.SendAsync(request.Email, "Order received", $"#{order.Id}");
    return order.Id;
}', 'csharp', 'Review your Place Order code and mark exactly where the transaction starts and ends.', 'راجع كود تقديم الطلب، وحدد بدقة أين تبدأ المعاملة وأين تنتهي.', 'Use sys.dm_tran_active_transactions while debugging to observe your application''s open transaction.', 'استخدم sys.dm_tran_active_transactions أثناء التصحيح لملاحظة المعاملة المفتوحة في تطبيقك.'),
  (66, 'sql-isolation-levels', 6, 4, 'SqlServer', 'Important', 35, 'Isolation levels and RCSI', 'مستويات العزل وRCSI', 'READ COMMITTED (default), READ COMMITTED SNAPSHOT, SNAPSHOT, REPEATABLE READ and SERIALIZABLE trade consistency for concurrency.', 'المستويات READ COMMITTED (الافتراضي) وREAD COMMITTED SNAPSHOT وSNAPSHOT وREPEATABLE READ وSERIALIZABLE توازن بين الاتساق والتزامن.', 'Web apps run many concurrent requests. Knowing whether RCSI is on explains why readers do or don''t block writers in your API.', 'تطبيقات الويب تنفذ طلبات متزامنة كثيرة، ومعرفة ما إذا كان RCSI مفعّلًا يفسر لماذا يحجب القرّاء الكتّاب أو لا يحجبونهم في الـ API.', 'Set the level per transaction: db.Database.BeginTransactionAsync(IsolationLevel.Serializable). RCSI is a database setting that versions rows in tempdb.', 'اضبط المستوى لكل معاملة: db.Database.BeginTransactionAsync(IsolationLevel.Serializable). وRCSI إعداد على مستوى قاعدة البيانات يحفظ إصدارات الصفوف في tempdb.', 'Generating unique invoice numbers with SELECT MAX()+1 needs SERIALIZABLE or a SEQUENCE; a SEQUENCE is the better design.', 'توليد أرقام فواتير فريدة باستخدام SELECT MAX()+1 يحتاج إلى SERIALIZABLE أو SEQUENCE، وSEQUENCE هو التصميم الأفضل.', '// Is RCSI on? (readers don''t block writers when it is)
// SELECT name, is_read_committed_snapshot_on FROM sys.databases WHERE name = DB_NAME();

var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

    var last = await db.Invoices.MaxAsync(i => (int?)i.Number, ct) ?? 0;
    db.Invoices.Add(new Invoice { Number = last + 1 });
    await db.SaveChangesAsync(ct);

    await tx.CommitAsync(ct);
});

// Better design: let SQL Server generate numbers
// modelBuilder.HasSequence<int>("InvoiceNumbers");
// modelBuilder.Entity<Invoice>().Property(i => i.Number).HasDefaultValueSql("NEXT VALUE FOR InvoiceNumbers");', 'csharp', 'Check whether is_read_committed_snapshot_on is enabled for your development database.', 'تحقق مما إذا كان is_read_committed_snapshot_on مفعّلًا لقاعدة بيانات التطوير.', 'Write a .NET test that runs two transactions concurrently and demonstrates a non-repeatable read.', 'اكتب اختبار .NET يشغّل معاملتين بالتزامن ويوضح القراءة غير القابلة للتكرار (Non-repeatable read).'),
  (67, 'sql-deadlocks', 6, 5, 'SqlServer', 'Important', 35, 'Deadlocks in applications', 'حالات الجمود (Deadlocks) في التطبيقات', 'A deadlock occurs when two sessions hold locks the other needs. SQL Server kills one (error 1205); the application should retry it.', 'يحدث الجمود عندما تحجز جلستان أقفالًا تحتاجها الأخرى، فينهي SQL Server إحداهما (الخطأ 1205)، ويجب على التطبيق إعادة المحاولة.', 'Deadlocks often come from application code that updates tables in different orders. EF Core''s retry strategy can handle transient errors like 1205.', 'غالبًا ما تأتي حالات الجمود من كود تطبيق يحدّث الجداول بترتيب مختلف، ويمكن لاستراتيجية إعادة المحاولة في EF Core التعامل مع الأخطاء المؤقتة مثل 1205.', 'Access tables in a consistent order, keep transactions short, index foreign keys, and enable EnableRetryOnFailure. Capture deadlock graphs with the system_health session.', 'تعامل مع الجداول بترتيب ثابت، واجعل المعاملات قصيرة، وفهرس المفاتيح الأجنبية، وفعّل EnableRetryOnFailure. والتقط رسوم الجمود من جلسة system_health.', 'Order placement updated Products then Orders while cancellation updated Orders then Products; aligning the order removed the deadlocks.', 'كان تقديم الطلب يحدّث Products ثم Orders بينما الإلغاء يحدّث Orders ثم Products، وتوحيد الترتيب أزال حالات الجمود.', '// Program.cs — retry transient errors (including deadlock victim 1205)
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure(
        maxRetryCount: 3,
        maxRetryDelay: TimeSpan.FromSeconds(2),
        errorNumbersToAdd: null)));

// Prevention: every code path touches tables in the SAME order
// PlaceOrder:  UPDATE Products ... ; INSERT Orders ...
// CancelOrder: UPDATE Products ... ; UPDATE Orders ...   (not Orders first!)

// Find recent deadlock graphs:
// SELECT xed.value(''@timestamp'', ''datetime2'') AS [When], xed.query(''.'') AS Graph
// FROM (SELECT CAST(target_data AS xml) AS t FROM sys.dm_xe_session_targets st
//       JOIN sys.dm_xe_sessions s ON s.address = st.event_session_address
//       WHERE s.name = ''system_health'' AND st.target_name = ''ring_buffer'') AS d
// CROSS APPLY t.nodes(''RingBufferTarget/event[@name="xml_deadlock_report"]'') AS x(xed);', 'csharp', 'Read a deadlock graph from system_health and identify the two statements involved.', 'اقرأ رسم جمود من system_health وحدد الجملتين المتورطتين.', 'Reproduce a deadlock with two parallel .NET tasks and fix it by changing the update order.', 'أعد إنتاج حالة جمود بمهمتين متوازيتين في .NET، وأصلحها بتغيير ترتيب التحديث.'),
  (68, 'sql-concurrency', 6, 6, 'SqlServer', 'Important', 30, 'Concurrency patterns: rowversion and atomic updates', 'أنماط التزامن: rowversion والتحديثات الذرية', 'Prevent lost updates with rowversion (optimistic) or with atomic statements like UPDATE ... SET Stock = Stock - @qty WHERE Stock >= @qty.', 'امنع فقدان التحديثات باستخدام rowversion (التزامن المتفائل) أو بجمل ذرية مثل UPDATE ... SET Stock = Stock - @qty WHERE Stock >= @qty.', 'Read-modify-write in C# (load stock, subtract, save) is not safe under concurrency. Stock and balances need an atomic pattern.', 'نمط القراءة ثم التعديل ثم الكتابة في C# (تحميل المخزون، والطرح، والحفظ) غير آمن مع التزامن، والمخزون والأرصدة تحتاج إلى نمط ذري.', 'Use ExecuteUpdateAsync with a condition and check the affected row count, or a rowversion token and handle DbUpdateConcurrencyException.', 'استخدم ExecuteUpdateAsync مع شرط وتحقق من عدد الصفوف المتأثرة، أو رمز rowversion مع التعامل مع DbUpdateConcurrencyException.', 'Two customers buy the last item at the same moment: the atomic UPDATE succeeds for one (1 row) and returns 0 rows for the other, who gets ''out of stock''.', 'عميلان يشتريان آخر قطعة في اللحظة نفسها: ينجح التحديث الذري لأحدهما (صف واحد) ويُرجع 0 صفوف للآخر الذي يحصل على رسالة نفاد المخزون.', '// ❌ Read-modify-write: two requests can both see Stock = 1
var product = await db.Products.FindAsync([id], ct);
if (product!.Stock >= qty) { product.Stock -= qty; await db.SaveChangesAsync(ct); }

// ✅ Atomic conditional update: one statement, checked by SQL Server
var updated = await db.Products
    .Where(p => p.Id == id && p.Stock >= qty)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - qty), ct);
// UPDATE Products SET Stock = Stock - @qty WHERE Id = @id AND Stock >= @qty

if (updated == 0)
    throw new BusinessRuleException("out_of_stock", "Not enough stock.");', 'csharp', 'Implement stock reservation with ExecuteUpdateAsync and a Stock >= @qty condition.', 'نفّذ حجز المخزون باستخدام ExecuteUpdateAsync مع الشرط Stock >= @qty.', 'Load-test the endpoint with 20 parallel requests for the last 5 items and prove stock never goes negative.', 'اختبر نقطة النهاية بـ 20 طلبًا متوازيًا لآخر 5 قطع، وأثبت أن المخزون لا يصبح سالبًا أبدًا.'),
  (69, 'sql-parameterization', 6, 7, 'SqlServer', 'Core', 25, 'Query parameterisation and plan reuse', 'معاملات الاستعلام وإعادة استخدام الخطط', 'EF Core and ADO.NET send values as parameters (sp_executesql), which enables plan reuse and prevents injection.', 'يرسل EF Core وADO.NET القيم كمعاملات (sp_executesql)، مما يتيح إعادة استخدام الخطط ويمنع الحقن.', 'Concatenated SQL pollutes the plan cache with thousands of single-use plans and is a security risk.', 'SQL المبني بالدمج يملأ ذاكرة الخطط بآلاف الخطط أحادية الاستخدام ويمثل خطرًا أمنيًا.', 'In ADO.NET use SqlParameter with explicit types and sizes. In EF Core, FromSql/SqlQuery with interpolated strings create parameters automatically; FromSqlRaw with concatenation does not.', 'في ADO.NET استخدم SqlParameter بأنواع وأحجام صريحة. وفي EF Core تُنشئ FromSql/SqlQuery مع النصوص المُدمجة معاملات تلقائيًا، أما FromSqlRaw مع الدمج فلا.', 'Specifying SqlDbType.VarChar with Size = 20 for a varchar(20) column avoids implicit conversions and multiple cached plans.', 'تحديد SqlDbType.VarChar مع Size = 20 لعمود varchar(20) يتجنب التحويلات الضمنية وتعدد الخطط المخزنة.', '// ADO.NET with explicit parameter types (matches a varchar(20) column)
await using var connection = new SqlConnection(connectionString);
await using var command = new SqlCommand("SELECT Id, Name FROM Products WHERE Sku = @sku", connection);
command.Parameters.Add(new SqlParameter("@sku", SqlDbType.VarChar, 20) { Value = sku });
await connection.OpenAsync(ct);
await using var reader = await command.ExecuteReaderAsync(ct);

// EF Core: the interpolated value becomes a parameter automatically
var products = await db.Products
    .FromSql($"SELECT * FROM Products WHERE Sku = {sku}")
    .ToListAsync(ct);', 'csharp', 'Write the same lookup with ADO.NET + SqlParameter and with EF Core FromSql, and compare them in the plan cache.', 'اكتب البحث نفسه باستخدام ADO.NET + SqlParameter وباستخدام FromSql في EF Core، وقارنهما في ذاكرة الخطط.', 'Query sys.dm_exec_cached_plans to show the difference between parameterised and concatenated queries.', 'استعلم من sys.dm_exec_cached_plans لإظهار الفرق بين الاستعلامات ذات المعاملات والاستعلامات المدمجة.'),
  (70, 'sql-injection', 6, 8, 'SqlServer', 'Core', 30, 'SQL injection prevention', 'منع حقن SQL', 'SQL injection happens when user input becomes part of the SQL text. Parameters, allow-lists for identifiers and least-privilege logins prevent it.', 'يحدث حقن SQL عندما تصبح مدخلات المستخدم جزءًا من نص SQL، وتمنعه المعاملات والقوائم المسموحة للمعرّفات وحسابات الدخول ذات الصلاحيات الدنيا.', 'It is still one of the most damaging vulnerabilities. Dynamic sorting and filtering screens are where developers most often reintroduce it.', 'لا يزال من أخطر الثغرات، وشاشات الترتيب والتصفية الديناميكية هي أكثر مكان يعيد فيه المطورون إدخاله.', 'Never concatenate input into SQL. Values → parameters. Column names (ORDER BY) → map from an allow-list. Give the app''s SQL login only the permissions it needs.', 'لا تدمج المدخلات في SQL أبدًا. القيم ← معاملات. أسماء الأعمدة (ORDER BY) ← تحويل من قائمة مسموحة. وامنح حساب SQL الخاص بالتطبيق الصلاحيات التي يحتاجها فقط.', 'FromSqlRaw("SELECT * FROM Products WHERE Name = ''" + name + "''") is injectable; FromSql($"... WHERE Name = {name}") is safe.', 'الكود FromSqlRaw("SELECT * FROM Products WHERE Name = ''" + name + "''") قابل للحقن، بينما FromSql($"... WHERE Name = {name}") آمن.', '// ❌ Injectable: name = "x'' OR 1=1 --" returns every row
var bad = db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = ''" + name + "''");

// ✅ Parameterised
var good = db.Products.FromSql($"SELECT * FROM Products WHERE Name = {name}");

// ✅ Identifiers can''t be parameters → use an allow-list
string orderColumn = sortBy switch
{
    "price" => "Price",
    "name"  => "Name",
    _       => "Id"
};
var sql = $"SELECT * FROM Products ORDER BY {orderColumn}";   // safe: value comes from our list', 'csharp', 'Write a deliberately vulnerable endpoint in a throwaway project, exploit it with '' OR 1=1 --, then fix it.', 'اكتب نقطة نهاية ضعيفة عمدًا في مشروع تجريبي، واستغلها بـ '' OR 1=1 --، ثم أصلحها.', 'Review a dynamic sort feature and prove that its ORDER BY can''t be injected.', 'راجع ميزة ترتيب ديناميكية، وأثبت أن ORDER BY فيها لا يمكن حقنه.'),
  (71, 'sql-ef-generated-sql', 6, 9, 'SqlServer', 'Important', 30, 'Reviewing EF Core-generated SQL as a DBA', 'مراجعة SQL المولَّد من EF Core بعين مسؤول قاعدة البيانات', 'Recognise EF Core patterns: OUTER APPLY for projections, OPENJSON for Contains, split queries, OFFSET/FETCH paging and MERGE for batched inserts.', 'تعرّف على أنماط EF Core: OUTER APPLY للتحويلات، وOPENJSON لـ Contains، والاستعلامات المقسمة، وOFFSET/FETCH للتقسيم إلى صفحات، وMERGE للإدراج المجمّع.', 'Being the person who can explain what EF Core sends to SQL Server, and why it''s slow, is a valuable bridge role in any team.', 'أن تكون الشخص القادر على شرح ما يرسله EF Core إلى SQL Server ولماذا هو بطيء دور ربط قيّم في أي فريق.', 'Collect queries via logging or Extended Events (filter by application name), group by query hash and review the top ones by duration and reads.', 'اجمع الاستعلامات عبر التسجيل أو Extended Events (مع التصفية باسم التطبيق)، وجمّعها حسب Query hash، وراجع أعلاها من حيث المدة وعمليات القراءة.', 'Setting ''Application Name=DevPath'' in the connection string lets you filter Extended Events to this app''s queries.', 'ضبط Application Name=DevPath في سلسلة الاتصال يتيح لك تصفية Extended Events على استعلامات هذا التطبيق فقط.', '-- Tag the connection so you can find this app''s queries
--   Server=...;Database=DevPath;Application Name=DevPath;...

CREATE EVENT SESSION DevPathQueries ON SERVER
ADD EVENT sqlserver.rpc_completed (
    ACTION (sqlserver.client_app_name, sqlserver.query_hash, sqlserver.sql_text)
    WHERE sqlserver.client_app_name = N''DevPath'')
ADD TARGET package0.ring_buffer;
GO
ALTER EVENT SESSION DevPathQueries ON SERVER STATE = START;

-- Common EF Core shapes to recognise:
--   OUTER APPLY / LEFT JOIN       → projections of related collections
--   OPENJSON(@ids)                → ids.Contains(x.Id)
--   OFFSET @p ROWS FETCH NEXT @n  → Skip/Take', 'sql', 'Create an Extended Events session filtered by application name and capture DevPath''s dashboard queries.', 'أنشئ جلسة Extended Events مُصفّاة باسم التطبيق، والتقط استعلامات لوحة المعلومات في DevPath.', 'Find the most expensive query DevPath runs and propose an index or code change.', 'ابحث عن أكثر استعلام مكلف ينفذه DevPath، واقترح فهرسًا أو تغييرًا في الكود.'),
  (72, 'sql-connection-management', 6, 10, 'SqlServer', 'Important', 25, 'Connection management and pooling', 'إدارة الاتصالات والتجميع (Pooling)', 'ADO.NET pools connections per connection string. Opening and closing is cheap; leaking connections (not disposing) exhausts the pool.', 'يجمّع ADO.NET الاتصالات لكل سلسلة اتصال، وفتح الاتصال وإغلاقه رخيص، أما تسريب الاتصالات (عدم التخلص منها) فيستنزف المجمّع.', '''Timeout expired... max pool size was reached'' is a classic production incident caused by application code, not by SQL Server.', 'الخطأ Timeout expired... max pool size was reached حادث إنتاج كلاسيكي سببه كود التطبيق وليس SQL Server.', 'Use ''using''/''await using'' for connections, keep DbContext scoped, don''t hold connections across awaits you don''t need. Monitor with sys.dm_exec_sessions by program_name.', 'استخدم using/await using مع الاتصالات، وأبقِ DbContext بنطاق Scoped، ولا تحتفظ بالاتصالات عبر عمليات انتظار غير ضرورية. وراقب باستخدام sys.dm_exec_sessions حسب program_name.', 'A background job created SqlConnection objects in a loop without disposing them and took the API down after an hour.', 'مهمة في الخلفية أنشأت كائنات SqlConnection داخل حلقة دون التخلص منها، فأوقفت الـ API بعد ساعة.', '// ✅ Disposed connections return to the pool immediately
await using (var connection = new SqlConnection(connectionString))
{
    await connection.OpenAsync(ct);
    // ... one unit of work
}

// ❌ Leak: never disposed → pool exhausted after 100 iterations
for (var i = 0; i < 1000; i++)
{
    var connection = new SqlConnection(connectionString);
    connection.Open();
}

// Who is connected?
// SELECT program_name, COUNT(*) AS sessions
// FROM sys.dm_exec_sessions WHERE is_user_process = 1
// GROUP BY program_name;', 'csharp', 'Count DevPath''s open sessions in sys.dm_exec_sessions while using the app.', 'احسب الجلسات المفتوحة لـ DevPath في sys.dm_exec_sessions أثناء استخدام التطبيق.', 'Reproduce pool exhaustion with Max Pool Size=5 and a leaking loop, then fix it.', 'أعد إنتاج استنزاف المجمّع باستخدام Max Pool Size=5 وحلقة مسرّبة، ثم أصلح ذلك.'),
  (73, 'sql-query-efficiency', 6, 11, 'SqlServer', 'Important', 30, 'Query efficiency from the application side', 'كفاءة الاستعلامات من جهة التطبيق', 'The cheapest query is the one you don''t run: fetch only needed columns and rows, batch round trips, and cache reference data.', 'أرخص استعلام هو الذي لا تنفذه: اجلب الأعمدة والصفوف المطلوبة فقط، وجمّع الرحلات إلى قاعدة البيانات، وخزّن البيانات المرجعية مؤقتًا.', 'A perfect index can''t fix an endpoint that sends 300 queries per page or reads 40 columns to display 3.', 'الفهرس المثالي لا يُصلح نقطة نهاية ترسل 300 استعلام لكل صفحة أو تقرأ 40 عمودًا لعرض 3 فقط.', 'Count queries per request, review the payload size, use projection and paging, and cache rarely-changing lookups with IMemoryCache.', 'احسب عدد الاستعلامات لكل طلب، وراجع حجم البيانات المرسلة، واستخدم التحويل والتقسيم إلى صفحات، وخزّن قوائم البحث نادرة التغير باستخدام IMemoryCache.', 'Loading the categories dropdown from cache instead of the database on every product edit removed 20% of database calls.', 'تحميل قائمة الفئات المنسدلة من الذاكرة المؤقتة بدلًا من قاعدة البيانات عند كل تعديل منتج أزال 20% من استدعاءات قاعدة البيانات.', 'public class CategoryCache(IMemoryCache cache, AppDbContext db)
{
    private const string Key = "categories";

    public Task<List<CategoryDto>> GetAllAsync(CancellationToken ct) =>
        cache.GetOrCreateAsync(Key, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            return await db.Categories.AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto(c.Id, c.Name))
                .ToListAsync(ct);
        })!;

    public void Invalidate() => cache.Remove(Key);   // call after creating/updating a category
}', 'csharp', 'Measure how many SQL statements DevPath runs to render the dashboard.', 'قِس عدد جمل SQL التي ينفذها DevPath لعرض لوحة المعلومات.', 'Add IMemoryCache for categories in Project 2 with invalidation when a category changes.', 'أضف IMemoryCache للفئات في المشروع الثاني، مع إبطال الذاكرة المؤقتة عند تغيّر أي فئة.'),
  (74, 'sql-pagination', 6, 12, 'SqlServer', 'Optional', 25, 'Pagination strategies: OFFSET vs keyset', 'استراتيجيات التقسيم إلى صفحات: OFFSET مقابل Keyset', 'OFFSET/FETCH is simple but reads and discards skipped rows. Keyset pagination (WHERE Id > @lastId) stays fast on deep pages.', 'الأسلوب OFFSET/FETCH بسيط لكنه يقرأ الصفوف المتخطاة ويتجاهلها، أما Keyset (WHERE Id > @lastId) فيبقى سريعًا في الصفحات العميقة.', 'Infinite scroll and exports over large tables need keyset pagination; page-number UIs usually need OFFSET plus a total count.', 'التمرير اللانهائي والتصدير من الجداول الكبيرة يحتاجان إلى Keyset، أما واجهات أرقام الصفحات فتحتاج عادةً إلى OFFSET مع العدد الإجمالي.', 'Keyset: order by a unique key, return the last key as a cursor, filter > cursor next time. Support it with an index on the ordering columns.', 'في Keyset: رتّب حسب مفتاح فريد، وأرجع آخر مفتاح كمؤشر (Cursor)، وصفِّ بما هو أكبر منه في المرة التالية، وادعم ذلك بفهرس على أعمدة الترتيب.', 'An audit log export with 5 million rows uses keyset pagination by (CreatedAt, Id).', 'تصدير سجل تدقيق يحتوي على 5 ملايين صف يستخدم Keyset حسب (CreatedAt, Id).', '// Keyset ("seek") pagination: fast on page 1 and page 10,000
public async Task<(List<OrderDto> Items, int? NextCursor)> PageAsync(int? afterId, int size, CancellationToken ct)
{
    var query = db.Orders.AsNoTracking();
    if (afterId is { } cursor)
        query = query.Where(o => o.Id > cursor);        // uses the clustered index

    var items = await query
        .OrderBy(o => o.Id)
        .Take(size + 1)                                   // one extra row tells us if there''s more
        .Select(o => new OrderDto(o.Id, o.OrderDate, o.Total))
        .ToListAsync(ct);

    int? next = items.Count > size ? items[size - 1].Id : null;
    return (items.Take(size).ToList(), next);
}', 'csharp', 'Implement keyset pagination in EF Core for orders sorted by Id.', 'نفّذ Keyset pagination في EF Core للطلبات المرتبة حسب Id.', 'Compare logical reads for page 1 and page 5,000 with both strategies using SET STATISTICS IO ON.', 'قارن عمليات القراءة المنطقية للصفحة 1 والصفحة 5000 بالاستراتيجيتين باستخدام SET STATISTICS IO ON.'),
  (75, 'sql-data-access-design', 6, 13, 'SqlServer', 'Important', 35, 'Data access design: EF Core, Dapper or stored procedures', 'تصميم الوصول إلى البيانات: EF Core أو Dapper أو الإجراءات المخزنة', 'Choose per use case: EF Core for CRUD and business logic, raw SQL/Dapper or stored procedures for heavy reporting and bulk operations.', 'اختر حسب حالة الاستخدام: EF Core لعمليات CRUD ومنطق العمل، وSQL الخام/Dapper أو الإجراءات المخزنة للتقارير الثقيلة والعمليات الجماعية.', 'Teams argue about this constantly. Your stored-procedure experience is an asset if you can explain trade-offs (testability, deployment, performance, ownership).', 'تتجادل الفرق حول هذا باستمرار، وخبرتك في الإجراءات المخزنة ميزة إذا استطعت شرح المفاضلات (قابلية الاختبار، والنشر، والأداء، والملكية).', 'Keep business rules in C# where they can be unit-tested; use set-based SQL where it''s dramatically faster. Call procedures from EF Core with SqlQuery/ExecuteSql and parameters.', 'أبقِ قواعد العمل في C# حيث يمكن اختبارها، واستخدم SQL القائم على المجموعات عندما يكون أسرع بشكل كبير. واستدعِ الإجراءات من EF Core باستخدام SqlQuery/ExecuteSql مع المعاملات.', 'The sales dashboard aggregates millions of rows in a stored procedure; order placement stays in C# with EF Core.', 'تجمّع لوحة المبيعات ملايين الصفوف في إجراء مخزن، بينما يبقى تقديم الطلبات في C# مع EF Core.', '// EF Core for business operations (testable C# rules)
order.Submit();                       // validates state transitions
await db.SaveChangesAsync(ct);

// Stored procedure for a heavy report, still parameterised
var rows = await db.Database
    .SqlQuery<SalesByRegionRow>($"EXEC dbo.usp_SalesByRegion @From = {from}, @To = {to}")
    .ToListAsync(ct);

// Set-based maintenance without loading entities
await db.Database.ExecuteSqlAsync($"EXEC dbo.usp_ArchiveOrders @Before = {cutoff}", ct);

public record SalesByRegionRow(string Region, int Orders, decimal Revenue);', 'csharp', 'Call an existing stored procedure from EF Core with parameters and map the result to a DTO.', 'استدعِ إجراءً مخزنًا موجودًا من EF Core بمعاملات، وحوّل النتيجة إلى DTO.', 'Write a one-page decision guide for your team: when EF Core, when raw SQL, when a stored procedure.', 'اكتب دليل قرار من صفحة واحدة لفريقك: متى EF Core، ومتى SQL الخام، ومتى الإجراء المخزن.'),
  (76, 'ts-types-inference', 7, 1, 'TypeScript', 'Core', 40, 'Types and type inference', 'الأنواع واستنتاج الأنواع', 'TypeScript adds static types to JavaScript: string, number, boolean, arrays, union types (string | null), literal types and ''unknown''. Types disappear when compiled to JavaScript.', 'تضيف TypeScript الأنواع الثابتة إلى JavaScript: string وnumber وboolean والمصفوفات وأنواع الاتحاد (string | null) والأنواع الحرفية وunknown. وتختفي الأنواع عند الترجمة إلى JavaScript.', 'Types catch typos and wrong API shapes while you type. Note the differences from C#: one ''number'' type, and types don''t exist at runtime.', 'تكتشف الأنواع الأخطاء الإملائية وأشكال الـ API الخاطئة أثناء الكتابة. ولاحظ الفروق عن C#: نوع واحد هو number، والأنواع غير موجودة وقت التشغيل.', 'Let the compiler infer where obvious (const total = 0). Annotate function parameters and public APIs. Avoid ''any''; prefer ''unknown'' and narrow it.', 'دع المترجم يستنتج حيث يكون الأمر واضحًا (const total = 0). وحدّد الأنواع لمعاملات الدوال والواجهات العامة. وتجنب any وفضّل unknown مع التضييق.', 'type Status = ''NotStarted'' | ''InProgress'' | ''Completed'' matches the strings this application''s API returns for topic status.', 'التعريف type Status = ''NotStarted'' | ''InProgress'' | ''Completed'' يطابق النصوص التي يُرجعها الـ API في هذا التطبيق لحالة الموضوع.', 'let productName: string = ''Keyboard'';
const price = 49.99;               // inferred: number (there is only ONE number type)
const inStock = true;              // inferred: boolean
const tags: string[] = [''new'', ''sale''];

type TopicStatus = ''NotStarted'' | ''InProgress'' | ''Completed'' | ''Skipped'';   // literal union
let status: TopicStatus = ''InProgress'';
// status = ''Done'';   ❌ compile error

let middleName: string | null = null;

function parse(input: unknown): number {
  if (typeof input === ''number'') return input;       // narrowed
  if (typeof input === ''string'') return Number(input);
  throw new Error(''Unsupported value'');
}', 'typescript', 'In the TypeScript playground, declare typed variables for a product and see what errors appear when you assign wrong types.', 'في TypeScript playground، عرّف متغيرات ذات أنواع لمنتج، ولاحظ الأخطاء التي تظهر عند إسناد أنواع خاطئة.', 'Explain why 0.1 + 0.2 !== 0.3 in TypeScript and how you''d handle money in the frontend.', 'اشرح لماذا 0.1 + 0.2 !== 0.3 في TypeScript، وكيف تتعامل مع المبالغ المالية في الواجهة.'),
  (77, 'ts-interfaces-aliases', 7, 2, 'TypeScript', 'Core', 35, 'Interfaces and type aliases', 'الواجهات (Interfaces) والأسماء البديلة للأنواع', 'interface and type describe object shapes. TypeScript is structural: any object with the right properties matches, regardless of its declared name.', 'تصف interface وtype أشكال الكائنات، وTypeScript لغة بنيوية: أي كائن يملك الخصائص الصحيحة يطابق النوع بغض النظر عن اسمه المعلن.', 'You''ll write an interface for every API DTO so Angular components know exactly what data they receive.', 'ستكتب Interface لكل DTO في الـ API، لكي تعرف مكونات Angular بالضبط البيانات التي تستقبلها.', 'interface ProductDto { id: number; name: string; price: number; description?: string; }. Use ''?'' for optional, ''readonly'' for immutable, and type for unions or mapped types.', 'التعريف interface ProductDto { id: number; name: string; price: number; description?: string; }. استخدم ? للاختياري، وreadonly لغير القابل للتغيير، وtype للاتحادات والأنواع المحوّلة.', 'DevPath''s frontend/src/app/core/models.ts mirrors the C# DTOs field by field (camelCase).', 'الملف frontend/src/app/core/models.ts في DevPath يعكس الـ DTOs الخاصة بـ C# حقلًا بحقل (بصيغة camelCase).', 'export interface ProductDto {
  readonly id: number;
  name: string;
  price: number;
  categoryId: number;
  description?: string;          // optional
}

// Derive request types instead of duplicating fields
export type CreateProductRequest = Omit<ProductDto, ''id''>;
export type UpdateProductRequest = Partial<CreateProductRequest>;
export type ProductListItem = Pick<ProductDto, ''id'' | ''name'' | ''price''>;

// Structural typing: no ''implements'' needed
const p: ProductListItem = { id: 1, name: ''Mouse'', price: 25 };', 'typescript', 'Write interfaces for Order and OrderLine that match a C# API response.', 'اكتب Interfaces لـ Order وOrderLine تطابق استجابة API مكتوب بـ C#.', 'Use Partial<T>, Pick<T, K> and Omit<T, K> to derive CreateProductRequest and UpdateProductRequest from ProductDto.', 'استخدم Partial<T> وPick<T, K> وOmit<T, K> لاشتقاق CreateProductRequest وUpdateProductRequest من ProductDto.'),
  (78, 'ts-functions', 7, 3, 'TypeScript', 'Core', 30, 'Functions and arrow functions', 'الدوال والدوال السهمية', 'Functions have typed parameters and return types. Arrow functions (x => x * 2) are like C# lambdas and keep the surrounding ''this''.', 'للدوال معاملات وأنواع إرجاع محددة، والدوال السهمية (x => x * 2) تشبه Lambda في C# وتحافظ على this المحيط بها.', 'Array methods (map, filter, reduce), event handlers and RxJS operators all take functions.', 'دوال المصفوفات (map وfilter وreduce) ومعالجات الأحداث وعوامل RxJS كلها تستقبل دوالًا.', 'Optional parameters use ''?'', defaults use ''='', rest parameters use ''...args''. map/filter/reduce are the JavaScript counterparts of Select/Where/Aggregate.', 'المعاملات الاختيارية تستخدم ?، والقيم الافتراضية تستخدم =، ومعاملات البقية تستخدم ...args. والدوال map/filter/reduce هي مقابلات Select/Where/Aggregate في JavaScript.', 'const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);', 'التعبير const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);', 'interface OrderLine { productId: number; quantity: number; unitPrice: number; }

function lineTotal(line: OrderLine, discount = 0): number {
  return line.quantity * line.unitPrice * (1 - discount);
}

// LINQ → array methods
const expensive = lines.filter(l => l.unitPrice > 100);          // Where
const totals = lines.map(l => lineTotal(l));                      // Select
const total = lines.reduce((sum, l) => sum + lineTotal(l), 0);    // Aggregate / Sum
const sorted = [...lines].sort((a, b) => a.unitPrice - b.unitPrice);  // OrderBy (copy first!)
const hasBig = lines.some(l => l.quantity > 10);                  // Any', 'typescript', 'Rewrite three LINQ queries from Phase 3 using map, filter, sort and reduce.', 'أعد كتابة ثلاثة استعلامات LINQ من المرحلة الثالثة باستخدام map وfilter وsort وreduce.', 'Explain why array.sort() without a compare function sorts [10, 9, 1] incorrectly.', 'اشرح لماذا ترتب array.sort() بدون دالة مقارنة المصفوفة [10, 9, 1] بشكل خاطئ.'),
  (79, 'ts-generics', 7, 4, 'TypeScript', 'Important', 30, 'Generics in TypeScript', 'الأنواع العامة في TypeScript', 'Generics work like in C#: function first<T>(items: T[]): T | undefined. Angular uses them everywhere: HttpClient.get<T>(), signal<T>(), Observable<T>.', 'تعمل الأنواع العامة كما في C#: function first<T>(items: T[]): T | undefined. وتستخدمها Angular في كل مكان: HttpClient.get<T>() وsignal<T>() وObservable<T>.', 'Typing http.get<ProductDto[]>() gives autocomplete and compile errors for every use of the response.', 'تحديد النوع في http.get<ProductDto[]>() يمنحك الإكمال التلقائي وأخطاء الترجمة عند كل استخدام للاستجابة.', 'Declare type parameters in angle brackets; constrain with ''extends'' (T extends { id: number }). Generic interfaces describe shared shapes like PagedResult<T>.', 'عرّف معاملات النوع بين علامتي < >، وقيّدها بـ extends (T extends { id: number })، وتصف الـ Interfaces العامة الأشكال المشتركة مثل PagedResult<T>.', 'interface PagedResult<T> { items: T[]; page: number; totalCount: number } is used for every paged list from the API.', 'تُستخدم interface PagedResult<T> { items: T[]; page: number; totalCount: number } لكل قائمة مقسّمة إلى صفحات من الـ API.', 'export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return map;
}

function sortBy<T>(items: T[], prop: keyof T): T[] {
  return [...items].sort((a, b) => (a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0));
}

// Angular: this.http.get<PagedResult<ProductDto>>(''/api/products'')', 'typescript', 'Write a generic groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]>.', 'اكتب دالة عامة groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]>.', 'Write a generic function that sorts any array of objects by a key with keyof T.', 'اكتب دالة عامة ترتب أي مصفوفة كائنات حسب مفتاح باستخدام keyof T.'),
  (80, 'ts-classes', 7, 5, 'TypeScript', 'Important', 30, 'Classes', 'الأصناف (Classes)', 'TypeScript classes have fields, constructors, methods, inheritance and ''implements''. Angular components and services are classes.', 'للأصناف في TypeScript حقول ومُنشئات ودوال ووراثة وimplements، ومكونات Angular وخدماتها أصناف.', 'Every Angular component you write is a class decorated with @Component, so class syntax is essential.', 'كل مكون Angular تكتبه Class مزيّن بـ @Component، لذا فصياغة الأصناف أساسية.', 'Fields can be initialised inline. Parameter properties (constructor(private api: Api)) declare and assign in one step, though Angular now prefers inject().', 'يمكن تهيئة الحقول مباشرة، وخصائص المعاملات (constructor(private api: Api)) تعرّف وتُسند في خطوة واحدة، رغم أن Angular تفضّل الآن inject().', 'export class TopicDetailPage { private readonly api = inject(ApiService); readonly topic = signal<TopicDetail | null>(null); }', 'التعريف export class TopicDetailPage { private readonly api = inject(ApiService); readonly topic = signal<TopicDetail | null>(null); }', 'interface Cart {
  add(productId: number, quantity: number): void;
  total(): number;
}

export class ShoppingCart implements Cart {
  private readonly lines = new Map<number, { quantity: number; price: number }>();

  constructor(private readonly prices: Record<number, number>) {}

  add(productId: number, quantity: number): void {
    const existing = this.lines.get(productId)?.quantity ?? 0;
    this.lines.set(productId, { quantity: existing + quantity, price: this.prices[productId] });
  }

  remove(productId: number): void {
    this.lines.delete(productId);
  }

  total(): number {
    let sum = 0;
    for (const { quantity, price } of this.lines.values()) sum += quantity * price;
    return sum;
  }
}', 'typescript', 'Write a ShoppingCart class with add, remove and total, and an interface it implements.', 'اكتب Class باسم ShoppingCart يحتوي على add وremove وtotal، وInterface ينفّذه.', 'Compare a TypeScript class and the same C# class; list three differences.', 'قارن Class في TypeScript بالـ Class نفسه في C#، واذكر ثلاثة فروق.'),
  (81, 'ts-access-modifiers', 7, 6, 'TypeScript', 'Optional', 20, 'Access modifiers and readonly', 'مُعدِّلات الوصول وreadonly', 'public, private, protected and readonly control access at compile time. JavaScript''s #private fields enforce privacy at runtime.', 'تتحكم public وprivate وprotected وreadonly في الوصول وقت الترجمة، وتفرض حقول #private في JavaScript الخصوصية وقت التشغيل.', 'Angular templates can only use members that are public or protected. Marking internals private makes components easier to understand.', 'قوالب Angular تستطيع استخدام الأعضاء public أو protected فقط، وجعل التفاصيل الداخلية private يسهّل فهم المكونات.', 'Use ''protected'' for members the template needs, ''private'' for internal ones and ''readonly'' for injected services and signals that are never reassigned.', 'استخدم protected للأعضاء التي يحتاجها القالب، وprivate للداخلية، وreadonly للخدمات المحقونة والـ Signals التي لا يُعاد إسنادها.', 'protected readonly topics = signal<Topic[]>([]); private readonly api = inject(ApiService);', 'التعريف protected readonly topics = signal<Topic[]>([]); private readonly api = inject(ApiService);', '@Component({
  selector: ''app-topic-list'',
  template: `@for (t of topics(); track t.id) { <li>{{ t.titleEn }}</li> }`,
})
export class TopicListComponent {
  private readonly api = inject(ApiService);          // internal: template can''t use it
  protected readonly topics = signal<TopicSummary[]>([]);   // template needs it

  #cache = new Map<number, TopicSummary>();           // truly private at runtime too

  protected async refresh(): Promise<void> {
    this.topics.set(await this.api.getTopics());
  }
}', 'typescript', 'Review one DevPath component and explain why each member is public, protected or private.', 'راجع مكونًا واحدًا من DevPath واشرح لماذا كل عضو public أو protected أو private.', 'Show that ''private'' in TypeScript can still be accessed at runtime from JavaScript, and when that matters.', 'أثبت أن private في TypeScript يمكن الوصول إليه وقت التشغيل من JavaScript، ومتى يهم ذلك.'),
  (82, 'ts-modules', 7, 7, 'TypeScript', 'Important', 25, 'Modules: import and export', 'الوحدات: import وexport', 'Each .ts file is a module. ''export'' makes something available, ''import'' brings it in. This replaces C# namespaces and using statements.', 'كل ملف .ts وحدة مستقلة، تجعل export الشيء متاحًا، وتستورده import، وهذا يحل محل Namespaces وعبارات using في C#.', 'Angular apps are organised as many small modules; understanding import paths helps you navigate an unfamiliar codebase.', 'تُنظَّم تطبيقات Angular كوحدات صغيرة كثيرة، وفهم مسارات الاستيراد يساعدك على التنقل في قاعدة كود غير مألوفة.', 'Use named exports (export class X) and import { X } from ''./x''. Relative paths start with ./ or ../; packages are imported by name (''@angular/core'').', 'استخدم التصدير المسمّى (export class X) والاستيراد import { X } from ''./x''. تبدأ المسارات النسبية بـ ./ أو ../، وتُستورد الحزم باسمها (''@angular/core'').', 'import { ApiService } from ''../../core/api.service''; inside a feature component.', 'السطر import { ApiService } from ''../../core/api.service''; داخل مكون ميزة.', '// money.ts
export function formatMoney(value: number, currency = ''EGP''): string {
  return new Intl.NumberFormat(''en'', { style: ''currency'', currency }).format(value);
}
export const VAT_RATE = 0.14;

// order-summary.ts
import { formatMoney, VAT_RATE } from ''./money'';          // relative path
import { Component, signal } from ''@angular/core'';         // package

export function withVat(amount: number): string {
  return formatMoney(amount * (1 + VAT_RATE));
}', 'typescript', 'Split a utility file into two modules and fix the imports.', 'قسّم ملف أدوات إلى وحدتين وأصلح عبارات الاستيراد.', 'Find a circular import in a sample project and explain how to break it.', 'ابحث عن استيراد دائري في مشروع تجريبي واشرح كيف تكسره.'),
  (83, 'ts-promises', 7, 8, 'TypeScript', 'Important', 30, 'Promises', 'الوعود (Promises)', 'A Promise represents a value that will be available later — the JavaScript counterpart of Task<T>. It resolves with a value or rejects with an error.', 'الـ Promise تمثل قيمة ستكون متاحة لاحقًا، وهي مقابل Task<T> في JavaScript، وتُحل بقيمة أو تُرفض بخطأ.', 'fetch(), many browser APIs and async/await are built on promises. Angular''s HttpClient uses Observables, but you''ll meet promises constantly.', 'تُبنى fetch() وكثير من واجهات المتصفح وasync/await على الـ Promises. ويستخدم HttpClient في Angular الـ Observables، لكنك ستقابل الـ Promises باستمرار.', 'Chain with .then()/.catch() or use async/await. Promise.all runs several at once, like Task.WhenAll.', 'اربطها بـ .then()/.catch() أو استخدم async/await، وتشغّل Promise.all عدة وعود في وقت واحد مثل Task.WhenAll.', 'Promise.all([loadTopics(), loadProgress()]) waits for both before rendering.', 'التعبير Promise.all([loadTopics(), loadProgress()]) ينتظر الاثنين قبل العرض.', 'function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

fetch(''/api/health'')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(body => console.log(body.status))
  .catch(error => console.error(''Request failed'', error))
  .finally(() => console.log(''done''));

// Like Task.WhenAll
const [topics, progress] = await Promise.all([loadTopics(), loadProgress()]);', 'typescript', 'Wrap setTimeout in a delay(ms): Promise<void> function and use it.', 'غلّف setTimeout في دالة delay(ms): Promise<void> واستخدمها.', 'Compare a Promise and an Observable: eager vs lazy, single vs multiple values, cancellation.', 'قارن بين Promise وObservable: التنفيذ الفوري مقابل الكسول، والقيمة الواحدة مقابل القيم المتعددة، والإلغاء.'),
  (84, 'ts-async-await', 7, 9, 'TypeScript', 'Important', 25, 'async/await in TypeScript', 'async/await في TypeScript', 'async functions return a Promise and ''await'' pauses until a promise settles — nearly identical to C#.', 'الدوال async تُرجع Promise، وتوقف await التنفيذ حتى تكتمل الـ Promise، وهو مطابق تقريبًا لما في C#.', 'It makes asynchronous code read top to bottom and lets you use normal try/catch for errors.', 'تجعل الكود غير المتزامن يُقرأ من الأعلى إلى الأسفل، وتتيح استخدام try/catch العادية للأخطاء.', 'Mark the function async, await promises, wrap in try/catch. Use firstValueFrom(observable) when you need to await an Observable once.', 'علّم الدالة بـ async، وانتظر الوعود بـ await، وغلّفها في try/catch. واستخدم firstValueFrom(observable) عندما تحتاج لانتظار Observable مرة واحدة.', 'DevPath''s API service uses firstValueFrom(http.get(...)) so components can ''await'' API calls.', 'تستخدم خدمة الـ API في DevPath الدالة firstValueFrom(http.get(...)) لكي تستطيع المكونات انتظار استدعاءات الـ API بـ await.', 'import { firstValueFrom } from ''rxjs'';

async function loadDashboard(http: HttpClient): Promise<Dashboard | null> {
  try {
    // Await an Observable that emits once (HttpClient requests do)
    return await firstValueFrom(http.get<Dashboard>(''/api/dashboard''));
  } catch (error) {
    console.error(''Could not load the dashboard'', error);
    return null;
  }
}

// Sequential (slow): each waits for the previous
const a = await fetchA();
const b = await fetchB();

// Concurrent (fast): start both, then wait
const [x, y] = await Promise.all([fetchA(), fetchB()]);', 'typescript', 'Call a public API with fetch using async/await and show the result or an error message.', 'استدعِ API عامًا باستخدام fetch مع async/await، واعرض النتيجة أو رسالة خطأ.', 'Write code that awaits three independent requests sequentially, measure it, then make them concurrent.', 'اكتب كودًا ينتظر ثلاثة طلبات مستقلة بالتتابع، وقِس زمنه، ثم اجعلها متزامنة.'),
  (85, 'ts-error-handling', 7, 10, 'TypeScript', 'Important', 25, 'Error handling in TypeScript', 'معالجة الأخطاء في TypeScript', 'try/catch/finally works like C#, but the caught value is ''unknown'' — anything can be thrown — so you must check its type before using it.', 'تعمل try/catch/finally كما في C#، لكن القيمة الملتقطة من النوع unknown لأنه يمكن رمي أي شيء، لذا يجب التحقق من نوعها قبل استخدامها.', 'Robust frontends show friendly messages for network failures, validation errors and server errors instead of a blank screen.', 'الواجهات القوية تعرض رسائل ودية لأعطال الشبكة وأخطاء التحقق وأخطاء الخادم بدلًا من شاشة فارغة.', 'Use ''instanceof'' (Error, HttpErrorResponse) to narrow the error. Translate error codes from the API into user-facing messages in one place.', 'استخدم instanceof (Error وHttpErrorResponse) لتضييق نوع الخطأ، وترجم رموز الأخطاء القادمة من الـ API إلى رسائل للمستخدم في مكان واحد.', 'DevPath converts HttpErrorResponse into an ApiError with a status, a code (e.g. ''attempt_required'') and field errors.', 'يحوّل DevPath الاستجابة HttpErrorResponse إلى ApiError يحتوي على الحالة ورمز (مثل attempt_required) وأخطاء الحقول.', 'import { HttpErrorResponse } from ''@angular/common/http'';

export function toMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return ''Cannot reach the server. Is the API running?'';
    if (error.status === 404) return ''Not found.'';
    const code = error.error?.code as string | undefined;   // e.g. ''attempt_required''
    return code ? translateCode(code) : `Server error (${error.status}).`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

try {
  await saveNote(form.value);
} catch (e: unknown) {
  toast.error(toMessage(e));
} finally {
  saving.set(false);
}', 'typescript', 'Write a function that turns any caught value into a readable message string.', 'اكتب دالة تحوّل أي قيمة ملتقطة إلى نص رسالة مقروء.', 'Design an error model for your Angular app that distinguishes offline, validation, not found and server errors.', 'صمّم نموذج أخطاء لتطبيق Angular يميز بين انقطاع الاتصال وأخطاء التحقق وعدم الوجود وأخطاء الخادم.'),
  (86, 'ts-narrowing', 7, 11, 'TypeScript', 'Important', 25, 'Type narrowing', 'تضييق الأنواع (Type narrowing)', 'TypeScript narrows a union type after checks like typeof, instanceof, ''in'', equality or discriminant properties, so you can safely use the specific type.', 'تضيّق TypeScript نوع الاتحاد بعد فحوص مثل typeof وinstanceof وin والمساواة والخصائص المميِّزة، فتستطيع استخدام النوع المحدد بأمان.', 'It''s how you handle ''value or null'', API responses with different shapes, and state like loading | loaded | error safely.', 'إنه طريقتك للتعامل بأمان مع القيمة أو null، واستجابات الـ API بأشكال مختلفة، وحالات مثل loading | loaded | error.', 'Use discriminated unions: type State = { kind: ''loading'' } | { kind: ''error''; message: string } | { kind: ''ready''; data: T }, then switch on ''kind''.', 'استخدم الاتحادات المميَّزة: type State = { kind: ''loading'' } | { kind: ''error''; message: string } | { kind: ''ready''; data: T }، ثم استخدم switch على kind.', 'if (topic) { ... } narrows ''TopicDetail | null'' to TopicDetail inside the block, like C# nullable flow analysis.', 'الشرط if (topic) { ... } يضيّق النوع TopicDetail | null إلى TopicDetail داخل الكتلة، مثل تحليل التدفق للأنواع القابلة لـ null في C#.', 'type LoadState<T> =
  | { kind: ''loading'' }
  | { kind: ''error''; message: string }
  | { kind: ''ready''; data: T };

function render(state: LoadState<string[]>): string {
  switch (state.kind) {
    case ''loading'': return ''Loading…'';
    case ''error'':   return `Error: ${state.message}`;       // message exists here
    case ''ready'':   return `${state.data.length} items`;    // data exists here
    default: {
      const unreachable: never = state;                     // compile error if a case is missing
      return unreachable;
    }
  }
}

function label(value: string | number | null): string {
  if (value === null) return ''—'';
  if (typeof value === ''number'') return value.toFixed(2);
  return value.trim();
}', 'typescript', 'Model a request state as a discriminated union and render each case.', 'نمذج حالة طلب كاتحاد مميَّز، واعرض كل حالة.', 'Use a ''never'' check in a switch to make the compiler fail when a new state is added but not handled.', 'استخدم فحص never داخل switch لجعل المترجم يفشل عند إضافة حالة جديدة دون معالجتها.'),
  (87, 'ng-architecture', 8, 1, 'Angular', 'Core', 40, 'Angular architecture', 'بنية Angular', 'An Angular app is a tree of components (UI), services (logic and data access) and routes (which component shows for which URL), bootstrapped from main.ts with app.config.ts.', 'تطبيق Angular شجرة من المكونات (الواجهة) والخدمات (المنطق والوصول إلى البيانات) والمسارات (أي مكون يظهر لأي عنوان)، ويبدأ من main.ts مع app.config.ts.', 'Knowing where things live lets you open any Angular project and find the screen, the service that loads its data and the route that shows it.', 'معرفة مكان كل شيء تتيح لك فتح أي مشروع Angular والعثور على الشاشة، والخدمة التي تحمّل بياناتها، والمسار الذي يعرضها.', 'main.ts calls bootstrapApplication(App, appConfig). appConfig provides the router, HttpClient and other app-wide services. ''ng serve'' runs a dev server with live reload.', 'يستدعي main.ts الدالة bootstrapApplication(App, appConfig)، ويوفر appConfig الموجّه وHttpClient وخدمات أخرى على مستوى التطبيق، ويشغّل ng serve خادم تطوير مع إعادة تحميل مباشرة.', 'In DevPath: features/ holds pages, core/ holds the API client and i18n, shared/ holds reusable UI like the progress ring.', 'في DevPath: يحتوي features/ على الصفحات، وcore/ على عميل الـ API والترجمة، وshared/ على عناصر الواجهة القابلة لإعادة الاستخدام مثل حلقة التقدم.', '// main.ts — the entry point
bootstrapApplication(App, appConfig).catch(err => console.error(err));

// app.config.ts — app-wide providers
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};

// src/app/
//   core/       api client, i18n, theme (singletons)
//   shared/     reusable UI components
//   layout/     the application shell
//   features/   one folder per screen, lazy-loaded', 'typescript', 'Create an app with ''ng new'', then map each generated file to its role.', 'أنشئ تطبيقًا بالأمر ng new، ثم حدد دور كل ملف مولَّد.', 'Draw the component tree of DevPath''s dashboard page and list which service each component uses.', 'ارسم شجرة المكونات لصفحة لوحة المعلومات في DevPath، واذكر الخدمة التي يستخدمها كل مكون.'),
  (88, 'ng-standalone-components', 8, 2, 'Angular', 'Core', 40, 'Standalone components', 'المكونات المستقلة (Standalone)', 'A component is a class with @Component that combines a template, styles and logic. Standalone components declare their own dependencies in ''imports'' — no NgModules needed.', 'المكون Class مزيّن بـ @Component يجمع القالب والأنماط والمنطق، والمكونات المستقلة تعلن عن اعتمادياتها في imports دون الحاجة إلى NgModules.', 'Components are the unit of UI work. Most tickets you''ll get are ''change this component'' or ''build a new one''.', 'المكونات وحدة العمل في الواجهة، ومعظم المهام التي ستحصل عليها ستكون: عدّل هذا المكون أو ابنِ مكونًا جديدًا.', '''ng generate component name'' creates the files. The selector (app-product-card) is used as an HTML tag. Keep components small and focused.', 'ينشئ الأمر ng generate component name الملفات، ويُستخدم الـ selector (app-product-card) كوسم HTML، واحرص على أن تكون المكونات صغيرة ومركّزة.', '<app-progress-ring [value]="42" /> renders DevPath''s reusable progress ring component.', 'الوسم <app-progress-ring [value]="42" /> يعرض مكون حلقة التقدم القابل لإعادة الاستخدام في DevPath.', 'import { Component, input } from ''@angular/core'';
import { CurrencyPipe } from ''@angular/common'';

@Component({
  selector: ''app-product-card'',
  imports: [CurrencyPipe],               // dependencies of THIS component
  template: `
    <article class="card">
      <h3>{{ product().name }}</h3>
      <p>{{ product().price | currency }}</p>
      @if (product().stock === 0) { <span class="badge">Out of stock</span> }
    </article>
  `,
  styles: `.card { padding: 1rem; border-radius: 12px; }`,
})
export class ProductCardComponent {
  readonly product = input.required<{ name: string; price: number; stock: number }>();
}', 'typescript', 'Create a ProductCard component that displays a product''s name, price and stock badge.', 'أنشئ مكون ProductCard يعرض اسم المنتج وسعره وشارة المخزون.', 'Split a 300-line component into a container (data) and two presentational components (UI).', 'قسّم مكونًا من 300 سطر إلى مكون حاوية (للبيانات) ومكونين للعرض (للواجهة).'),
  (89, 'ng-templates-binding', 8, 3, 'Angular', 'Core', 45, 'Templates, data binding and control flow', 'القوالب وربط البيانات والتحكم في التدفق', 'Templates use {{ interpolation }}, [property] binding, (event) binding and built-in control flow: @if, @for (with track) and @switch.', 'تستخدم القوالب {{ interpolation }} وربط الخصائص [property] وربط الأحداث (event) والتحكم المدمج في التدفق: @if و@for (مع track) و@switch.', 'This is how data reaches the screen and how user actions reach your code.', 'هكذا تصل البيانات إلى الشاشة وتصل أفعال المستخدم إلى كودك.', '[disabled]="saving()" sets a DOM property, (click)="save()" calls a method, @for (item of items(); track item.id) renders a list efficiently.', 'التعبير [disabled]="saving()" يضبط خاصية DOM، و(click)="save()" يستدعي دالة، و@for (item of items(); track item.id) يعرض قائمة بكفاءة.', '@if (loading()) { <app-skeleton /> } @else { @for (t of topics(); track t.id) { <app-topic-row [topic]="t" /> } }', 'التعبير @if (loading()) { <app-skeleton /> } @else { @for (t of topics(); track t.id) { <app-topic-row [topic]="t" /> } }', '<!-- Interpolation, property binding and event binding -->
<h2>{{ title() }}</h2>
<button type="button" [disabled]="saving()" (click)="save()">Save</button>
<input [value]="query()" (input)="query.set($any($event.target).value)" />

<!-- Built-in control flow -->
@if (loading()) {
  <app-skeleton />
} @else if (products().length === 0) {
  <p>No products yet.</p>
} @else {
  <ul>
    @for (p of products(); track p.id) {
      <li [class.low]="p.stock < 5">{{ p.name }} — {{ p.stock }}</li>
    }
  </ul>
}

@switch (status()) {
  @case (''Completed'') { <span>Done</span> }
  @default { <span>In progress</span> }
}', 'html', 'Render a product list with @for, show ''Out of stock'' with @if and toggle details on click.', 'اعرض قائمة منتجات بـ @for، وأظهر عبارة نفاد المخزون بـ @if، وبدّل عرض التفاصيل عند النقر.', 'Explain why ''track'' matters by rendering 1,000 rows with and without a stable key and comparing DOM updates.', 'اشرح أهمية track بعرض 1000 صف مع مفتاح ثابت وبدونه، ومقارنة تحديثات DOM.'),
  (90, 'ng-inputs-outputs', 8, 4, 'Angular', 'Core', 35, 'Inputs and outputs', 'المدخلات والمخرجات (Inputs/Outputs)', 'input() lets a parent pass data down to a child; output() lets the child emit events up to the parent.', 'تتيح input() للأب تمرير البيانات إلى الابن، وتتيح output() للابن إطلاق الأحداث إلى الأب.', 'This is the basic contract of reusable components: data in, events out, no hidden coupling.', 'هذا هو العقد الأساسي للمكونات القابلة لإعادة الاستخدام: بيانات تدخل، وأحداث تخرج، دون ارتباط خفي.', 'product = input.required<Product>() reads like a signal: product(). selected = output<number>() emits with this.selected.emit(id). The parent binds [product]="p" (selected)="onSelect($event)".', 'التعريف product = input.required<Product>() يُقرأ مثل Signal: product(). والتعريف selected = output<number>() يُطلق بـ this.selected.emit(id). ويربط الأب [product]="p" (selected)="onSelect($event)".', 'A ConfirmDialog takes [message] as input and emits (confirmed) or (cancelled).', 'مكون ConfirmDialog يستقبل [message] كمدخل ويُطلق (confirmed) أو (cancelled).', '@Component({
  selector: ''app-product-row'',
  template: `
    <span>{{ product().name }}</span>
    <button type="button" (click)="addToCart.emit(product().id)">Add</button>
  `,
})
export class ProductRowComponent {
  readonly product = input.required<Product>();   // data in
  readonly compact = input(false);                 // optional with default
  readonly addToCart = output<number>();           // events out
}

// Parent template:
// <app-product-row [product]="p" (addToCart)="cart.add($event)" />

// Two-way binding with model()
export class RatingComponent {
  readonly rating = model(0);                      // <app-rating [(rating)]="score" />
  rate(value: number) { this.rating.set(value); }
}', 'typescript', 'Make ProductCard emit addToCart with the product id, and handle it in the parent list.', 'اجعل ProductCard يُطلق الحدث addToCart مع معرف المنتج، وتعامل معه في القائمة الأب.', 'Build a star-rating component with model() for two-way binding: [(rating)]="value".', 'ابنِ مكون تقييم بالنجوم باستخدام model() للربط في الاتجاهين: [(rating)]="value".'),
  (91, 'ng-services', 8, 5, 'Angular', 'Core', 35, 'Services', 'الخدمات (Services)', 'Services hold logic and state that doesn''t belong in a single component: API calls, shared state, formatting, translation.', 'تحمل الخدمات المنطق والحالة التي لا تنتمي إلى مكون واحد: استدعاءات الـ API، والحالة المشتركة، والتنسيق، والترجمة.', 'Keeping API calls in services means components stay simple, and the same call isn''t duplicated across screens.', 'إبقاء استدعاءات الـ API في الخدمات يجعل المكونات بسيطة، ويمنع تكرار الاستدعاء نفسه في عدة شاشات.', '@Injectable({ providedIn: ''root'' }) creates one shared instance. Inject it with inject(MyService).', 'التعريف @Injectable({ providedIn: ''root'' }) يُنشئ نسخة واحدة مشتركة، وتُحقن الخدمة بـ inject(MyService).', 'DevPath''s I18nService holds the current language as a signal; every component reads translations from it.', 'تحتفظ I18nService في DevPath باللغة الحالية كـ Signal، وتقرأ كل المكونات الترجمات منها.', 'import { Injectable, computed, signal } from ''@angular/core'';

export interface CartItem { productId: number; name: string; price: number; quantity: number; }

@Injectable({ providedIn: ''root'' })        // one shared instance
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  add(item: CartItem): void {
    this._items.update(items => [...items, item]);
  }

  remove(productId: number): void {
    this._items.update(items => items.filter(i => i.productId !== productId));
  }
}

// In a component:  private readonly cart = inject(CartService);', 'typescript', 'Create a CartService with a signal of items, add/remove methods and a computed total.', 'أنشئ CartService يحتوي على Signal للعناصر، ودوال add/remove، وإجمالي محسوب بـ computed.', 'Move all HTTP calls from three components into one service and verify nothing else changed.', 'انقل كل استدعاءات HTTP من ثلاثة مكونات إلى خدمة واحدة، وتحقق أن شيئًا آخر لم يتغير.'),
  (92, 'ng-dependency-injection', 8, 6, 'Angular', 'Core', 30, 'Dependency injection in Angular', 'حقن الاعتماديات في Angular', 'Angular''s injector creates and shares services. inject() requests them; providers decide which implementation and at which level (root, route, component).', 'ينشئ الحاقن في Angular الخدمات ويشاركها، وتطلبها inject()، ويحدد مزودو الخدمات (Providers) التطبيق المستخدم وعلى أي مستوى (الجذر، أو المسار، أو المكون).', 'Same idea as ASP.NET Core DI — you''ll recognise it. It''s also how tests replace real services with fakes.', 'الفكرة نفسها كما في ASP.NET Core وستتعرف عليها، وهي أيضًا طريقة الاختبارات لاستبدال الخدمات الحقيقية ببدائل.', 'providedIn: ''root'' ≈ Singleton. Providing in a component gives each component instance its own service. Use InjectionToken for config values.', 'الخيار providedIn: ''root'' يعادل Singleton، وتوفير الخدمة داخل مكون يعطي كل نسخة من المكون خدمتها الخاصة. واستخدم InjectionToken لقيم الإعدادات.', 'An API_BASE_URL InjectionToken lets tests point the ApiService to a fake server.', 'يتيح InjectionToken باسم API_BASE_URL للاختبارات توجيه ApiService إلى خادم وهمي.', 'import { InjectionToken, inject } from ''@angular/core'';

export const API_BASE_URL = new InjectionToken<string>(''API_BASE_URL'');

// app.config.ts
providers: [{ provide: API_BASE_URL, useValue: ''http://localhost:5080/api'' }];

@Injectable({ providedIn: ''root'' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list() { return this.http.get<ProductDto[]>(`${this.baseUrl}/products`); }
}

// Component-level provider: every instance gets its own EditorState
@Component({ selector: ''app-editor'', providers: [EditorState], template: '''' })
export class EditorComponent {}', 'typescript', 'Create an InjectionToken for the API URL and provide it in app.config.ts.', 'أنشئ InjectionToken لعنوان الـ API ووفّره في app.config.ts.', 'Provide a service at component level and show that two instances of the component don''t share state.', 'وفّر خدمة على مستوى المكون، وأثبت أن نسختين من المكون لا تتشاركان الحالة.'),
  (93, 'ng-routing', 8, 7, 'Angular', 'Core', 45, 'Routing', 'التوجيه (Routing)', 'The router maps URLs to components, supports parameters (/topics/:id), lazy loading, guards and query parameters.', 'يربط الموجّه العناوين بالمكونات، ويدعم المعاملات (/topics/:id) والتحميل الكسول والحراس (Guards) ومعاملات الاستعلام.', 'Routes make screens bookmarkable and shareable, and lazy loading keeps the first load fast.', 'تجعل المسارات الشاشات قابلة للحفظ في المفضلة والمشاركة، ويحافظ التحميل الكسول على سرعة التحميل الأول.', 'Define routes in app.routes.ts with loadComponent for lazy loading. Use routerLink for links and withComponentInputBinding() to receive :id as an input().', 'عرّف المسارات في app.routes.ts مع loadComponent للتحميل الكسول، واستخدم routerLink للروابط، وwithComponentInputBinding() لاستقبال :id كـ input().', 'DevPath''s /topics/:id route lazy-loads the topic detail page and passes the id as a component input.', 'المسار /topics/:id في DevPath يحمّل صفحة تفاصيل الموضوع بشكل كسول ويمرر المعرف كمدخل للمكون.', '// app.routes.ts
export const routes: Routes = [
  { path: '''', redirectTo: ''products'', pathMatch: ''full'' },
  { path: ''products'', loadComponent: () => import(''./features/products/product-list.page'') },
  { path: ''products/:id'', loadComponent: () => import(''./features/products/product-detail.page'') },
  { path: ''**'', loadComponent: () => import(''./features/not-found.page'') },
];

// app.config.ts:  provideRouter(routes, withComponentInputBinding())

// product-detail.page.ts — the :id route parameter arrives as an input
export default class ProductDetailPage {
  readonly id = input.required<string>();
}

// Template links
// <a routerLink="/products/42">Details</a>
// <a [routerLink]="[''/products'']" [queryParams]="{ page: 2 }">Page 2</a>', 'typescript', 'Add /products and /products/:id routes and link from the list to the detail page.', 'أضف المسارين /products و/products/:id، واربط القائمة بصفحة التفاصيل.', 'Store list filters in query parameters so a filtered list survives refresh and can be shared.', 'خزّن مرشحات القائمة في معاملات الاستعلام لكي تبقى القائمة المُصفّاة بعد التحديث ويمكن مشاركتها.'),
  (94, 'ng-reactive-forms', 8, 8, 'Angular', 'Core', 60, 'Reactive forms', 'النماذج التفاعلية (Reactive Forms)', 'Reactive forms define the form model in TypeScript (FormGroup, FormControl, validators) and bind it to inputs with [formGroup] and formControlName.', 'تعرّف النماذج التفاعلية نموذج الاستمارة في TypeScript (FormGroup وFormControl والمتحققات) وتربطه بالحقول عبر [formGroup] وformControlName.', 'Business apps are mostly forms. Reactive forms are typed, testable and handle complex validation well.', 'تطبيقات الأعمال في معظمها استمارات، والنماذج التفاعلية محددة الأنواع وقابلة للاختبار وتتعامل جيدًا مع التحقق المعقد.', 'Use inject(FormBuilder).nonNullable.group({ name: ['''', [Validators.required, Validators.maxLength(100)]] }). Check form.invalid before submitting and show errors when a control is touched.', 'استخدم inject(FormBuilder).nonNullable.group({ name: ['''', [Validators.required, Validators.maxLength(100)]] }). وتحقق من form.invalid قبل الإرسال، واعرض الأخطاء عندما يُلمس الحقل.', 'DevPath''s note editor is a reactive form with required title, max length validation and translated error messages.', 'محرر الملاحظات في DevPath نموذج تفاعلي بعنوان مطلوب، وتحقق من الطول الأقصى، ورسائل خطأ مترجمة.', 'import { ReactiveFormsModule, FormBuilder, Validators } from ''@angular/forms'';

@Component({
  selector: ''app-product-form'',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label for="name">Name</label>
      <input id="name" formControlName="name" />
      @if (form.controls.name.touched && form.controls.name.hasError(''required'')) {
        <small class="error">Name is required.</small>
      }

      <label for="price">Price</label>
      <input id="price" type="number" formControlName="price" />

      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly form = this.fb.group({
    name: ['''', [Validators.required, Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log(this.form.getRawValue());   // { name: string; price: number }
  }
}', 'typescript', 'Build a product form with name, price and category, with validation messages under each field.', 'ابنِ نموذج منتج بالاسم والسعر والفئة، مع رسائل تحقق أسفل كل حقل.', 'Write a custom cross-field validator (end date after start date) and display its error.', 'اكتب متحققًا مخصصًا بين الحقول (تاريخ النهاية بعد تاريخ البداية) واعرض خطأه.'),
  (95, 'ng-http-client', 8, 9, 'Angular', 'Core', 45, 'HttpClient', 'الـ HttpClient', 'HttpClient sends HTTP requests and returns Observables of typed responses. Interceptors add cross-cutting behaviour like headers and error handling.', 'يرسل HttpClient طلبات HTTP ويُرجع Observables لاستجابات محددة الأنواع، وتضيف الـ Interceptors سلوكًا مشتركًا مثل الرؤوس ومعالجة الأخطاء.', 'It''s how every Angular screen talks to your ASP.NET Core API.', 'إنه وسيلة كل شاشة Angular للتواصل مع ASP.NET Core API الخاص بك.', 'provideHttpClient(withInterceptors([...])) in app.config.ts. Then http.get<ProductDto[]>(url), post, put, delete. Requests only run when subscribed (or awaited with firstValueFrom).', 'استخدم provideHttpClient(withInterceptors([...])) في app.config.ts، ثم http.get<ProductDto[]>(url) وpost وput وdelete. ولا تُنفَّذ الطلبات إلا عند الاشتراك (أو الانتظار بـ firstValueFrom).', 'DevPath''s ApiService wraps every endpoint in one place and converts errors into a consistent ApiError.', 'تغلّف ApiService في DevPath كل نقاط النهاية في مكان واحد وتحوّل الأخطاء إلى ApiError موحد.', '@Injectable({ providedIn: ''root'' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly url = ''http://localhost:5080/api/products'';

  list(page = 1) {
    return this.http.get<PagedResult<ProductDto>>(this.url, { params: { page } });
  }
  get(id: number)                         { return this.http.get<ProductDto>(`${this.url}/${id}`); }
  create(body: CreateProductRequest)      { return this.http.post<ProductDto>(this.url, body); }
  update(id: number, body: UpdateProductRequest) { return this.http.put<void>(`${this.url}/${id}`, body); }
  delete(id: number)                      { return this.http.delete<void>(`${this.url}/${id}`); }
}

// A functional interceptor
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = inject(I18nService).lang();
  return next(req.clone({ setHeaders: { ''Accept-Language'': lang } }));
};', 'typescript', 'Create a ProductsApi service with list, get, create, update and delete methods.', 'أنشئ خدمة ProductsApi تحتوي على دوال list وget وcreate وupdate وdelete.', 'Write an interceptor that adds an Accept-Language header from the current UI language.', 'اكتب Interceptor يضيف الرأس Accept-Language بناءً على لغة الواجهة الحالية.'),
  (96, 'ng-rxjs', 8, 10, 'Angular', 'Important', 60, 'RxJS essentials', 'أساسيات RxJS', 'RxJS models streams of values over time as Observables. Operators like map, filter, debounceTime, switchMap and catchError transform them.', 'تمثّل RxJS تدفقات القيم عبر الزمن كـ Observables، وتحوّلها عوامل مثل map وfilter وdebounceTime وswitchMap وcatchError.', 'HttpClient, router events and form valueChanges are Observables. Search-as-you-type is the classic use case.', 'الـ HttpClient وأحداث الموجّه وvalueChanges في النماذج كلها Observables، والبحث أثناء الكتابة حالة الاستخدام الكلاسيكية.', 'Chain operators with pipe(). switchMap cancels the previous request when a new value arrives. Unsubscribe with takeUntilDestroyed() or convert to a signal with toSignal().', 'اربط العوامل بـ pipe()، وتلغي switchMap الطلب السابق عند وصول قيمة جديدة. وألغِ الاشتراك بـ takeUntilDestroyed() أو حوّل إلى Signal بـ toSignal().', 'searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q => api.search(q)))', 'التعبير searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q => api.search(q)))', 'import { debounceTime, distinctUntilChanged, switchMap, catchError, of, filter } from ''rxjs'';
import { toSignal } from ''@angular/core/rxjs-interop'';

export class ProductSearchComponent {
  private readonly api = inject(ProductsApi);
  readonly search = new FormControl('''', { nonNullable: true });

  readonly results = toSignal(
    this.search.valueChanges.pipe(
      debounceTime(300),                 // wait until typing pauses
      distinctUntilChanged(),            // ignore same value
      filter(q => q.length === 0 || q.length >= 2),
      switchMap(q =>                     // cancel the previous request
        this.api.search(q).pipe(catchError(() => of([])))
      ),
    ),
    { initialValue: [] as ProductDto[] },
  );
}', 'typescript', 'Implement search-as-you-type with debounceTime and switchMap and show loading state.', 'نفّذ البحث أثناء الكتابة باستخدام debounceTime وswitchMap، واعرض حالة التحميل.', 'Explain the difference between switchMap, mergeMap and concatMap with a timeline drawing.', 'اشرح الفرق بين switchMap وmergeMap وconcatMap برسم خط زمني.'),
  (97, 'ng-signals', 8, 11, 'Angular', 'Core', 45, 'Signals', 'الإشارات (Signals)', 'A signal is a reactive value: signal() holds state, computed() derives values, and effect() runs side effects. Angular updates exactly the parts of the UI that read a changed signal.', 'الـ Signal قيمة تفاعلية: تحمل signal() الحالة، وتشتق computed() القيم، وتنفذ effect() التأثيرات الجانبية. وتحدّث Angular بالضبط أجزاء الواجهة التي تقرأ Signal تغيّر.', 'Signals are the modern way to manage component and service state in Angular — simpler than RxJS for state that isn''t a stream.', 'الـ Signals هي الطريقة الحديثة لإدارة حالة المكونات والخدمات في Angular، وهي أبسط من RxJS للحالة التي ليست تدفقًا.', 'count = signal(0); read with count(), write with count.set(1) or count.update(c => c + 1). total = computed(() => items().reduce(...)) recalculates automatically.', 'التعريف count = signal(0)؛ اقرأ بـ count()، واكتب بـ count.set(1) أو count.update(c => c + 1). والتعريف total = computed(() => items().reduce(...)) يُعاد حسابه تلقائيًا.', 'DevPath''s theme and language are signals; an effect() writes dir="rtl" to <html> whenever the language changes.', 'السمة واللغة في DevPath عبارة عن Signals، وتكتب effect() الخاصية dir="rtl" على <html> كلما تغيرت اللغة.', 'import { Component, computed, effect, signal } from ''@angular/core'';

@Component({
  selector: ''app-topic-filter'',
  template: `
    <input [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Filter…" />
    <p>{{ filtered().length }} of {{ topics().length }} topics</p>
  `,
})
export class TopicFilterComponent {
  readonly topics = signal<{ id: number; title: string }[]>([]);
  readonly query = signal('''');

  // Recomputed only when topics() or query() change
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.topics().filter(t => t.title.toLowerCase().includes(q));
  });

  constructor() {
    // Side effect: keep the last query in localStorage
    effect(() => localStorage.setItem(''lastQuery'', this.query()));
  }
}', 'typescript', 'Build a filterable list: a signal for the search text and a computed() for the filtered items.', 'ابنِ قائمة قابلة للتصفية: Signal لنص البحث وcomputed() للعناصر المُصفّاة.', 'Explain when to use a signal, a computed, an effect and an Observable, with one example each.', 'اشرح متى تستخدم signal وcomputed وeffect وObservable، مع مثال لكل منها.'),
  (98, 'ng-loading-error-states', 8, 12, 'Angular', 'Core', 30, 'Loading, empty and error states', 'حالات التحميل والفراغ والخطأ', 'Every screen that loads data has at least four states: loading, error, empty and ready. Design and implement all of them.', 'كل شاشة تحمّل بيانات لها أربع حالات على الأقل: التحميل والخطأ والفراغ والجاهزية، فصمّمها ونفّذها جميعًا.', 'Users judge quality by how an app behaves when things are slow or broken. Handling these states is a sign of professional frontend work.', 'يحكم المستخدمون على الجودة من سلوك التطبيق عندما تكون الأمور بطيئة أو معطلة، والتعامل مع هذه الحالات علامة على عمل احترافي في الواجهة.', 'Keep loading and error signals next to the data, show skeletons while loading, a retry button on error and a helpful message when the list is empty.', 'احتفظ بـ Signals للتحميل والخطأ بجوار البيانات، واعرض هياكل التحميل (Skeletons) أثناء التحميل، وزر إعادة المحاولة عند الخطأ، ورسالة مفيدة عندما تكون القائمة فارغة.', 'Stop the API while DevPath is open: pages show an error state with a retry button instead of crashing.', 'أوقف الـ API بينما DevPath مفتوح: ستعرض الصفحات حالة خطأ مع زر إعادة المحاولة بدلًا من التوقف.', '@if (loading()) {
  <div class="skeleton" aria-busy="true" aria-label="Loading"></div>
  <div class="skeleton"></div>
} @else if (error()) {
  <div class="error-state" role="alert">
    <p>Could not load products.</p>
    <button type="button" (click)="reload()">Try again</button>
  </div>
} @else if (products().length === 0) {
  <div class="empty-state">
    <p>No products yet.</p>
    <button type="button" (click)="create()">Add your first product</button>
  </div>
} @else {
  <app-products-table [rows]="products()" />
}', 'html', 'Add skeleton, empty and error states to your product list.', 'أضف حالات الهيكل والفراغ والخطأ إلى قائمة المنتجات.', 'Write a reusable <app-async-state> component that renders the right state based on inputs.', 'اكتب مكونًا قابلًا لإعادة الاستخدام <app-async-state> يعرض الحالة المناسبة بناءً على المدخلات.'),
  (99, 'ng-component-communication', 8, 13, 'Angular', 'Important', 35, 'Component communication patterns', 'أنماط التواصل بين المكونات', 'Parent ↔ child use inputs and outputs; siblings and distant components share state through a service with signals; routes pass ids through the URL.', 'يتواصل الأب والابن عبر المدخلات والمخرجات، وتتشارك المكونات الشقيقة والبعيدة الحالة عبر خدمة تحتوي على Signals، وتمرر المسارات المعرفات عبر العنوان.', 'Choosing the right pattern prevents ''prop drilling'' through five levels and hard-to-trace global state.', 'اختيار النمط الصحيح يمنع تمرير الخصائص عبر خمسة مستويات والحالة العامة التي يصعب تتبعها.', 'Start with inputs/outputs. When two unrelated components need the same state, move it into a service. Avoid reaching into child components directly.', 'ابدأ بالمدخلات والمخرجات، وعندما يحتاج مكونان غير مرتبطين الحالة نفسها انقلها إلى خدمة، وتجنب الوصول المباشر إلى المكونات الأبناء.', 'DevPath''s toast service lets any page show notifications rendered by the shell component.', 'تتيح خدمة الإشعارات في DevPath لأي صفحة عرض تنبيهات يعرضها مكون الهيكل الرئيسي.', '// Shared state lives in a service; any component can read or change it
@Injectable({ providedIn: ''root'' })
export class ToastService {
  readonly toasts = signal<{ id: number; text: string; kind: ''success'' | ''error'' }[]>([]);
  private nextId = 1;

  show(text: string, kind: ''success'' | ''error'' = ''success''): void {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, text, kind }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}

// A page:   inject(ToastService).show(''Saved'');
// The shell renders:  @for (t of toasts.toasts(); track t.id) { <div>{{ t.text }}</div> }', 'typescript', 'Show a cart badge in the header that updates when a product page adds an item.', 'اعرض شارة السلة في الترويسة تتحدث عندما تضيف صفحة منتج عنصرًا.', 'Refactor a component chain that passes data through three levels into a shared service.', 'أعد هيكلة سلسلة مكونات تمرر البيانات عبر ثلاثة مستويات إلى خدمة مشتركة.'),
  (100, 'ng-reusable-components', 8, 14, 'Angular', 'Important', 40, 'Reusable components and content projection', 'المكونات القابلة لإعادة الاستخدام وإسقاط المحتوى', 'Reusable components have clear inputs/outputs, no knowledge of the API, and use <ng-content> to accept custom content.', 'للمكونات القابلة لإعادة الاستخدام مدخلات ومخرجات واضحة، ولا تعرف شيئًا عن الـ API، وتستخدم <ng-content> لاستقبال محتوى مخصص.', 'Cards, dialogs, badges and empty states repeat across a product. Building them once keeps the UI consistent.', 'البطاقات والنوافذ والشارات وحالات الفراغ تتكرر في المنتج، وبناؤها مرة واحدة يحافظ على اتساق الواجهة.', 'Use <ng-content> (and select="[slot]") for projected content, inputs for configuration, outputs for events and CSS variables for theming.', 'استخدم <ng-content> (وselect="[slot]") للمحتوى المُسقط، والمدخلات للإعداد، والمخرجات للأحداث، ومتغيرات CSS للسمات.', '<app-empty-state icon="note" [title]="..."><button>Create note</button></app-empty-state>', 'الوسم <app-empty-state icon="note" [title]="..."><button>Create note</button></app-empty-state>', '@Component({
  selector: ''app-card'',
  template: `
    <section class="card">
      <header><ng-content select="[card-title]" /></header>
      <div class="body"><ng-content /></div>
      <footer><ng-content select="[card-actions]" /></footer>
    </section>
  `,
  styles: `.card { border-radius: var(--radius); background: var(--surface); }`,
})
export class CardComponent {}

// Usage:
// <app-card>
//   <h3 card-title>Low stock</h3>
//   <p>5 products need reordering.</p>
//   <button card-actions type="button">Reorder</button>
// </app-card>', 'typescript', 'Build a Card component with header and footer slots using ng-content select.', 'ابنِ مكون Card بفتحات للترويسة والتذييل باستخدام ng-content select.', 'Build an accessible confirmation dialog component (focus management, Escape to close).', 'ابنِ مكون نافذة تأكيد يراعي إمكانية الوصول (إدارة التركيز والإغلاق بمفتاح Escape).'),
  (101, 'ng-tables-forms', 8, 15, 'Angular', 'Important', 45, 'Data tables and edit forms', 'جداول البيانات ونماذج التعديل', 'The bread-and-butter CRUD screen: a table with sorting and actions, plus a form for create/edit that reuses the same component.', 'شاشة CRUD الأساسية: جدول بالترتيب والإجراءات، ونموذج للإنشاء والتعديل يعيد استخدام المكون نفسه.', 'Most business features are tables + forms. Doing them cleanly, accessibly and quickly is a core junior skill.', 'معظم ميزات الأعمال جداول ونماذج، وتنفيذها بشكل نظيف وسريع ومراعٍ لإمكانية الوصول مهارة أساسية للمطور المبتدئ.', 'Use semantic <table> with <th scope="col">, aria-sort for sortable headers, a single form component that patches values in edit mode, and a confirmation before delete.', 'استخدم <table> الدلالي مع <th scope="col">، وaria-sort لرؤوس الأعمدة القابلة للترتيب، ومكون نموذج واحد يملأ القيم في وضع التعديل، وتأكيدًا قبل الحذف.', 'A Products table where clicking ''Edit'' opens the same form used for ''New product'', pre-filled.', 'جدول منتجات يفتح فيه زر التعديل النموذج نفسه المستخدم للمنتج الجديد، مع ملء البيانات مسبقًا.', '<table class="table">
  <caption class="sr-only">Products</caption>
  <thead>
    <tr>
      <th scope="col" [attr.aria-sort]="sort() === ''name'' ? ''ascending'' : ''none''">
        <button type="button" (click)="sortBy(''name'')">Name</button>
      </th>
      <th scope="col">Price</th>
      <th scope="col"><span class="sr-only">Actions</span></th>
    </tr>
  </thead>
  <tbody>
    @for (p of rows(); track p.id) {
      <tr>
        <td>{{ p.name }}</td>
        <td>{{ p.price | currency }}</td>
        <td>
          <button type="button" (click)="edit(p)">Edit</button>
          <button type="button" class="danger" (click)="confirmDelete(p)">Delete</button>
        </td>
      </tr>
    }
  </tbody>
</table>', 'html', 'Build a categories table with create, edit and delete (with confirmation).', 'ابنِ جدول فئات مع الإنشاء والتعديل والحذف (مع التأكيد).', 'Make the table usable on mobile by switching to a card layout under 640px.', 'اجعل الجدول قابلًا للاستخدام على الجوال بالتحول إلى تخطيط بطاقات تحت 640 بكسل.'),
  (102, 'ng-search-pagination', 8, 16, 'Angular', 'Important', 40, 'Search, filtering and pagination in the UI', 'البحث والتصفية والتقسيم إلى صفحات في الواجهة', 'Wire search boxes, filter dropdowns and page controls to API query parameters, keeping the state in signals and the URL.', 'اربط مربعات البحث والقوائم المنسدلة للتصفية وأدوات التنقل بين الصفحات بمعاملات استعلام الـ API، مع حفظ الحالة في Signals وفي العنوان.', 'Server-side search and paging keep big lists fast; reflecting them in the URL makes them shareable.', 'البحث والتقسيم على الخادم يحافظان على سرعة القوائم الكبيرة، وعكسهما في العنوان يجعلهما قابلين للمشاركة.', 'Debounce the search input, reset to page 1 when filters change, show ''x–y of total'', and disable Previous/Next at the edges.', 'أخّر إدخال البحث (Debounce)، وعُد إلى الصفحة الأولى عند تغيّر المرشحات، واعرض النطاق من x إلى y من الإجمالي، وعطّل زري السابق/التالي عند الحدود.', 'DevPath''s Learning Library uses server-side paging over /api/topics with skill, status and text filters.', 'تستخدم مكتبة التعلم في DevPath التقسيم على الخادم عبر /api/topics مع مرشحات المهارة والحالة والنص.', 'export class ProductListPage {
  private readonly api = inject(ProductsApi);

  readonly q = signal('''');
  readonly categoryId = signal<number | null>(null);
  readonly page = signal(1);
  readonly pageSize = 20;
  readonly result = signal<PagedResult<ProductDto> | null>(null);

  readonly from = computed(() => (this.page() - 1) * this.pageSize + 1);
  readonly to = computed(() => Math.min(this.page() * this.pageSize, this.result()?.totalCount ?? 0));
  readonly canNext = computed(() => this.to() < (this.result()?.totalCount ?? 0));

  setFilter(categoryId: number | null): void {
    this.categoryId.set(categoryId);
    this.page.set(1);                       // filters changed → back to page 1
    void this.load();
  }

  async load(): Promise<void> {
    this.result.set(await firstValueFrom(
      this.api.list({ q: this.q(), categoryId: this.categoryId(), page: this.page(), pageSize: this.pageSize })));
  }
}', 'typescript', 'Connect your products table to a paged, filtered API endpoint.', 'اربط جدول المنتجات بنقطة نهاية API مقسّمة إلى صفحات وقابلة للتصفية.', 'Sync page, filters and sort with the URL query string so the back button works.', 'زامن الصفحة والمرشحات والترتيب مع Query string في العنوان لكي يعمل زر الرجوع.'),
  (103, 'ng-app-organization', 8, 17, 'Angular', 'Important', 30, 'Organising an Angular application', 'تنظيم تطبيق Angular', 'Group code by feature (features/orders, features/products), keep shared UI in shared/, singletons in core/, and lazy-load each feature route.', 'جمّع الكود حسب الميزة (features/orders وfeatures/products)، وضع عناصر الواجهة المشتركة في shared/، والخدمات المفردة في core/، وحمّل مسار كل ميزة بشكل كسول.', 'A clear structure lets a team work in parallel and lets newcomers find things quickly.', 'الهيكل الواضح يتيح للفريق العمل بالتوازي ويساعد الأعضاء الجدد على إيجاد الأشياء بسرعة.', 'Features don''t import from each other; they import from shared/ and core/. Keep components small, name files consistently (*.page.ts, *.component.ts).', 'لا تستورد الميزات من بعضها، بل من shared/ وcore/. واحرص على صِغر المكونات وثبات تسمية الملفات (*.page.ts و*.component.ts).', 'DevPath follows this layout: core (api, i18n, theme), shared (ui), layout (shell), features (one folder per page).', 'يتبع DevPath هذا التخطيط: core (الـ API والترجمة والسمة)، وshared (الواجهة)، وlayout (الهيكل)، وfeatures (مجلد لكل صفحة).', 'src/app/
├── core/                 # singletons used everywhere
│   ├── api.service.ts
│   ├── i18n/
│   └── theme.service.ts
├── shared/               # reusable, API-agnostic UI
│   ├── progress-ring.component.ts
│   ├── empty-state.component.ts
│   └── confirm-dialog.component.ts
├── layout/
│   └── shell.component.ts
├── features/             # one folder per feature, lazy-loaded
│   ├── products/
│   │   ├── product-list.page.ts
│   │   └── product-form.component.ts
│   └── orders/
├── app.routes.ts
└── app.config.ts

Rule: features import from core/ and shared/, never from each other.', 'text', 'Reorganise your Project 3 code into core/shared/features.', 'أعد تنظيم كود المشروع الثالث إلى core/shared/features.', 'Run ''ng build'' and compare bundle sizes before and after lazy-loading your feature routes.', 'شغّل ng build وقارن أحجام الحزم قبل التحميل الكسول لمسارات الميزات وبعده.'),
  (104, 'fs-connect-angular-api', 9, 1, 'FullStack', 'Core', 45, 'Connecting Angular to a real API', 'ربط Angular بـ API حقيقي', 'Run both apps locally, configure the API base URL in one place, and replace mock data with HttpClient calls through a service.', 'شغّل التطبيقين محليًا، واضبط عنوان الـ API الأساسي في مكان واحد، واستبدل البيانات الوهمية باستدعاءات HttpClient عبر خدمة.', 'This is the moment your skills combine: a button in Angular ends up as a row in SQL Server.', 'هذه هي اللحظة التي تجتمع فيها مهاراتك: زر في Angular ينتهي كصف في SQL Server.', 'Start the API (dotnet run) and Angular (ng serve). Store the base URL in an environment file or InjectionToken. Use the browser Network tab to see each request.', 'شغّل الـ API (dotnet run) وAngular (ng serve). وخزّن العنوان الأساسي في ملف بيئة أو InjectionToken. واستخدم تبويب Network في المتصفح لرؤية كل طلب.', 'DevPath itself: Angular on :4200 calls the API on :5080, which reads SQL Server through EF Core.', 'DevPath نفسه: تطبيق Angular على المنفذ 4200 يستدعي الـ API على المنفذ 5080، الذي يقرأ من SQL Server عبر EF Core.', '// environment-like config in one place
export const API_BASE_URL = new InjectionToken<string>(''API_BASE_URL'', {
  factory: () => ''http://localhost:5080/api'',
});

@Injectable({ providedIn: ''root'' })
export class TopicsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  complete(topicId: number) {
    // Angular → PUT /api/topics/12/progress → TopicService → EF Core → UPDATE TopicProgress ...
    return this.http.put(`${this.base}/topics/${topicId}/progress`, {
      status: ''Completed'', knowledge: ''Unassessed'', confidence: 3,
    });
  }
}', 'typescript', 'Trace one DevPath click (marking a topic complete) from the button to the SQL UPDATE in the logs.', 'تتبّع نقرة واحدة في DevPath (تعليم موضوع كمكتمل) من الزر حتى جملة UPDATE في السجلات.', 'Replace Project 3''s mock data service with a real API service without changing any component.', 'استبدل خدمة البيانات الوهمية في المشروع الثالث بخدمة API حقيقية دون تغيير أي مكون.'),
  (105, 'fs-cors', 9, 2, 'FullStack', 'Core', 30, 'CORS', 'مشاركة الموارد عبر المصادر (CORS)', 'Browsers block requests from one origin (http://localhost:4200) to another (http://localhost:5080) unless the server allows it with CORS headers.', 'تمنع المتصفحات الطلبات من مصدر (http://localhost:4200) إلى مصدر آخر (http://localhost:5080) ما لم يسمح الخادم بذلك عبر رؤوس CORS.', '''Blocked by CORS policy'' is the first error almost everyone hits when connecting Angular to an API.', 'رسالة Blocked by CORS policy هي أول خطأ يواجهه الجميع تقريبًا عند ربط Angular بـ API.', 'AddCors with a named policy listing allowed origins, and app.UseCors(policy) before MapControllers. Never use AllowAnyOrigin with credentials. CORS is enforced by browsers, not by Postman or curl.', 'استخدم AddCors مع سياسة مسماة تسرد المصادر المسموحة، وapp.UseCors(policy) قبل MapControllers. ولا تستخدم AllowAnyOrigin مع بيانات الاعتماد. وتفرض المتصفحات CORS وليس Postman أو curl.', 'DevPath reads Cors:AllowedOrigins from appsettings.json so you can add another port without changing code.', 'يقرأ DevPath القيمة Cors:AllowedOrigins من appsettings.json، فيمكنك إضافة منفذ آخر دون تغيير الكود.', '// Program.cs
builder.Services.AddCors(options => options.AddPolicy("frontend", policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();
app.UseCors("frontend");     // before endpoints
app.MapControllers();

// appsettings.json
// "Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }

// Browser error when the origin is missing:
// Access to XMLHttpRequest at ''http://localhost:5080/api/roadmap'' from origin
// ''http://localhost:4200'' has been blocked by CORS policy', 'csharp', 'Remove localhost:4200 from DevPath''s allowed origins, observe the browser error, then restore it.', 'احذف localhost:4200 من المصادر المسموحة في DevPath، ولاحظ خطأ المتصفح، ثم أعده.', 'Explain what a preflight (OPTIONS) request is and which requests trigger one.', 'اشرح ما هو طلب Preflight (OPTIONS) وأي الطلبات تؤدي إليه.'),
  (106, 'fs-api-contracts', 9, 3, 'FullStack', 'Core', 35, 'API contracts', 'عقود الـ API', 'The contract is the agreed shape of requests and responses: URLs, methods, JSON fields (camelCase), enums as strings, dates as ISO 8601, and error format.', 'العقد هو الشكل المتفق عليه للطلبات والاستجابات: العناوين، والطرق، وحقول JSON (camelCase)، والـ Enums كنصوص، والتواريخ بصيغة ISO 8601، وصيغة الأخطاء.', 'Front and back end are often built by different people. A clear contract (documented with OpenAPI) avoids ''it works on my side'' bugs.', 'غالبًا ما يبني الواجهة والخلفية أشخاص مختلفون، والعقد الواضح (الموثق بـ OpenAPI) يتجنب أخطاء: إنه يعمل من جهتي.', 'Define C# DTOs and matching TypeScript interfaces. Serialise enums as strings (JsonStringEnumConverter). Expose the OpenAPI document (/openapi/v1.json) for reference.', 'عرّف DTOs بـ C# وInterfaces مطابقة بـ TypeScript، وحوّل الـ Enums إلى نصوص (JsonStringEnumConverter)، واكشف وثيقة OpenAPI (/openapi/v1.json) كمرجع.', 'DevPath''s ProgressReportDto (C#) and ProgressReport (TypeScript) describe the same JSON; the OpenAPI document is at http://localhost:5080/openapi/v1.json.', 'يصف ProgressReportDto (C#) وProgressReport (TypeScript) في DevPath الـ JSON نفسه، ووثيقة OpenAPI متاحة على http://localhost:5080/openapi/v1.json.', '// C#:  public record OrderDto(int Id, DateTime CreatedAt, OrderStatus Status, decimal Total, IReadOnlyList<OrderLineDto> Lines);
//      JSON options: camelCase + JsonStringEnumConverter

// TypeScript mirror of the same contract
export type OrderStatus = ''Draft'' | ''Submitted'' | ''Shipped'' | ''Delivered'' | ''Cancelled'';

export interface OrderLineDto { productId: number; productName: string; quantity: number; unitPrice: number; }

export interface OrderDto {
  id: number;
  createdAt: string;          // ISO 8601: "2026-10-19T08:30:00Z"
  status: OrderStatus;        // enums travel as strings
  total: number;
  lines: OrderLineDto[];
}

// Errors follow RFC 7807 ProblemDetails
export interface ProblemDetails { status: number; title: string; code?: string; errors?: Record<string, string[]>; }', 'typescript', 'Open DevPath''s OpenAPI document and compare one schema with its TypeScript interface.', 'افتح وثيقة OpenAPI الخاصة بـ DevPath وقارن مخططًا واحدًا بالـ Interface المقابلة في TypeScript.', 'Write the contract (request, response, errors) for ''POST /api/orders'' before writing any code.', 'اكتب العقد (الطلب والاستجابة والأخطاء) لنقطة POST /api/orders قبل كتابة أي كود.'),
  (107, 'fs-dto-mapping', 9, 4, 'FullStack', 'Important', 30, 'DTO mapping across layers', 'تحويل الـ DTOs عبر الطبقات', 'Data changes shape on its way: entity → response DTO → JSON → TypeScript interface → view model. Map explicitly at each boundary.', 'تتغير البيانات في طريقها: كيان ← DTO للاستجابة ← JSON ← Interface في TypeScript ← نموذج عرض. حوّل بشكل صريح عند كل حد.', 'Explicit mapping keeps database changes from breaking the UI and keeps UI concerns out of the database.', 'التحويل الصريح يمنع تغييرات قاعدة البيانات من كسر الواجهة، ويُبقي اهتمامات الواجهة خارج قاعدة البيانات.', 'Map in the API with Select projections or small static methods; avoid auto-mappers until you need them. In Angular, convert DTOs to view models with computed values.', 'حوّل في الـ API باستخدام Select أو دوال static صغيرة، وتجنب أدوات التحويل التلقائي حتى تحتاجها. وفي Angular حوّل الـ DTOs إلى نماذج عرض بقيم محسوبة.', 'The API returns titleEn and titleAr; the Angular ''loc'' pipe picks the one for the current language.', 'يُرجع الـ API الحقلين titleEn وtitleAr، ويختار الـ Pipe المسمى loc في Angular الحقل المناسب للغة الحالية.', '// API side: entity → DTO via projection (only needed columns are read)
public static readonly Expression<Func<Product, ProductDto>> ToDto = p =>
    new ProductDto(p.Id, p.Name, p.Price, p.Category.Name, p.Stock > 0);

var products = await db.Products.AsNoTracking().Select(ToDto).ToListAsync(ct);

// Angular side (TypeScript): DTO → view model with display-only values
// export function toRow(p: ProductDto): ProductRow {
//   return { ...p, priceLabel: formatMoney(p.price), stockLabel: p.inStock ? ''In stock'' : ''Out of stock'' };
// }', 'csharp', 'Write a C# mapping method Product → ProductDto and a TypeScript function ProductDto → ProductRow view model.', 'اكتب دالة تحويل بـ C# من Product إلى ProductDto، ودالة TypeScript من ProductDto إلى نموذج عرض ProductRow.', 'Rename a database column and show that only the mapping code changes, not the API contract.', 'غيّر اسم عمود في قاعدة البيانات، وأثبت أن كود التحويل فقط هو ما يتغير وليس عقد الـ API.'),
  (108, 'fs-crud-workflows', 9, 5, 'FullStack', 'Core', 60, 'End-to-end CRUD workflows', 'تدفقات CRUD من البداية للنهاية', 'Implement list → create → edit → delete through all layers, with the UI reflecting the saved result from the server.', 'نفّذ عرض القائمة ← الإنشاء ← التعديل ← الحذف عبر جميع الطبقات، مع عكس الواجهة للنتيجة المحفوظة القادمة من الخادم.', 'Delivering a complete CRUD feature on your own is the most common ''first ticket'' for a junior full-stack developer.', 'تسليم ميزة CRUD كاملة بمفردك هو أكثر مهمة أولى شيوعًا للمطور المبتدئ في Full-Stack.', 'After a successful POST/PUT, use the returned DTO (not the form values) to update the list. Disable the submit button while saving and confirm deletes.', 'بعد نجاح POST/PUT استخدم الـ DTO المُرجع (لا قيم النموذج) لتحديث القائمة، وعطّل زر الإرسال أثناء الحفظ، وأكّد قبل الحذف.', 'DevPath''s notes page: create, edit, search and delete notes stored in SQL Server, with a confirmation dialog for delete.', 'صفحة الملاحظات في DevPath: إنشاء الملاحظات المخزنة في SQL Server وتعديلها والبحث فيها وحذفها، مع نافذة تأكيد للحذف.', 'export class CategoriesPage {
  private readonly api = inject(CategoriesApi);
  private readonly toast = inject(ToastService);
  readonly rows = signal<CategoryDto[]>([]);
  readonly saving = signal(false);

  async save(form: { id?: number; name: string }): Promise<void> {
    this.saving.set(true);
    try {
      // Use the server''s response as the source of truth
      const saved = form.id
        ? await firstValueFrom(this.api.update(form.id, form))
        : await firstValueFrom(this.api.create(form));
      this.rows.update(rows => {
        const others = rows.filter(r => r.id !== saved.id);
        return [...others, saved].sort((a, b) => a.name.localeCompare(b.name));
      });
      this.toast.show(''Saved'');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(row: CategoryDto): Promise<void> {
    if (!(await this.confirm.ask(`Delete "${row.name}"?`))) return;
    await firstValueFrom(this.api.delete(row.id));
    this.rows.update(rows => rows.filter(r => r.id !== row.id));
  }
}', 'typescript', 'Build full CRUD for Categories in Project 4 (API + Angular).', 'ابنِ CRUD كاملًا للفئات في المشروع الرابع (API + Angular).', 'Add optimistic UI for delete (remove immediately, restore on error) and discuss the trade-offs.', 'أضف واجهة متفائلة للحذف (احذف فورًا واستعد العنصر عند الخطأ) وناقش المفاضلات.'),
  (109, 'fs-form-validation', 9, 6, 'FullStack', 'Core', 40, 'Form validation on both sides', 'التحقق من النماذج في الجهتين', 'Validate in Angular for fast feedback and in the API for safety. Map the API''s ValidationProblemDetails errors back to the right form fields.', 'تحقق في Angular للحصول على استجابة سريعة، وفي الـ API من أجل الأمان، وحوّل أخطاء ValidationProblemDetails القادمة من الـ API إلى حقول النموذج الصحيحة.', 'Some rules only the server can check (unique email, stock available). The UI must display those errors clearly.', 'بعض القواعد لا يستطيع التحقق منها إلا الخادم (البريد الفريد، وتوفر المخزون)، ويجب أن تعرض الواجهة هذه الأخطاء بوضوح.', 'On a 400, read error.errors (field → messages), find the matching control and call control.setErrors({ server: message }).', 'عند تلقي 400، اقرأ error.errors (الحقل ← الرسائل)، وابحث عن الحقل المطابق، واستدعِ control.setErrors({ server: message }).', 'Saving a product with a duplicate SKU returns 400 { errors: { sku: [...] } } and the SKU field turns red with that message.', 'حفظ منتج برمز SKU مكرر يُرجع 400 { errors: { sku: [...] } }، فيتحول حقل SKU إلى اللون الأحمر مع تلك الرسالة.', 'import { HttpErrorResponse } from ''@angular/common/http'';
import { FormGroup } from ''@angular/forms'';

/** Copies ASP.NET Core ValidationProblemDetails errors onto matching form controls. */
export function applyServerErrors(form: FormGroup, error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) return false;
  const errors = (error.error?.errors ?? {}) as Record<string, string[]>;

  let applied = false;
  for (const [field, messages] of Object.entries(errors)) {
    // API may send "Name" or "name" — normalise to camelCase
    const key = field.charAt(0).toLowerCase() + field.slice(1);
    const control = form.get(key);
    if (control) {
      control.setErrors({ server: messages[0] });
      control.markAsTouched();
      applied = true;
    }
  }
  return applied;
}', 'typescript', 'Write a helper applyServerErrors(form, httpError) and use it in your product form.', 'اكتب دالة مساعدة applyServerErrors(form, httpError) واستخدمها في نموذج المنتج.', 'Fix this bug: the API returns ''Name'' but the form control is ''name'', so the error never shows.', 'أصلح هذا الخطأ: يُرجع الـ API الحقل Name بينما اسم الحقل في النموذج name، فلا يظهر الخطأ أبدًا.'),
  (110, 'fs-error-handling', 9, 7, 'FullStack', 'Core', 35, 'End-to-end error handling', 'معالجة الأخطاء من البداية للنهاية', 'The API returns consistent ProblemDetails; an Angular interceptor or API service turns them into typed errors; the UI shows translated, actionable messages.', 'يُرجع الـ API استجابات ProblemDetails موحدة، ويحوّلها Interceptor أو خدمة API في Angular إلى أخطاء محددة الأنواع، وتعرض الواجهة رسائل مترجمة وقابلة للتنفيذ.', 'Users need to know whether to retry, fix their input or contact support. Developers need a traceId to find the log entry.', 'يحتاج المستخدمون إلى معرفة ما إذا كان عليهم إعادة المحاولة أو تصحيح مدخلاتهم أو التواصل مع الدعم، ويحتاج المطورون إلى traceId للعثور على السجل.', 'Status 0 → offline/API down. 400 → field errors. 404 → not found page. 409 → explain the conflict using the error code. 5xx → generic message and log.', 'الحالة 0 ← انقطاع الاتصال أو توقف الـ API. 400 ← أخطاء الحقول. 404 ← صفحة غير موجود. 409 ← شرح التعارض باستخدام رمز الخطأ. 5xx ← رسالة عامة وتسجيل.', 'In DevPath, revealing a solution without an attempt returns 409 ''attempt_required'', shown as a translated toast.', 'في DevPath، كشف الحل دون محاولة يُرجع 409 بالرمز attempt_required، ويُعرض كتنبيه مترجم.', 'export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const i18n = inject(I18nService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const code = error.error?.code as string | undefined;
      if (error.status === 0) toast.error(i18n.t(''errors.offline''));
      else if (error.status >= 500) toast.error(i18n.t(''errors.server''));
      else if (error.status === 409 && code) toast.error(i18n.t(`errors.codes.${code}`));
      // 400 is handled by the form, 404 by the page
      return throwError(() => error);
    }),
  );
};', 'typescript', 'Stop the API and check that every DevPath page shows a useful error instead of breaking.', 'أوقف الـ API وتحقق أن كل صفحة في DevPath تعرض خطأ مفيدًا بدلًا من التعطل.', 'Add a global HTTP error interceptor to Project 4 that maps status codes to messages.', 'أضف Interceptor عامًا لأخطاء HTTP في المشروع الرابع يحوّل رموز الحالة إلى رسائل.'),
  (111, 'fs-loading-states', 9, 8, 'FullStack', 'Important', 25, 'Loading states with a real API', 'حالات التحميل مع API حقيقي', 'Real networks are slow and unreliable. Show progress immediately, prevent double submissions and keep previous data visible while refreshing.', 'الشبكات الحقيقية بطيئة وغير موثوقة: اعرض التقدم فورًا، وامنع الإرسال المزدوج، وأبقِ البيانات السابقة ظاهرة أثناء التحديث.', 'Without this, users click ''Save'' three times and create three orders.', 'بدون ذلك ينقر المستخدمون زر الحفظ ثلاث مرات فيُنشئون ثلاثة طلبات.', 'Use a ''saving'' signal to disable buttons, skeletons for the first load and a subtle indicator for refreshes. Use Chrome DevTools network throttling to test.', 'استخدم Signal باسم saving لتعطيل الأزرار، وهياكل التحميل للتحميل الأول، ومؤشرًا خفيفًا لعمليات التحديث، واستخدم تقييد الشبكة في Chrome DevTools للاختبار.', 'DevPath disables the status buttons while a progress update is in flight.', 'يعطّل DevPath أزرار الحالة أثناء إرسال تحديث التقدم.', 'export class OrderFormComponent {
  readonly saving = signal(false);

  async submit(): Promise<void> {
    if (this.saving()) return;               // ignore double clicks
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.createOrder(this.form.getRawValue()));
    } finally {
      this.saving.set(false);
    }
  }
}

// Template
// <button type="submit" [disabled]="saving() || form.invalid">
//   @if (saving()) { <span class="spinner" aria-hidden="true"></span> Saving… } @else { Place order }
// </button>', 'typescript', 'Throttle the network to ''Slow 3G'' and fix any screen that looks broken while loading.', 'قيّد الشبكة إلى Slow 3G وأصلح أي شاشة تبدو معطلة أثناء التحميل.', 'Make the API idempotent for order creation using a client-generated request id.', 'اجعل إنشاء الطلبات في الـ API عملية Idempotent باستخدام معرف طلب يولّده العميل.'),
  (112, 'fs-pagination', 9, 9, 'FullStack', 'Important', 30, 'Pagination end to end', 'التقسيم إلى صفحات من البداية للنهاية', 'Angular sends page and pageSize; the API returns items plus totalCount; the UI renders page controls from totalCount.', 'يرسل Angular المعاملين page وpageSize، ويُرجع الـ API العناصر مع totalCount، وتعرض الواجهة أدوات التنقل بناءً على totalCount.', 'Both sides must agree on 1-based vs 0-based pages, max page size and sorting — classic integration bugs live here.', 'يجب أن يتفق الطرفان على بدء الترقيم من 1 أو 0، والحجم الأقصى للصفحة، والترتيب، وهنا تعيش أخطاء الدمج الكلاسيكية.', 'Use one PagedResult<T> type on both sides, clamp pageSize on the server, and handle the case where the current page becomes empty after a delete.', 'استخدم نوعًا واحدًا PagedResult<T> في الجهتين، وقيّد pageSize على الخادم، وتعامل مع حالة أن تصبح الصفحة الحالية فارغة بعد الحذف.', 'Deleting the last item on page 3 should move the user to page 2 instead of showing an empty page.', 'حذف آخر عنصر في الصفحة الثالثة يجب أن ينقل المستخدم إلى الصفحة الثانية بدلًا من عرض صفحة فارغة.', 'async remove(id: number): Promise<void> {
  await firstValueFrom(this.api.delete(id));

  const result = this.result();
  // Was this the last item on a page after the first? Go back one page.
  if (result && result.items.length === 1 && this.page() > 1) {
    this.page.update(p => p - 1);
  }
  await this.load();
}

// API contract shared by both sides:
// GET /api/orders?page=1&pageSize=20  →  { items: [...], page: 1, pageSize: 20, totalCount: 143, totalPages: 8 }', 'typescript', 'Implement paging for orders in Project 4 with page-size options 10/20/50.', 'نفّذ التقسيم إلى صفحات للطلبات في المشروع الرابع مع خيارات حجم الصفحة 10/20/50.', 'Fix the ''empty last page after delete'' bug in your implementation.', 'أصلح خطأ الصفحة الأخيرة الفارغة بعد الحذف في تنفيذك.'),
  (113, 'fs-search-filtering', 9, 10, 'FullStack', 'Important', 30, 'Search and filtering end to end', 'البحث والتصفية من البداية للنهاية', 'Debounced input in Angular → query parameters → composable IQueryable filters in the API → parameterised SQL.', 'إدخال مؤجَّل في Angular ← معاملات استعلام ← مرشحات IQueryable قابلة للتركيب في الـ API ← SQL بمعاملات.', 'Search is one of the most visible features, and one of the easiest places to introduce performance and security bugs.', 'البحث من أكثر الميزات وضوحًا، ومن أسهل الأماكن لإدخال أخطاء الأداء والأمان.', 'Send only non-empty filters, trim and limit query length on the server, escape LIKE wildcards, and index the searched columns where possible.', 'أرسل المرشحات غير الفارغة فقط، وقصّ نص البحث وحدد طوله على الخادم، وتعامل مع رموز LIKE الخاصة، وفهرس الأعمدة المبحوث فيها قدر الإمكان.', 'DevPath''s global search escapes %, _ and [ before building LIKE patterns, so searching for ''50%'' works literally.', 'يعالج البحث العام في DevPath الرموز % و_ و[ قبل بناء أنماط LIKE، فيعمل البحث عن 50% حرفيًا.', '// Escape LIKE wildcards so user input is matched literally
public static string LikePattern(string term)
{
    var escaped = term.Trim().Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]");
    return $"%{escaped}%";
}

[HttpGet]
public async Task<PagedResult<OrderListItem>> List([FromQuery] string? q, [FromQuery] OrderStatus? status,
    [FromQuery] int page = 1, CancellationToken ct = default)
{
    var query = db.Orders.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(q))
    {
        var pattern = LikePattern(q.Length > 100 ? q[..100] : q);
        query = query.Where(o => EF.Functions.Like(o.Customer.Name, pattern));   // parameterised
    }
    if (status is { } s) query = query.Where(o => o.Status == s);
    return await query.ToPagedAsync(page, 20, ct);
}', 'csharp', 'Add a search box and status filter to the orders list in Project 4.', 'أضف مربع بحث ومرشح حالة إلى قائمة الطلبات في المشروع الرابع.', 'Search for ''%'' in your app and fix it if it returns everything.', 'ابحث عن % في تطبيقك وأصلح المشكلة إذا أعاد كل شيء.'),
  (114, 'fs-auth-flow', 9, 11, 'FullStack', 'Important', 50, 'Authentication flow concepts', 'مفاهيم تدفق المصادقة', 'Login returns a token; Angular stores it, an interceptor adds it to requests, route guards protect pages, and 401 responses send the user back to login.', 'يُرجع تسجيل الدخول رمزًا، فيخزنه Angular، ويضيفه Interceptor إلى الطلبات، وتحمي حراس المسارات الصفحات، وتعيد استجابات 401 المستخدم إلى صفحة الدخول.', 'Every real app has this flow. Even if a library implements it, you need to understand and debug it.', 'كل تطبيق حقيقي يحتوي على هذا التدفق، وحتى لو نفّذته مكتبة جاهزة فأنت تحتاج إلى فهمه وتصحيحه.', 'Remember the UI only hides things — the API must enforce authorization. Prefer short-lived tokens; understand the trade-offs of localStorage vs HttpOnly cookies.', 'تذكّر أن الواجهة تخفي الأشياء فقط، والـ API هو من يجب أن يفرض التفويض. فضّل الرموز قصيرة العمر، وافهم المفاضلات بين localStorage وملفات تعريف الارتباط HttpOnly.', 'In Project 4, an authGuard redirects to /login, and an interceptor adds ''Authorization: Bearer …'' to API calls.', 'في المشروع الرابع، يعيد authGuard التوجيه إلى /login، ويضيف Interceptor الرأس Authorization: Bearer … إلى استدعاءات الـ API.', '// Adds the token to every API request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) inject(Router).navigate([''/login'']);   // expired or missing
      return throwError(() => error);
    }),
  );
};

// Protects routes in the UI (the API must STILL check authorization!)
export const authGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? true : inject(Router).createUrlTree([''/login'']);

// { path: ''orders'', canActivate: [authGuard], loadComponent: () => import(''./orders.page'') }', 'typescript', 'Draw a sequence diagram of login → protected request → token expiry → re-login.', 'ارسم مخطط تسلسل لتسجيل الدخول ← طلب محمي ← انتهاء صلاحية الرمز ← إعادة تسجيل الدخول.', 'Implement the demo login in Project 4 and prove the API rejects requests without a token (401).', 'نفّذ تسجيل الدخول التجريبي في المشروع الرابع، وأثبت أن الـ API يرفض الطلبات بدون رمز (401).'),
  (115, 'fs-concurrent-updates', 9, 12, 'FullStack', 'Important', 40, 'Handling concurrent updates', 'التعامل مع التحديثات المتزامنة', 'Send the record''s version to the UI, send it back on save, and turn a 409 Conflict into a clear choice for the user: reload or keep editing.', 'أرسل إصدار السجل إلى الواجهة، وأعده عند الحفظ، وحوّل استجابة 409 Conflict إلى خيار واضح للمستخدم: إعادة التحميل أو متابعة التعديل.', 'Two users editing the same order is normal in business apps. Silently overwriting someone''s work is a serious bug.', 'قيام مستخدمين بتعديل الطلب نفسه أمر طبيعي في تطبيقات الأعمال، والكتابة فوق عمل شخص آخر دون علم خطأ جسيم.', 'Include rowVersion (base64) in the DTO, use EF Core''s concurrency token, return 409 with code ''concurrency_conflict'', and show a dialog in Angular.', 'ضمّن rowVersion (بترميز base64) في الـ DTO، واستخدم رمز التزامن في EF Core، وأرجع 409 بالرمز concurrency_conflict، واعرض نافذة حوار في Angular.', 'Open the same order in two tabs, save in both: the second tab shows ''This order was changed by someone else.''', 'افتح الطلب نفسه في تبويبين واحفظ في كليهما: سيعرض التبويب الثاني رسالة أن شخصًا آخر غيّر هذا الطلب.', '// DTO includes the version the user is editing
export interface OrderDto { id: number; status: string; rowVersion: string; /* base64 */ }

async save(order: OrderDto, changes: Partial<OrderDto>): Promise<void> {
  try {
    await firstValueFrom(this.api.update(order.id, { ...changes, rowVersion: order.rowVersion }));
    this.toast.show(''Saved'');
  } catch (error) {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      const reload = await this.confirm.ask(''This order was changed by someone else. Reload the latest version?'');
      if (reload) await this.load(order.id);
      return;
    }
    throw error;
  }
}', 'typescript', 'Implement and demonstrate the two-tab scenario in Project 4.', 'نفّذ سيناريو التبويبين في المشروع الرابع وأثبت عمله.', 'Write an integration test that reproduces the conflict and asserts a 409 response.', 'اكتب اختبار تكامل يعيد إنتاج التعارض ويتحقق من استجابة 409.'),
  (116, 'test-unit-csharp', 10, 1, 'Testing', 'Core', 45, 'Unit testing C# with xUnit', 'اختبار الوحدة في C# باستخدام xUnit', 'A unit test calls one piece of code with known input and asserts the output. xUnit uses [Fact] for single tests and [Theory] with [InlineData] for data-driven tests.', 'اختبار الوحدة يستدعي جزءًا واحدًا من الكود بمدخلات معروفة ويتحقق من المخرجات، ويستخدم xUnit السمة [Fact] للاختبارات المفردة و[Theory] مع [InlineData] للاختبارات المعتمدة على البيانات.', 'Tests let you change code with confidence and are expected in professional teams and pull requests.', 'تتيح لك الاختبارات تغيير الكود بثقة، وهي متوقعة في الفرق المحترفة وطلبات الدمج.', 'Follow Arrange–Act–Assert. Name tests by behaviour (CalculateTotal_AppliesTax). Run them with ''dotnet test''.', 'اتبع نمط Arrange–Act–Assert، وسمِّ الاختبارات حسب السلوك (CalculateTotal_AppliesTax)، وشغّلها بالأمر dotnet test.', 'DevPath.Api.Tests includes unit tests for the recommendation engine and weighted progress calculation.', 'يتضمن DevPath.Api.Tests اختبارات وحدة لمحرك التوصيات وحساب التقدم الموزون.', 'public class PriceCalculatorTests
{
    [Fact]
    public void CalculateTotal_AppliesTax()
    {
        // Arrange
        var lines = new[] { new OrderLine(ProductId: 1, Quantity: 2, UnitPrice: 50m) };

        // Act
        var total = PriceCalculator.CalculateTotal(lines, taxRate: 0.14m);

        // Assert
        Assert.Equal(114m, total);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(1, 10)]
    [InlineData(3, 30)]
    public void Subtotal_IsQuantityTimesPrice(int quantity, decimal expected)
    {
        var lines = new[] { new OrderLine(1, quantity, 10m) };
        Assert.Equal(expected, PriceCalculator.CalculateSubtotal(lines));
    }
}
// Run: dotnet test', 'csharp', 'Write five tests for a CalculateTotal method, including edge cases (empty list, zero quantity).', 'اكتب خمسة اختبارات لدالة CalculateTotal، بما في ذلك الحالات الحدية (قائمة فارغة، وكمية صفر).', 'Run DevPath''s backend tests and add one new test for ReviewRules.IntervalDays.', 'شغّل اختبارات الخلفية في DevPath وأضف اختبارًا جديدًا لـ ReviewRules.IntervalDays.'),
  (117, 'test-business-logic', 10, 2, 'Testing', 'Core', 40, 'Testing business logic', 'اختبار منطق العمل', 'Focus tests on rules that can cost money or data: totals, discounts, stock, status transitions and permissions.', 'ركّز الاختبارات على القواعد التي قد تكلف مالًا أو بيانات: الإجماليات والخصومات والمخزون وانتقالات الحالة والصلاحيات.', 'A bug in an order total is far more expensive than a misaligned button. Pure business logic is also the easiest code to test.', 'خطأ في إجمالي الطلب أغلى بكثير من زر غير محاذٍ، ومنطق العمل الصافي هو أيضًا أسهل كود يمكن اختباره.', 'Keep rules in plain classes or static methods without database access, inject the clock (TimeProvider), and test boundaries (0, 1, max, just over max).', 'أبقِ القواعد في أصناف عادية أو دوال static دون وصول إلى قاعدة البيانات، واحقن الساعة (TimeProvider)، واختبر الحدود (0 و1 والحد الأقصى وما يتجاوزه بقليل).', 'Testing that an order in ''Shipped'' cannot move back to ''Draft'', for every forbidden transition.', 'اختبار أن الطلب في حالة Shipped لا يمكن أن يعود إلى Draft، لكل انتقال ممنوع.', 'public class OrderStatusRulesTests
{
    [Theory]
    [InlineData(OrderStatus.Draft, OrderStatus.Submitted)]
    [InlineData(OrderStatus.Submitted, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Submitted, OrderStatus.Cancelled)]
    public void Allowed_transitions(OrderStatus from, OrderStatus to) =>
        Assert.True(OrderRules.CanMove(from, to));

    [Theory]
    [InlineData(OrderStatus.Shipped, OrderStatus.Draft)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Submitted)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Cancelled)]
    public void Forbidden_transitions(OrderStatus from, OrderStatus to) =>
        Assert.False(OrderRules.CanMove(from, to));

    [Fact]
    public void Cancellation_window_uses_the_injected_clock()
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 10, 19, 12, 0, 0, TimeSpan.Zero));
        var order = new Order { CreatedAt = clock.GetUtcNow().UtcDateTime.AddHours(-25) };
        Assert.False(OrderRules.CanCustomerCancel(order, clock));
    }
}', 'csharp', 'Write [Theory] tests for all allowed and forbidden order status transitions.', 'اكتب اختبارات [Theory] لكل انتقالات حالة الطلب المسموحة والممنوعة.', 'Use FakeTimeProvider to test a rule that depends on the current date (e.g. order cancellation within 24h).', 'استخدم FakeTimeProvider لاختبار قاعدة تعتمد على التاريخ الحالي (مثل إلغاء الطلب خلال 24 ساعة).'),
  (118, 'test-api', 10, 3, 'Testing', 'Important', 45, 'Testing ASP.NET Core APIs', 'اختبار واجهات ASP.NET Core', 'WebApplicationFactory starts your API in memory so tests can send real HTTP requests and assert status codes and JSON.', 'يشغّل WebApplicationFactory الـ API في الذاكرة لكي ترسل الاختبارات طلبات HTTP حقيقية وتتحقق من رموز الحالة وJSON.', 'API tests catch routing, validation, serialisation and status code bugs that unit tests miss.', 'تكتشف اختبارات الـ API أخطاء التوجيه والتحقق والتسلسل ورموز الحالة التي تفوتها اختبارات الوحدة.', 'Reference Microsoft.AspNetCore.Mvc.Testing, create a factory, replace the database with a test one, then use factory.CreateClient() to call endpoints.', 'أضف مرجع Microsoft.AspNetCore.Mvc.Testing، وأنشئ Factory، واستبدل قاعدة البيانات بقاعدة اختبار، ثم استخدم factory.CreateClient() لاستدعاء نقاط النهاية.', 'DevPath''s API tests check that creating a note without a title returns 400 and that a missing topic returns 404.', 'تتحقق اختبارات الـ API في DevPath من أن إنشاء ملاحظة دون عنوان يُرجع 400، وأن الموضوع غير الموجود يُرجع 404.', 'public class ProductsApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Get_unknown_product_returns_404()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/products/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_without_name_returns_validation_error()
    {
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/products", new { price = 10 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains("Name", problem!.Errors.Keys);
    }
}', 'csharp', 'Write API tests for GET /api/products/{id} returning 200 and 404.', 'اكتب اختبارات API للطلب GET /api/products/{id} الذي يُرجع 200 و404.', 'Test that a validation error response contains the expected field name in ''errors''.', 'اختبر أن استجابة خطأ التحقق تحتوي على اسم الحقل المتوقع داخل errors.'),
  (119, 'test-integration', 10, 4, 'Testing', 'Important', 45, 'Integration testing fundamentals', 'أساسيات اختبار التكامل', 'Integration tests run several real components together — API, EF Core and a database — to check that they work as a whole.', 'تشغّل اختبارات التكامل عدة مكونات حقيقية معًا (الـ API وEF Core وقاعدة البيانات) للتحقق من أنها تعمل ككل.', 'Mapping, constraint and transaction bugs only show up when real pieces talk to each other.', 'أخطاء التحويل والقيود والمعاملات لا تظهر إلا عندما تتواصل الأجزاء الحقيقية مع بعضها.', 'Use a disposable database (SQLite in-memory for speed, or a dedicated SQL Server test database for fidelity), reset data per test, and test the important workflows end to end.', 'استخدم قاعدة بيانات مؤقتة (SQLite في الذاكرة للسرعة، أو قاعدة SQL Server مخصصة للاختبار للدقة)، وأعد ضبط البيانات لكل اختبار، واختبر سير العمل المهم من البداية للنهاية.', 'DevPath''s tests run the real seeder against SQLite in-memory and check that seeding twice creates no duplicates.', 'تشغّل اختبارات DevPath المُعبّئ الحقيقي على SQLite في الذاكرة، وتتحقق أن التعبئة مرتين لا تنشئ تكرارات.', 'public class PlaceOrderTests : IDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private readonly AppDbContext _db;

    public PlaceOrderTests()
    {
        _connection.Open();   // the in-memory database lives as long as the connection
        _db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        _db.Database.EnsureCreated();
        _db.Products.Add(new Product { Id = 1, Name = "Mouse", Price = 20m, Stock = 5 });
        _db.SaveChanges();
    }

    [Fact]
    public async Task Placing_an_order_reduces_stock()
    {
        var service = new OrderService(_db, TimeProvider.System);
        await service.PlaceAsync(new PlaceOrderRequest(CustomerId: 1, [new(ProductId: 1, Quantity: 2)]), default);

        Assert.Equal(3, (await _db.Products.FindAsync(1))!.Stock);
        Assert.Equal(1, await _db.Orders.CountAsync());
    }

    public void Dispose() { _db.Dispose(); _connection.Dispose(); }
}', 'csharp', 'Write an integration test for ''place order'' that checks the order row and the reduced stock.', 'اكتب اختبار تكامل لتقديم الطلب يتحقق من صف الطلب ومن انخفاض المخزون.', 'List what SQLite can''t verify compared with SQL Server (e.g. rowversion, some SQL functions) and decide when each is appropriate.', 'اذكر ما لا يستطيع SQLite التحقق منه مقارنة بـ SQL Server (مثل rowversion وبعض دوال SQL)، وحدد متى يناسب كلٌّ منهما.'),
  (120, 'test-angular-components', 10, 5, 'Testing', 'Important', 45, 'Angular component testing', 'اختبار مكونات Angular', 'TestBed creates a component in a test, lets you set inputs, trigger events and assert on the rendered DOM. New Angular projects use Vitest as the test runner.', 'ينشئ TestBed المكون داخل الاختبار، ويتيح ضبط المدخلات وإطلاق الأحداث والتحقق من الـ DOM المعروض، وتستخدم مشاريع Angular الجديدة Vitest لتشغيل الاختبارات.', 'Component tests protect UI behaviour like ''the Save button is disabled while saving'' from regressions.', 'تحمي اختبارات المكونات سلوك الواجهة من التراجع، مثل: زر الحفظ معطّل أثناء الحفظ.', 'TestBed.createComponent(X), fixture.componentRef.setInput(''name'', value), await fixture.whenStable(), then query the DOM. Run with ''ng test''.', 'استخدم TestBed.createComponent(X)، ثم fixture.componentRef.setInput(''name'', value)، ثم await fixture.whenStable()، ثم استعلم عن الـ DOM. وشغّل بالأمر ng test.', 'DevPath has a component test for the progress ring that checks the rendered percentage label.', 'يحتوي DevPath على اختبار مكون لحلقة التقدم يتحقق من تسمية النسبة المعروضة.', 'import { TestBed } from ''@angular/core/testing'';
import { ProductCardComponent } from ''./product-card.component'';

describe(''ProductCardComponent'', () => {
  it(''shows "Out of stock" when stock is 0'', async () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput(''product'', { id: 1, name: ''Mouse'', price: 20, stock: 0 });
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(''Out of stock'');
  });

  it(''emits the product id when Add is clicked'', async () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput(''product'', { id: 7, name: ''Keyboard'', price: 50, stock: 3 });
    const emitted: number[] = [];
    fixture.componentInstance.addToCart.subscribe(id => emitted.push(id));
    await fixture.whenStable();

    (fixture.nativeElement.querySelector(''button'') as HTMLButtonElement).click();
    expect(emitted).toEqual([7]);
  });
});', 'typescript', 'Test that ProductCard shows ''Out of stock'' when stock is 0.', 'اختبر أن ProductCard يعرض عبارة نفاد المخزون عندما يكون المخزون 0.', 'Test that clicking ''Add'' emits the product id through the output.', 'اختبر أن النقر على زر الإضافة يُطلق معرف المنتج عبر المخرج.'),
  (121, 'test-angular-services', 10, 6, 'Testing', 'Important', 35, 'Angular service testing', 'اختبار خدمات Angular', 'Test services directly; use provideHttpClientTesting and HttpTestingController to assert requests and return fake responses.', 'اختبر الخدمات مباشرة، واستخدم provideHttpClientTesting وHttpTestingController للتحقق من الطلبات وإرجاع استجابات وهمية.', 'Services hold the logic and API calls; testing them is cheaper and more stable than testing through the UI.', 'تحمل الخدمات المنطق واستدعاءات الـ API، واختبارها أرخص وأكثر استقرارًا من الاختبار عبر الواجهة.', 'Configure TestBed with provideHttpClient() and provideHttpClientTesting(), call the service, then httpMock.expectOne(url).flush(fakeBody).', 'اضبط TestBed باستخدام provideHttpClient() وprovideHttpClientTesting()، واستدعِ الخدمة، ثم httpMock.expectOne(url).flush(fakeBody).', 'DevPath tests its I18nService: switching to Arabic updates the translation and the document direction.', 'يختبر DevPath خدمة I18nService: التبديل إلى العربية يحدّث الترجمة واتجاه المستند.', 'import { TestBed } from ''@angular/core/testing'';
import { provideHttpClient } from ''@angular/common/http'';
import { HttpTestingController, provideHttpClientTesting } from ''@angular/common/http/testing'';
import { firstValueFrom } from ''rxjs'';

describe(''ProductsApi'', () => {
  it(''requests the right page'', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const api = TestBed.inject(ProductsApi);
    const http = TestBed.inject(HttpTestingController);

    const promise = firstValueFrom(api.list(2));
    const req = http.expectOne(r => r.url.endsWith(''/products'') && r.params.get(''page'') === ''2'');
    expect(req.request.method).toBe(''GET'');
    req.flush({ items: [], page: 2, pageSize: 20, totalCount: 0 });

    expect((await promise).page).toBe(2);
    http.verify();   // no unexpected requests
  });
});', 'typescript', 'Test that ProductsApi.list(2) calls GET /api/products?page=2.', 'اختبر أن ProductsApi.list(2) تستدعي GET /api/products?page=2.', 'Test how your service behaves when the API returns 500.', 'اختبر سلوك خدمتك عندما يُرجع الـ API الرمز 500.'),
  (122, 'test-mocking', 10, 7, 'Testing', 'Important', 35, 'Mocking and test doubles', 'المحاكاة وبدائل الاختبار', 'Test doubles replace slow or external dependencies: fakes (working lightweight implementations), stubs (canned answers) and mocks (verify calls).', 'تستبدل بدائل الاختبار الاعتماديات البطيئة أو الخارجية: Fakes (تطبيقات خفيفة عاملة)، وStubs (إجابات جاهزة)، وMocks (للتحقق من الاستدعاءات).', 'You can''t send real emails or charge real cards in tests. Good interfaces make substitution easy.', 'لا يمكنك إرسال رسائل بريد حقيقية أو خصم بطاقات حقيقية في الاختبارات، والواجهات الجيدة تجعل الاستبدال سهلًا.', 'Prefer hand-written fakes for simple interfaces; use a library like NSubstitute or Moq when you need call verification. Don''t mock what you don''t own — wrap it first.', 'فضّل البدائل المكتوبة يدويًا للواجهات البسيطة، واستخدم مكتبة مثل NSubstitute أو Moq عند الحاجة للتحقق من الاستدعاءات. ولا تحاكِ ما لا تملكه، بل غلّفه أولًا.', 'A FakeEmailSender records sent emails so a test can assert the order confirmation was sent once.', 'يسجل FakeEmailSender الرسائل المرسلة، فيستطيع الاختبار التحقق من إرسال تأكيد الطلب مرة واحدة.', '// A hand-written fake is often simpler than a mocking library
public class FakeEmailSender : IEmailSender
{
    public List<(string To, string Subject)> Sent { get; } = [];

    public Task SendAsync(string to, string subject, string body)
    {
        Sent.Add((to, subject));
        return Task.CompletedTask;
    }
}

[Fact]
public async Task Placing_an_order_sends_one_confirmation()
{
    var email = new FakeEmailSender();
    var service = new OrderService(TestDb.Create(), email, TimeProvider.System);

    await service.PlaceAsync(SampleOrders.Valid(), default);

    var sent = Assert.Single(email.Sent);
    Assert.Equal("Order received", sent.Subject);
}', 'csharp', 'Write a FakeClock and test a method that marks orders overdue after 7 days.', 'اكتب FakeClock واختبر دالة تعلّم الطلبات كمتأخرة بعد 7 أيام.', 'Find a test that mocks so much it only tests the mocks, and rewrite it.', 'ابحث عن اختبار يحاكي أشياء كثيرة لدرجة أنه لا يختبر إلا المحاكاة، وأعد كتابته.'),
  (123, 'test-strategy', 10, 8, 'Testing', 'Important', 30, 'A practical testing strategy', 'استراتيجية اختبار عملية', 'Many fast unit tests for rules, fewer API/integration tests for important workflows, and a few end-to-end checks for critical paths.', 'اختبارات وحدة سريعة كثيرة للقواعد، واختبارات API وتكامل أقل لسير العمل المهم، وفحوص قليلة من البداية للنهاية للمسارات الحرجة.', 'Time is limited. A strategy tells you which tests give the most confidence per hour of effort.', 'الوقت محدود، والاستراتيجية تخبرك بالاختبارات التي تمنح أكبر قدر من الثقة لكل ساعة جهد.', 'Test business rules and bug fixes first (write a failing test that reproduces each bug). Run tests on every change. Don''t chase 100% coverage.', 'اختبر قواعد العمل وإصلاحات الأخطاء أولًا (اكتب اختبارًا فاشلًا يعيد إنتاج كل خطأ)، وشغّل الاختبارات عند كل تغيير، ولا تطارد تغطية 100%.', 'For Project 4: unit tests for order totals and status rules, API tests for orders endpoints, one integration test for stock reduction.', 'للمشروع الرابع: اختبارات وحدة لإجماليات الطلبات وقواعد الحالة، واختبارات API لنقاط نهاية الطلبات، واختبار تكامل واحد لخفض المخزون.', 'Project 4 test plan (example)

Unit tests (fast, many)              ~70%
  - Order total = Σ quantity × unit price (never trust the browser''s total)
  - Status transitions: every allowed and forbidden pair
  - Stock rules: can''t go negative, exact boundary (stock == quantity)

API tests (WebApplicationFactory)    ~25%
  - POST /api/orders → 201 + Location; invalid product → 400; out of stock → 409
  - GET /api/orders/{id} → 404 for unknown / other user''s order
  - Validation errors contain the right field names

Integration / end-to-end              ~5%
  - Place order → stock reduced in the database (one transaction)
  - Two concurrent updates → second gets 409

Rule: every bug fix starts with a failing test that reproduces it.', 'text', 'Write a one-page test plan for Project 4.', 'اكتب خطة اختبار من صفحة واحدة للمشروع الرابع.', 'Fix a bug in one of your projects by first writing a test that fails because of it.', 'أصلح خطأً في أحد مشاريعك بأن تكتب أولًا اختبارًا يفشل بسببه.'),
  (124, 'git-fundamentals', 11, 1, 'Git', 'Core', 40, 'Git fundamentals', 'أساسيات Git', 'Git records snapshots (commits) of your project. The working tree, staging area and repository are the three places your changes move through.', 'يسجل Git لقطات (Commits) لمشروعك، ومنطقة العمل ومنطقة التجهيز (Staging) والمستودع هي الأماكن الثلاثة التي تمر بها تغييراتك.', 'Every team uses Git. You need status, add, commit, log, diff and restore without thinking.', 'كل فريق يستخدم Git، وتحتاج إلى استخدام status وadd وcommit وlog وdiff وrestore دون تفكير.', 'git status → git add <files> → git commit -m "message" → git push. git diff shows unstaged changes; git log --oneline shows history.', 'نفّذ git status ← git add <files> ← git commit -m "message" ← git push. ويعرض git diff التغييرات غير المجهزة، ويعرض git log --oneline السجل.', 'DevPath itself is a Git repository with a .gitignore that excludes bin/, obj/ and node_modules/.', 'DevPath نفسه مستودع Git يحتوي على ملف .gitignore يستثني bin/ وobj/ وnode_modules/.', 'git init
dotnet new gitignore            # ignores bin/, obj/, *.user ...
git status                      # what changed?
git add Program.cs Models/      # stage specific files
git commit -m "Add Employee model and console menu"
git log --oneline --graph       # history
git diff                        # unstaged changes
git restore Program.cs          # discard local changes to a file
git revert <commit-sha>         # undo a pushed commit with a new commit (safe)
git remote add origin https://github.com/<you>/employee-management.git
git push -u origin main', 'bash', 'Initialise a repo for Project 1, add a .gitignore for .NET and make three meaningful commits.', 'أنشئ مستودعًا للمشروع الأول، وأضف .gitignore خاصًا بـ .NET، ونفّذ ثلاثة Commits ذات معنى.', 'Undo a commit that was already pushed, safely, with git revert.', 'تراجع عن Commit تم رفعه بالفعل، بأمان، باستخدام git revert.'),
  (125, 'git-branching', 11, 2, 'Git', 'Core', 30, 'Branching', 'التفريع (Branching)', 'A branch is a movable pointer to a commit. Feature branches let you work on a change without affecting main.', 'الفرع مؤشر متحرك إلى Commit، وتتيح فروع الميزات العمل على تغيير دون التأثير على main.', 'Teams never commit directly to main. Each ticket gets its own branch and pull request.', 'الفرق لا تنفذ Commits مباشرة على main أبدًا، فلكل مهمة فرعها وطلب الدمج الخاص بها.', 'git switch -c feature/product-search creates and switches. Keep branches short-lived and up to date with main (git pull --rebase or merge main).', 'الأمر git switch -c feature/product-search ينشئ فرعًا وينتقل إليه. واجعل الفروع قصيرة العمر ومحدّثة مع main (git pull --rebase أو دمج main).', 'feature/order-status-rules, fix/negative-stock and chore/update-packages are clear branch names.', 'أسماء مثل feature/order-status-rules وfix/negative-stock وchore/update-packages أسماء فروع واضحة.', 'git switch main
git pull                                  # start from the latest main
git switch -c feature/product-search      # create + switch

# ... work, commit ...
git push -u origin feature/product-search

# Need to switch with unfinished work?
git stash push -m "half-done search"
git switch fix/negative-stock
git switch feature/product-search
git stash pop', 'bash', 'Create a feature branch for one Project 2 task, commit on it and push it.', 'أنشئ فرع ميزة لمهمة واحدة من المشروع الثاني، ونفّذ Commit عليه، وارفعه.', 'Use git stash to switch branches with uncommitted work, then restore it.', 'استخدم git stash للتنقل بين الفروع مع عمل غير محفوظ، ثم استعده.'),
  (126, 'git-merging', 11, 3, 'Git', 'Core', 30, 'Merging and rebasing', 'الدمج (Merge) وإعادة القاعدة (Rebase)', 'Merge combines branches with a merge commit; rebase replays your commits on top of another branch for a linear history.', 'يجمع Merge الفروع مع Commit دمج، بينما يعيد Rebase تطبيق Commits الخاصة بك فوق فرع آخر لسجل خطي.', 'You''ll update your branch with main many times a week. Knowing both lets you follow any team''s convention.', 'ستحدّث فرعك من main مرات كثيرة أسبوعيًا، ومعرفة الطريقتين تتيح لك اتباع أعراف أي فريق.', 'git merge main brings main into your branch. git rebase main rewrites your branch''s commits — never rebase commits others already use.', 'الأمر git merge main يجلب main إلى فرعك، والأمر git rebase main يعيد كتابة Commits فرعك، ولا تُعد قاعدة Commits يستخدمها الآخرون بالفعل.', 'Squash-merging a pull request turns ten ''wip'' commits into one clean commit on main.', 'الدمج بالضغط (Squash merge) لطلب دمج يحوّل عشرة Commits بعنوان wip إلى Commit واحد نظيف على main.', '# Bring main into your feature branch (keeps history as it happened)
git switch feature/product-search
git merge main

# Or replay your commits on top of main (linear history; only for unshared branches)
git fetch origin
git rebase origin/main
git push --force-with-lease               # needed after rebasing a pushed branch

# See what happened
git log --oneline --graph --all', 'bash', 'Merge a feature branch into main locally and look at the graph with git log --oneline --graph.', 'ادمج فرع ميزة في main محليًا وانظر إلى الرسم باستخدام git log --oneline --graph.', 'Rebase a branch onto an updated main and explain why its commit hashes changed.', 'أعد قاعدة فرع على main المحدّث، واشرح لماذا تغيرت قيم Hash الخاصة بالـ Commits.'),
  (127, 'git-conflicts', 11, 4, 'Git', 'Core', 30, 'Resolving merge conflicts', 'حل تعارضات الدمج', 'A conflict happens when two branches change the same lines. Git marks them with <<<<<<<, ======= and >>>>>>> and asks you to choose.', 'يحدث التعارض عندما يغيّر فرعان الأسطر نفسها، فيعلّمها Git بـ <<<<<<< و======= و>>>>>>> ويطلب منك الاختيار.', 'Conflicts are routine in team work. Resolving them calmly and correctly (and re-running tests) is an everyday skill.', 'التعارضات أمر روتيني في العمل الجماعي، وحلها بهدوء وبشكل صحيح (مع إعادة تشغيل الاختبارات) مهارة يومية.', 'Open the file (VS Code shows Accept Current / Incoming / Both), edit to the correct result, remove markers, build and test, then git add and continue the merge/rebase.', 'افتح الملف (يعرض VS Code خيارات Accept Current / Incoming / Both)، وعدّل للحصول على النتيجة الصحيحة، واحذف العلامات، وابنِ واختبر، ثم git add وأكمل الدمج أو إعادة القاعدة.', 'Two developers add different services to Program.cs on the same line: the correct resolution keeps both registrations.', 'مطوران يضيفان خدمات مختلفة إلى Program.cs في السطر نفسه: الحل الصحيح يحتفظ بالتسجيلين.', '<<<<<<< HEAD (your branch)
builder.Services.AddScoped<ProductService>();
=======
builder.Services.AddScoped<CategoryService>();
>>>>>>> main

Correct resolution — keep BOTH registrations:
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CategoryService>();

Then:
  dotnet build && dotnet test
  git add Program.cs
  git commit            # (or: git rebase --continue)', 'text', 'Create a conflict on purpose in two branches and resolve it in VS Code.', 'أنشئ تعارضًا عمدًا في فرعين وحلّه في VS Code.', 'Resolve a conflict in a migration snapshot file and verify the model still matches with ''dotnet ef migrations has-pending-model-changes''.', 'حل تعارضًا في ملف Snapshot الخاص بالـ Migrations، وتحقق أن النموذج لا يزال مطابقًا باستخدام dotnet ef migrations has-pending-model-changes.'),
  (128, 'git-pull-requests', 11, 5, 'Git', 'Core', 35, 'Pull requests', 'طلبات الدمج (Pull Requests)', 'A pull request proposes merging your branch, shows the diff, runs checks and collects review comments before the merge.', 'يقترح طلب الدمج دمج فرعك، ويعرض الفروق، ويشغّل الفحوص، ويجمع تعليقات المراجعة قبل الدمج.', 'PRs are how your work is reviewed and accepted. A good PR description gets faster, friendlier reviews.', 'طلبات الدمج هي طريقة مراجعة عملك وقبوله، والوصف الجيد لطلب الدمج يجلب مراجعات أسرع وأكثر ودًا.', 'Keep PRs small. Describe what changed, why, how to test it, and include screenshots for UI changes. Respond to every comment.', 'اجعل طلبات الدمج صغيرة، وصِف ما تغير ولماذا وكيف يُختبر، وأرفق لقطات شاشة لتغييرات الواجهة، وردّ على كل تعليق.', '''Add category filter to products endpoint — adds ?categoryId, index on CategoryId, 3 tests. Test: GET /api/products?categoryId=2.''', 'مثال: إضافة مرشح الفئة لنقطة نهاية المنتجات: يضيف ?categoryId وفهرسًا على CategoryId و3 اختبارات. للاختبار: GET /api/products?categoryId=2.', '## What
Adds a category filter to GET /api/products.

## Why
Change request CR-2: users need to see products of one category.

## How
- New optional query parameter `categoryId`
- Index IX_Products_CategoryId (migration AddProductCategoryIndex)
- 3 new API tests

## How to test
1. dotnet ef database update
2. GET http://localhost:5080/api/products?categoryId=2 → only category 2

## Screenshots
(UI changes only)', 'text', 'Open a PR in your own GitHub repository for a Project 2 feature using a description template.', 'افتح طلب دمج في مستودعك على GitHub لميزة من المشروع الثاني باستخدام قالب وصف.', 'Add a PR template file (.github/pull_request_template.md) to your portfolio repository.', 'أضف ملف قالب طلب الدمج (.github/pull_request_template.md) إلى مستودع معرض أعمالك.'),
  (129, 'git-commit-quality', 11, 6, 'Git', 'Important', 20, 'Commit quality', 'جودة الـ Commits', 'Good commits are small, focused and have messages that explain why — the history becomes documentation.', 'الـ Commits الجيدة صغيرة ومركّزة ولها رسائل تشرح السبب، فيصبح السجل توثيقًا.', 'When investigating a bug, git log and git blame are your best tools — but only if commits are meaningful.', 'عند التحقيق في خطأ يكون git log وgit blame أفضل أدواتك، لكن فقط إذا كانت الـ Commits ذات معنى.', 'Imperative subject under ~60 characters (''Prevent negative stock on order placement''), blank line, then the why. One logical change per commit.', 'عنوان بصيغة الأمر في حدود 60 حرفًا (Prevent negative stock on order placement)، ثم سطر فارغ، ثم السبب، وتغيير منطقي واحد لكل Commit.', 'Bad: ''fix'', ''changes'', ''wip''. Good: ''Return 409 when order status transition is invalid''.', 'سيئ: fix وchanges وwip. جيد: Return 409 when order status transition is invalid.', 'Bad                          Good
---------------------------  ------------------------------------------------------
fix                          Prevent negative stock when placing an order
changes                      Return 409 when an order status transition is invalid
wip                          Add pagination to GET /api/products
update stuff                 Rename Qty to Quantity in OrderLine DTO (breaking: v2)

Format:
  <imperative summary, ~60 chars>

  <why the change was needed; anything surprising>', 'text', 'In a practice repository, improve your latest commit message with ''git commit --amend'', then review your last ten messages and note what each one should have said.', 'في مستودع تجريبي، حسّن رسالة آخر Commit باستخدام git commit --amend، ثم راجع آخر عشر رسائل ودوّن ما كان يجب أن تقوله كل منها.', 'Split a large mixed commit into two focused commits using git add -p.', 'قسّم Commit كبيرًا مختلطًا إلى Commitين مركّزين باستخدام git add -p.'),
  (130, 'git-repo-organization', 11, 7, 'Git', 'Important', 25, 'Repository organisation', 'تنظيم المستودع', 'A tidy repository has a clear folder structure, a .gitignore, no secrets, no build output and a README at the root.', 'المستودع المرتب له هيكل مجلدات واضح، وملف .gitignore، ولا يحتوي على أسرار أو مخرجات بناء، وفيه README في الجذر.', 'Reviewers and recruiters judge a project in seconds. Committed bin/ folders or passwords are red flags.', 'يحكم المراجعون ومسؤولو التوظيف على المشروع في ثوانٍ، ومجلدات bin/ المرفوعة أو كلمات المرور علامات تحذير.', 'Use ''dotnet new gitignore'', keep backend/ and frontend/ separate, store secrets in user secrets, and add an .editorconfig for consistent style.', 'استخدم dotnet new gitignore، وافصل backend/ وfrontend/، وخزّن الأسرار في User secrets، وأضف .editorconfig لتنسيق موحد.', 'DevPath''s root has backend/, frontend/, README.md and .gitignore — nothing else.', 'جذر DevPath يحتوي على backend/ وfrontend/ وREADME.md و.gitignore فقط.', 'sales-order-management/
├── backend/
│   ├── SalesOrders.Api/
│   └── SalesOrders.Api.Tests/
├── frontend/
├── docs/
│   └── screenshots/
├── .editorconfig
├── .gitignore          ← bin/ obj/ node_modules/ dist/ .vs/ *.user appsettings.*.local.json
└── README.md

Never commit: passwords, connection strings with credentials, API keys, build output.
Secrets → dotnet user-secrets (local) or environment variables (servers).', 'text', 'Audit one of your repositories for build output, secrets and missing .gitignore entries.', 'دقّق أحد مستودعاتك بحثًا عن مخرجات البناء والأسرار وإدخالات .gitignore الناقصة.', 'Remove an accidentally committed secret from history and explain why you must also rotate it.', 'احذف سرًا رُفع بالخطأ من السجل، واشرح لماذا يجب عليك أيضًا تغييره.'),
  (131, 'git-readme', 11, 8, 'Git', 'Important', 30, 'Writing a great README', 'كتابة ملف README ممتاز', 'A README explains what the project is, shows it (screenshots), and tells someone how to run it in minutes.', 'يشرح ملف README ماهية المشروع، ويعرضه (لقطات الشاشة)، ويخبر أي شخص كيف يشغّله في دقائق.', 'For a portfolio, the README is the project. Many reviewers never clone the code.', 'في معرض الأعمال، الـ README هو المشروع، فكثير من المراجعين لا ينسخون الكود أبدًا.', 'Include: summary, screenshots, features, tech stack, architecture, setup (prerequisites, database, run commands), example API requests, tests and known limitations.', 'ضمّن: ملخصًا، ولقطات شاشة، والميزات، والتقنيات، والبنية، والإعداد (المتطلبات، وقاعدة البيانات، وأوامر التشغيل)، وأمثلة طلبات API، والاختبارات، والقيود المعروفة.', 'DevPath''s own README follows this structure — use it as a template.', 'يتبع ملف README الخاص بـ DevPath هذا الهيكل، فاستخدمه كقالب.', '# Sales & Order Management

One-sentence summary of what it does and who it''s for.

![Dashboard](docs/screenshots/dashboard.png)

## Features
## Tech stack        Angular · ASP.NET Core · EF Core · SQL Server
## Architecture      (diagram or 5 bullet points)
## Getting started
### Prerequisites
### Database setup   dotnet ef database update
### Run              dotnet run  /  npm start
## Example API requests
## Tests             dotnet test  /  ng test
## Known limitations', 'text', 'Write the README for Project 1.', 'اكتب ملف README للمشروع الأول.', 'Ask someone to follow your README on a clean machine and fix every place they got stuck.', 'اطلب من شخص اتباع ملف README على جهاز نظيف، وأصلح كل موضع تعثّر فيه.'),
  (132, 'git-portfolio-hygiene', 11, 9, 'Git', 'Important', 25, 'Portfolio repository hygiene', 'نظافة مستودعات معرض الأعمال', 'Pin your best repositories, give each a description and topics, keep commit history meaningful and remove abandoned experiments.', 'ثبّت أفضل مستودعاتك، وأعطِ كلًا منها وصفًا ومواضيع، وحافظ على سجل Commits ذي معنى، واحذف التجارب المهجورة.', 'Your GitHub profile is your developer CV. Four polished projects beat twenty half-finished ones.', 'ملفك على GitHub هو سيرتك الذاتية كمطور، وأربعة مشاريع مصقولة أفضل من عشرين مشروعًا غير مكتمل.', 'Use the portfolio checklist on DevPath''s Career Readiness page for each project.', 'استخدم قائمة التحقق الخاصة بمعرض الأعمال في صفحة الجاهزية المهنية في DevPath لكل مشروع.', 'A pinned ''Sales & Order Management'' repo with screenshots, a live demo GIF, clear setup and green tests.', 'مستودع مثبّت لنظام المبيعات والطلبات مع لقطات شاشة، وصورة متحركة توضيحية، وإعداد واضح، واختبارات ناجحة.', 'Portfolio checklist (per project)
[ ] Clear README with a one-line summary
[ ] Setup instructions that work on a clean machine
[ ] Screenshots or a short GIF
[ ] Feature list
[ ] Architecture summary
[ ] Database setup (migrations / seed)
[ ] Example API requests (.http file or curl)
[ ] Testing instructions — and the tests pass
[ ] Known limitations (honesty builds trust)

GitHub profile
[ ] Pin your 4 best repositories
[ ] Description + topics on each repository
[ ] Archive or make private abandoned experiments', 'text', 'Complete the portfolio checklist for Project 1.', 'أكمل قائمة تحقق معرض الأعمال للمشروع الأول.', 'Ask a developer friend to review your GitHub profile for 5 minutes and act on their feedback.', 'اطلب من صديق مطور مراجعة ملفك على GitHub لمدة 5 دقائق، ونفّذ ملاحظاته.'),
  (133, 'pro-reading-codebases', 12, 1, 'Professional', 'Core', 45, 'Reading existing codebases', 'قراءة قواعد الكود الموجودة', 'Most of your time in a job is spent reading code. Learn to find entry points, follow a request through the layers and build a mental map quickly.', 'معظم وقتك في الوظيفة يُقضى في قراءة الكود. تعلّم إيجاد نقاط الدخول، وتتبع الطلب عبر الطبقات، وبناء خريطة ذهنية بسرعة.', 'Your first weeks in a team are about understanding, not writing. Fast orientation makes you productive sooner.', 'أسابيعك الأولى في الفريق تدور حول الفهم لا الكتابة، والتوجّه السريع يجعلك منتجًا أبكر.', 'Start from Program.cs and app.routes.ts, pick one feature and trace it UI → API → database, use ''Go to Definition''/''Find All References'', and run the app with breakpoints.', 'ابدأ من Program.cs وapp.routes.ts، واختر ميزة واحدة وتتبعها من الواجهة إلى الـ API إلى قاعدة البيانات، واستخدم Go to Definition وFind All References، وشغّل التطبيق مع نقاط توقف.', 'Tracing DevPath''s ''Mark as completed'' button: topic-detail.page.ts → ApiService.updateTopicProgress → RoadmapController → TopicService → TopicProgress table.', 'تتبع زر التعليم كمكتمل في DevPath: topic-detail.page.ts ← ApiService.updateTopicProgress ← RoadmapController ← TopicService ← جدول TopicProgress.', 'Orientation recipe for a new codebase (first day)

1. README → how to run it. Run it.
2. Backend entry: Program.cs → which services, middleware, database?
3. Frontend entry: app.config.ts, app.routes.ts → which screens exist?
4. Pick ONE feature. Trace it:
     button (template) → component method → service → HTTP call
     → controller action → service → DbContext → SQL table
5. Set breakpoints along that path and click the button.
6. Write down: names of the main folders, where business rules live, how errors are handled.

VS Code: F12 Go to Definition · Shift+F12 Find All References · Ctrl+P open file · Ctrl+Shift+F search', 'text', 'Pick one DevPath feature you haven''t looked at and write a short note explaining how it works end to end.', 'اختر ميزة في DevPath لم تنظر إليها من قبل، واكتب ملاحظة قصيرة تشرح كيف تعمل من البداية للنهاية.', 'Clone an open-source ASP.NET Core + Angular project, run it and document its architecture in one page.', 'انسخ مشروعًا مفتوح المصدر يستخدم ASP.NET Core وAngular، وشغّله، ووثّق بنيته في صفحة واحدة.'),
  (134, 'pro-debugging', 12, 2, 'Professional', 'Core', 45, 'Debugging unfamiliar code', 'تصحيح كود غير مألوف', 'Debugging is a method: reproduce, observe, form a hypothesis, test it, fix, and add a test so the bug never returns.', 'التصحيح منهج: أعد إنتاج الخطأ، ولاحظ، وكوّن فرضية، واختبرها، وأصلح، ثم أضف اختبارًا حتى لا يعود الخطأ أبدًا.', 'Bug tickets are a large part of junior work. A systematic approach beats random changes every time.', 'مهام الأخطاء جزء كبير من عمل المطور المبتدئ، والمنهج المنظم يتفوق على التغييرات العشوائية دائمًا.', 'Use VS Code breakpoints (C# and browser), the Network tab, logs and SQL traces. Read the whole exception and stack trace. Change one thing at a time.', 'استخدم نقاط التوقف في VS Code (لـ C# والمتصفح)، وتبويب Network، والسجلات، وتتبع SQL. اقرأ الاستثناء وStack trace بالكامل، وغيّر شيئًا واحدًا في كل مرة.', 'A ''sometimes wrong total'' bug turned out to be a culture-specific decimal parse; the stack trace and a failing test found it in 20 minutes.', 'خطأ الإجمالي الخاطئ أحيانًا تبيّن أنه تحويل عشري يعتمد على الثقافة، ووجده Stack trace واختبار فاشل خلال 20 دقيقة.', '1. Reproduce   exact steps, data and environment — make it fail on purpose
2. Observe     read the WHOLE exception + stack trace, logs, Network tab, SQL log
3. Hypothesise "I think X happens because Y"
4. Test it     breakpoint / log / smaller input — change ONE thing at a time
5. Fix         the cause, not the symptom
6. Protect     add a test that failed before the fix
7. Explain     a one-line note in the PR: cause → fix

Useful tools: conditional breakpoints, Debug Console, browser DevTools,
EF Core SQL logging, `git bisect` to find the commit that introduced a bug.', 'text', 'Complete three debugging exercises in DevPath''s Practice Lab.', 'أكمل ثلاثة تمارين تصحيح في مختبر التدريب في DevPath.', 'Set a conditional breakpoint that only stops for a specific order id.', 'اضبط نقطة توقف شرطية لا تتوقف إلا عند معرف طلب محدد.'),
  (135, 'pro-breaking-down-features', 12, 3, 'Professional', 'Core', 30, 'Breaking features into tasks', 'تقسيم الميزات إلى مهام', 'Split a feature into small, testable steps — schema, API, UI, tests — each finishable in hours, not days.', 'قسّم الميزة إلى خطوات صغيرة قابلة للاختبار (المخطط، والـ API، والواجهة، والاختبارات)، يمكن إنهاء كل منها في ساعات لا أيام.', 'Small tasks make estimates realistic, progress visible and pull requests easy to review.', 'المهام الصغيرة تجعل التقديرات واقعية، والتقدم مرئيًا، وطلبات الدمج سهلة المراجعة.', 'Write the user-visible outcome first, list the layers it touches, define acceptance criteria and identify unknowns to investigate first.', 'اكتب النتيجة المرئية للمستخدم أولًا، واذكر الطبقات التي تمسها، وحدد معايير القبول، وحدد المجاهيل للتحقيق فيها أولًا.', 'DevPath''s project milestones are an example: each task has a description, estimate and acceptance criteria.', 'مراحل المشاريع في DevPath مثال على ذلك: لكل مهمة وصف وتقدير ومعايير قبول.', 'Feature: "Customers can filter orders by date range"

1. API: add from/to query parameters to GET /api/orders            (45 min)
   ✓ from > to returns 400 with a clear message
   ✓ dates are inclusive and interpreted in UTC
2. DB: index on Orders(CustomerId, OrderDate)                        (20 min)
   ✓ migration reviewed; plan uses an index seek
3. UI: two date inputs in the orders toolbar                         (60 min)
   ✓ changing a date resets to page 1
   ✓ filters stored in the URL query string
4. Tests: API tests for valid range, invalid range, empty result      (40 min)
Unknown to investigate first: which time zone do users expect?', 'text', 'Break ''customers can filter orders by date range'' into tasks with acceptance criteria.', 'قسّم ميزة: يستطيع العملاء تصفية الطلبات حسب نطاق تاريخ، إلى مهام بمعايير قبول.', 'Estimate each task, do it, and compare estimate vs actual using DevPath''s study sessions.', 'قدّر كل مهمة، ونفّذها، وقارن التقدير بالفعلي باستخدام جلسات الدراسة في DevPath.'),
  (136, 'pro-requirements', 12, 4, 'Professional', 'Important', 30, 'Understanding requirements', 'فهم المتطلبات', 'Clarify requirements before coding: who is the user, what problem are we solving, what are the rules and edge cases, and how do we know it''s done?', 'وضّح المتطلبات قبل كتابة الكود: من المستخدم؟ وما المشكلة التي نحلها؟ وما القواعد والحالات الحدية؟ وكيف نعرف أن العمل انتهى؟', 'Building the wrong thing well is still waste. Good questions are a sign of seniority, not weakness.', 'بناء الشيء الخطأ بإتقان يظل هدرًا، والأسئلة الجيدة علامة على النضج لا الضعف.', 'Restate the requirement in your own words, ask about edge cases (empty, duplicate, concurrent, permissions), and confirm acceptance criteria in writing.', 'أعد صياغة المتطلب بكلماتك، واسأل عن الحالات الحدية (الفراغ، والتكرار، والتزامن، والصلاحيات)، وأكّد معايير القبول كتابيًا.', '''Prevent invalid order transitions'' → which transitions are valid? Can admins override? What does the user see?', 'منع انتقالات الطلب غير الصالحة ← أي الانتقالات صالحة؟ وهل يستطيع المسؤول التجاوز؟ وماذا يرى المستخدم؟', 'Change request: "Prevent invalid order transitions"

Clarifying questions
1. Which transitions are valid? (draw the state diagram and confirm it)
2. Can an administrator override a rule? With an audit log?
3. What should the user see when a transition is refused?
4. What happens to orders already in an "impossible" state?
5. Does cancelling a shipped order restore stock?

Acceptance criteria (agreed in writing)
- Given an order in Shipped, when someone sets it to Draft, the API returns 409 with code "invalid_transition"
- The UI only offers valid next statuses', 'text', 'Write five clarifying questions for one of Project 4''s change requests.', 'اكتب خمسة أسئلة توضيحية لأحد طلبات التغيير في المشروع الرابع.', 'Turn a vague request (''make the dashboard better'') into three concrete, testable requirements.', 'حوّل طلبًا غامضًا (حسّن لوحة المعلومات) إلى ثلاثة متطلبات محددة وقابلة للاختبار.'),
  (137, 'pro-code-review', 12, 5, 'Professional', 'Core', 40, 'Code review', 'مراجعة الكود', 'Review for correctness first, then security, performance, readability and tests. Give specific, kind, actionable comments — and receive them well.', 'راجع الصحة أولًا، ثم الأمان والأداء وسهولة القراءة والاختبارات. وقدّم تعليقات محددة ولطيفة وقابلة للتنفيذ، وتقبّلها بصدر رحب.', 'You''ll review and be reviewed daily. It''s also one of the fastest ways to learn a codebase.', 'ستراجِع وتُراجَع يوميًا، وهي أيضًا من أسرع طرق تعلم قاعدة الكود.', 'Read the description, run it if possible, check edge cases and error paths, and phrase comments as questions or suggestions with reasons.', 'اقرأ الوصف، وشغّل الكود إن أمكن، وتحقق من الحالات الحدية ومسارات الخطأ، وصُغ التعليقات كأسئلة أو اقتراحات مع الأسباب.', '''This loads all orders before filtering — could we move the Where before ToListAsync so SQL Server filters them?''', 'مثال: هذا الكود يحمّل كل الطلبات قبل التصفية، فهل يمكن نقل Where قبل ToListAsync ليصفّيها SQL Server؟', 'Review order
1. Correctness   does it do what the ticket says? edge cases? error paths?
2. Security      authorization on the server? input validated? secrets?
3. Data          migrations safe? transactions? concurrency?
4. Performance   N+1? unbounded lists? missing index?
5. Readability   names, small methods, no dead code
6. Tests         is the important behaviour tested?

Comment style
❌ "This is wrong."
✅ "This loads every order before filtering — could we move the Where before
    ToListAsync so SQL Server does the filtering? (Orders has ~2M rows in prod.)"', 'text', 'Complete the code review exercises in the Practice Lab.', 'أكمل تمارين مراجعة الكود في مختبر التدريب.', 'Write your personal code review checklist (10 items) and use it on your next PR.', 'اكتب قائمة تحقق شخصية لمراجعة الكود (10 بنود) واستخدمها في طلب الدمج القادم.'),
  (138, 'pro-refactoring', 12, 6, 'Professional', 'Important', 40, 'Refactoring safely', 'إعادة الهيكلة بأمان', 'Refactoring improves structure without changing behaviour: rename, extract method, extract class, remove duplication — in small steps protected by tests.', 'إعادة الهيكلة تحسّن البنية دون تغيير السلوك: إعادة التسمية، واستخراج دالة أو Class، وإزالة التكرار، بخطوات صغيرة تحميها الاختبارات.', 'Change requests land in messy code. Refactoring first makes the change easy and safe.', 'تصل طلبات التغيير إلى كود فوضوي، وإعادة الهيكلة أولًا تجعل التغيير سهلًا وآمنًا.', 'Add characterisation tests if none exist, use IDE refactorings (F2 rename, Extract Method), commit after each step, and keep refactoring and behaviour changes in separate commits.', 'أضف اختبارات توصيفية إن لم توجد اختبارات، واستخدم أدوات إعادة الهيكلة في المحرر (F2 لإعادة التسمية، وExtract Method)، ونفّذ Commit بعد كل خطوة، وافصل إعادة الهيكلة عن تغييرات السلوك.', 'Before adding a new discount type, extract the discount switch into polymorphic classes; then the new type is one small class.', 'قبل إضافة نوع خصم جديد، استخرج switch الخصومات إلى أصناف متعددة الأشكال، فيصبح النوع الجديد Class صغيرًا واحدًا.', '// Before: one long method that mixes validation, calculation and persistence
public async Task<int> Place(PlaceOrderRequest r)
{
    if (r.Lines.Count == 0) throw new ValidationException("Empty order");
    decimal total = 0;
    foreach (var l in r.Lines) { var p = await db.Products.FindAsync(l.ProductId); total += p!.Price * l.Quantity; }
    // ... 60 more lines ...
}

// After: small steps, each committed separately, behaviour unchanged (tests stay green)
public async Task<int> PlaceAsync(PlaceOrderRequest request, CancellationToken ct)
{
    OrderValidator.EnsureNotEmpty(request);
    var products = await LoadProductsAsync(request, ct);
    var order = OrderFactory.Create(request, products);   // total calculated here, from DB prices
    return await SaveAsync(order, ct);
}', 'csharp', 'Refactor the longest method in Project 1 into three smaller methods without changing the output.', 'أعد هيكلة أطول دالة في المشروع الأول إلى ثلاث دوال أصغر دون تغيير المخرجات.', 'Implement a Project 2 change request using ''make the change easy, then make the easy change''.', 'نفّذ طلب تغيير في المشروع الثاني بمبدأ: اجعل التغيير سهلًا، ثم نفّذ التغيير السهل.'),
  (139, 'pro-security', 12, 7, 'Professional', 'Core', 45, 'Security fundamentals', 'أساسيات الأمان', 'Know the common risks (OWASP Top 10): injection, broken access control, secrets in code, XSS, insecure dependencies — and the default defences.', 'اعرف المخاطر الشائعة (OWASP Top 10): الحقن، وكسر التحكم في الوصول، والأسرار في الكود، وXSS، والاعتماديات غير الآمنة، والدفاعات الافتراضية ضدها.', 'Every developer is responsible for security. Most vulnerabilities are ordinary bugs in ordinary code.', 'كل مطور مسؤول عن الأمان، ومعظم الثغرات أخطاء عادية في كود عادي.', 'Parameterise queries, authorise every request on the server, validate input, keep secrets out of Git, let Angular escape output (avoid bypassSecurityTrust*), and update vulnerable packages.', 'استخدم المعاملات في الاستعلامات، وفوّض كل طلب على الخادم، وتحقق من المدخلات، وأبقِ الأسرار خارج Git، ودع Angular يعالج المخرجات (وتجنب bypassSecurityTrust*)، وحدّث الحزم الضعيفة.', '''dotnet list package --vulnerable'' found a vulnerable transitive package while building DevPath; pinning a patched version fixed it.', 'اكتشف الأمر dotnet list package --vulnerable حزمة ضعيفة غير مباشرة أثناء بناء DevPath، وأصلح تثبيت إصدار مُرقّع المشكلة.', '# Find known-vulnerable packages
dotnet list package --vulnerable --include-transitive
npm audit

# Keep secrets out of source control
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<a long random value>"

# Checklist
#  - every endpoint: who may call it? enforced on the SERVER
#  - every query: parameterised (no string concatenation)
#  - every input: validated (length, range, format)
#  - Angular: never use bypassSecurityTrustHtml with user content
#  - errors: no stack traces or SQL in responses', 'bash', 'Run ''dotnet list package --vulnerable'' and ''npm audit'' on your projects.', 'شغّل dotnet list package --vulnerable وnpm audit على مشاريعك.', 'Review Project 4 against the OWASP Top 10 and fix the two most serious findings.', 'راجع المشروع الرابع وفق OWASP Top 10، وأصلح أخطر ملاحظتين.'),
  (140, 'pro-performance', 12, 8, 'Professional', 'Important', 40, 'Performance troubleshooting', 'تشخيص مشكلات الأداء', 'Measure before optimising: find where time goes (browser, network, API, database), fix the biggest cost, and measure again.', 'قِس قبل التحسين: اكتشف أين يذهب الوقت (المتصفح، والشبكة، والـ API، وقاعدة البيانات)، وأصلح التكلفة الأكبر، ثم قِس مرة أخرى.', '''The page is slow'' tickets are common, and the cause is rarely where you first guess.', 'مهام الصفحة بطيئة شائعة، ونادرًا ما يكون السبب حيث تخمّن أولًا.', 'Browser DevTools (Network waterfall, Performance), API request timing logs, EF Core SQL logs and SQL Server execution plans — work from the outside in.', 'استخدم أدوات المتصفح (مخطط Network وPerformance)، وسجلات توقيت طلبات الـ API، وسجلات SQL في EF Core، وخطط تنفيذ SQL Server، واعمل من الخارج إلى الداخل.', 'DevPath''s RequestTimingMiddleware logs a warning for any request over 500 ms — a cheap first signal.', 'يسجل RequestTimingMiddleware في DevPath تحذيرًا لأي طلب يتجاوز 500 مللي ثانية، وهي إشارة أولى رخيصة.', 'Work from the outside in:

Browser       DevTools → Network: which request is slow? how big is the response?
              Performance tab: is rendering the problem (huge lists, no track)?
API           request timing logs: which endpoint, how many ms?
Data access   EF Core SQL log: how many queries per request? (N+1?)
Database      execution plan, logical reads, missing indexes, blocking

Fix the biggest cost first, then MEASURE AGAIN.
Typical wins: projection + paging, AsNoTracking, removing N+1, one index, caching lookups.', 'text', 'Use the Network tab to find the slowest API call on DevPath''s Progress page.', 'استخدم تبويب Network لاكتشاف أبطأ استدعاء API في صفحة التقدم في DevPath.', 'Complete the ''slow endpoint'' scenario in the Practice Lab and write up your investigation.', 'أكمل سيناريو نقطة النهاية البطيئة في مختبر التدريب، واكتب تقريرًا عن تحقيقك.'),
  (141, 'pro-logging-diagnostics', 12, 9, 'Professional', 'Important', 30, 'Logging and diagnostics', 'التسجيل والتشخيص', 'Design logs for the person debugging at 2 a.m.: correlation ids, structured properties, correct levels and no sensitive data.', 'صمّم السجلات للشخص الذي يصحح الأخطاء في الثانية صباحًا: معرّفات الارتباط، والخصائص المنظمة، والمستويات الصحيحة، ودون بيانات حساسة.', 'In production you can''t attach a debugger. Logs, metrics and traces are all you have.', 'في الإنتاج لا يمكنك ربط مصحح، والسجلات والمقاييس والتتبعات هي كل ما لديك.', 'Log business events at Information, unexpected failures at Error with the exception, include ids (OrderId, TraceId), never log passwords or tokens, and use dotnet-counters/dotnet-trace for runtime diagnostics.', 'سجّل أحداث العمل بمستوى Information، والأعطال غير المتوقعة بمستوى Error مع الاستثناء، وضمّن المعرفات (OrderId وTraceId)، ولا تسجل كلمات المرور أو الرموز أبدًا، واستخدم dotnet-counters/dotnet-trace لتشخيص وقت التشغيل.', 'Error responses include a traceId; searching the logs for it shows the full exception.', 'تتضمن استجابات الأخطاء traceId، والبحث عنه في السجلات يعرض الاستثناء الكامل.', 'public async Task ShipAsync(int orderId, CancellationToken ct)
{
    using var scope = logger.BeginScope(new Dictionary<string, object> { ["OrderId"] = orderId });
    try
    {
        // ... business logic ...
        logger.LogInformation("Order shipped with {LineCount} lines", order.Lines.Count);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Shipping failed");     // exception + OrderId from the scope
        throw;
    }
}

// Never: logger.LogInformation("Login {Email} {Password}", email, password);

// Runtime diagnostics without a debugger:
//   dotnet-counters monitor --process-id <pid>
//   dotnet-trace collect --process-id <pid>', 'csharp', 'Add structured logs to Project 2''s stock operations and read them in the console.', 'أضف سجلات منظمة لعمليات المخزون في المشروع الثاني واقرأها في الطرفية.', 'Write logs to a rolling file and use them to answer: ''what happened to order 42 yesterday?''', 'اكتب السجلات في ملف متجدد، واستخدمها للإجابة عن: ماذا حدث للطلب 42 بالأمس؟'),
  (142, 'pro-documentation', 12, 10, 'Professional', 'Optional', 25, 'Technical documentation', 'التوثيق التقني', 'Write the minimum useful documentation: READMEs, API docs (OpenAPI), decision records and comments that explain why, not what.', 'اكتب الحد الأدنى المفيد من التوثيق: ملفات README، وتوثيق الـ API (OpenAPI)، وسجلات القرارات، وتعليقات تشرح السبب لا الفعل.', 'Documentation scales knowledge in a team and helps your future self.', 'ينشر التوثيق المعرفة في الفريق، ويساعد نفسك في المستقبل.', 'Keep docs next to code, update them in the same PR as the change, and prefer examples over prose.', 'أبقِ التوثيق بجوار الكود، وحدّثه في طلب الدمج نفسه مع التغيير، وفضّل الأمثلة على السرد.', 'A short ADR: ''We use EF Core for writes and a stored procedure for the monthly sales report because…''', 'سجل قرار قصير: نستخدم EF Core للكتابة وإجراءً مخزنًا لتقرير المبيعات الشهري لأن…', '# ADR 003: Monthly sales report uses a stored procedure

Status: accepted (2026-10-19)

Context
The report aggregates ~3M order lines. The EF Core version took 9 s and
loaded too much data into memory.

Decision
Use dbo.usp_MonthlySales, called with parameters via Database.SqlQuery.
Order placement and other writes stay in EF Core.

Consequences
+ 300 ms instead of 9 s
- logic lives in SQL; covered by an integration test against SQL Server', 'text', 'Write an architecture decision record for one design choice in Project 4.', 'اكتب سجل قرار معماري لاختيار تصميمي واحد في المشروع الرابع.', 'Add XML doc comments to your API and confirm they appear in the OpenAPI document.', 'أضف تعليقات XML التوثيقية إلى الـ API وتأكد من ظهورها في وثيقة OpenAPI.'),
  (143, 'pro-deployment', 12, 11, 'Professional', 'Important', 40, 'Deployment fundamentals (local-first)', 'أساسيات النشر (محليًا أولًا)', 'Deployment turns code into a running app: build in Release, publish, configure the environment, apply migrations, serve the frontend and verify health.', 'النشر يحوّل الكود إلى تطبيق يعمل: البناء بوضع Release، والنشر، وضبط البيئة، وتطبيق الـ Migrations، وتقديم الواجهة، والتحقق من الصحة.', 'Even if a DevOps team owns pipelines, developers must understand configuration, environments and migrations to avoid broken releases.', 'حتى لو كان فريق DevOps يملك خطوط النشر، يجب أن يفهم المطورون الإعدادات والبيئات والـ Migrations لتجنب الإصدارات المعطلة.', '''dotnet publish -c Release'', ''ng build'' (outputs to dist/), set ASPNETCORE_ENVIRONMENT and connection strings via environment variables, run migrations via an idempotent script, and check /api/health.', 'نفّذ dotnet publish -c Release وng build (المخرجات في dist/)، واضبط ASPNETCORE_ENVIRONMENT وسلاسل الاتصال عبر متغيرات البيئة، وطبّق الـ Migrations بسكربت Idempotent، وتحقق من /api/health.', 'Publishing DevPath locally: publish the API to a folder, copy the Angular build into its wwwroot or serve it separately, and run it against LocalDB.', 'نشر DevPath محليًا: انشر الـ API إلى مجلد، وانسخ ناتج بناء Angular إلى wwwroot أو قدّمه بشكل منفصل، وشغّله مع LocalDB.', '# Backend: build a self-contained release folder
dotnet publish backend/SalesOrders.Api -c Release -o ./publish/api

# Database: produce a reviewable, re-runnable script
dotnet ef migrations script --idempotent -p backend/SalesOrders.Api -o ./publish/migrate.sql

# Frontend: production build → dist/
cd frontend && npm ci && npx ng build && cd ..

# Run the published API with environment-specific settings
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ConnectionStrings__Default = "Server=.;Database=SalesOrders;Trusted_Connection=True;TrustServerCertificate=True"
dotnet ./publish/api/SalesOrders.Api.dll

# Smoke test
curl http://localhost:5000/api/health', 'bash', 'Publish Project 2 with ''dotnet publish'' and run the published DLL from another folder.', 'انشر المشروع الثاني بالأمر dotnet publish، وشغّل ملف DLL المنشور من مجلد آخر.', 'Write a release checklist (build, tests, migration script, config, smoke test, rollback plan).', 'اكتب قائمة تحقق للإصدار (البناء، والاختبارات، وسكربت الـ Migrations، والإعدادات، والاختبار السريع، وخطة التراجع).'),
  (144, 'pro-incident-investigation', 12, 12, 'Professional', 'Important', 35, 'Production incident investigation', 'التحقيق في حوادث الإنتاج', 'When production breaks: stabilise first, gather evidence (logs, metrics, recent changes), find the root cause, fix, and write a blameless post-incident review.', 'عندما يتعطل الإنتاج: أعد الاستقرار أولًا، واجمع الأدلة (السجلات، والمقاييس، والتغييرات الأخيرة)، وابحث عن السبب الجذري، وأصلح، واكتب مراجعة لاحقة دون لوم.', 'Calm, methodical incident handling builds trust quickly — and your SQL Server experience with blocking and slow queries is directly useful here.', 'التعامل الهادئ والمنهجي مع الحوادث يبني الثقة بسرعة، وخبرتك في SQL Server مع الحجب والاستعلامات البطيئة مفيدة هنا مباشرة.', 'Ask: what changed? when did it start? who is affected? Check deploys, logs by traceId, database blocking (sys.dm_exec_requests), and roll back if needed before debugging.', 'اسأل: ما الذي تغير؟ ومتى بدأ؟ ومن المتأثر؟ وافحص عمليات النشر، والسجلات حسب traceId، والحجب في قاعدة البيانات (sys.dm_exec_requests)، وتراجع إذا لزم الأمر قبل التصحيح.', 'Orders started timing out after a release; the timeline pointed to a new query without an index, and a rollback restored service while the index was added.', 'بدأت الطلبات تتجاوز المهلة بعد إصدار جديد، وأشار الخط الزمني إلى استعلام جديد بلا فهرس، فأعاد التراجع الخدمة ريثما أضيف الفهرس.', '-- "Orders are timing out!" — who is waiting on whom right now?
SELECT r.session_id, r.blocking_session_id, r.wait_type, r.wait_time / 1000 AS wait_s,
       DB_NAME(r.database_id) AS db, s.program_name, t.text AS running_sql
FROM sys.dm_exec_requests AS r
JOIN sys.dm_exec_sessions AS s ON s.session_id = r.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS t
WHERE s.is_user_process = 1
ORDER BY r.wait_time DESC;

-- Timeline questions:
--   What was deployed, and when?        (release notes, git log)
--   When did errors start?              (logs grouped by minute)
--   Which endpoint / traceId?           (API request logs)
--   Is it the database?                 (blocking, top queries in Query Store)', 'sql', 'Complete the real-world scenarios in the Practice Lab and write your investigation steps.', 'أكمل سيناريوهات العالم الحقيقي في مختبر التدريب، واكتب خطوات تحقيقك.', 'Write a blameless post-incident review for one bug you fixed in your projects.', 'اكتب مراجعة لاحقة دون لوم لخطأ واحد أصلحته في مشاريعك.')
on conflict do nothing;

insert into public.topic_prerequisites (topic_id, prerequisite_topic_id) values
  (2, 1),
  (3, 2),
  (76, 2),
  (4, 3),
  (5, 4),
  (22, 4),
  (6, 5),
  (7, 6),
  (8, 6),
  (10, 6),
  (12, 6),
  (26, 6),
  (116, 6),
  (9, 7),
  (23, 7),
  (26, 8),
  (39, 8),
  (134, 8),
  (79, 9),
  (11, 10),
  (23, 11),
  (13, 12),
  (16, 12),
  (20, 12),
  (21, 12),
  (28, 12),
  (80, 12),
  (116, 12),
  (14, 13),
  (19, 13),
  (15, 14),
  (17, 14),
  (18, 15),
  (17, 16),
  (19, 16),
  (30, 16),
  (33, 16),
  (122, 16),
  (18, 17),
  (138, 18),
  (22, 21),
  (29, 21),
  (36, 21),
  (117, 22),
  (24, 23),
  (25, 23),
  (48, 23),
  (56, 25),
  (27, 26),
  (30, 26),
  (83, 26),
  (31, 30),
  (33, 30),
  (40, 30),
  (133, 30),
  (32, 31),
  (95, 31),
  (36, 32),
  (38, 32),
  (104, 32),
  (34, 33),
  (35, 33),
  (41, 33),
  (48, 33),
  (92, 33),
  (42, 35),
  (143, 35),
  (37, 36),
  (44, 36),
  (45, 36),
  (106, 36),
  (109, 37),
  (39, 38),
  (118, 38),
  (110, 39),
  (42, 40),
  (105, 40),
  (140, 41),
  (141, 41),
  (43, 42),
  (114, 43),
  (139, 43),
  (46, 45),
  (74, 45),
  (102, 45),
  (112, 45),
  (47, 46),
  (113, 46),
  (49, 48),
  (50, 48),
  (72, 48),
  (53, 49),
  (51, 50),
  (52, 50),
  (63, 50),
  (53, 51),
  (62, 51),
  (55, 52),
  (54, 53),
  (57, 53),
  (108, 53),
  (119, 53),
  (55, 54),
  (56, 54),
  (60, 55),
  (59, 56),
  (58, 57),
  (65, 57),
  (68, 58),
  (115, 58),
  (60, 59),
  (64, 59),
  (69, 59),
  (71, 59),
  (61, 60),
  (73, 61),
  (75, 61),
  (140, 61),
  (143, 62),
  (71, 64),
  (66, 65),
  (67, 66),
  (70, 69),
  (75, 70),
  (139, 70),
  (77, 76),
  (78, 76),
  (79, 77),
  (80, 77),
  (86, 77),
  (106, 77),
  (82, 78),
  (83, 78),
  (95, 79),
  (81, 80),
  (87, 80),
  (87, 82),
  (84, 83),
  (96, 83),
  (85, 84),
  (110, 85),
  (85, 86),
  (88, 87),
  (133, 87),
  (89, 88),
  (91, 88),
  (90, 89),
  (94, 89),
  (97, 89),
  (93, 90),
  (99, 90),
  (120, 90),
  (92, 91),
  (95, 91),
  (99, 91),
  (103, 91),
  (102, 93),
  (103, 93),
  (114, 93),
  (101, 94),
  (109, 94),
  (96, 95),
  (98, 95),
  (104, 95),
  (114, 95),
  (121, 95),
  (102, 96),
  (98, 97),
  (99, 97),
  (111, 98),
  (100, 99),
  (101, 100),
  (108, 101),
  (112, 102),
  (113, 102),
  (105, 104),
  (106, 104),
  (107, 106),
  (108, 106),
  (111, 108),
  (115, 110),
  (117, 116),
  (118, 116),
  (120, 116),
  (138, 116),
  (122, 117),
  (119, 118),
  (123, 118),
  (121, 120),
  (123, 120),
  (125, 124),
  (129, 124),
  (130, 124),
  (126, 125),
  (128, 125),
  (127, 126),
  (137, 128),
  (131, 130),
  (132, 131),
  (142, 131),
  (144, 134),
  (136, 135),
  (144, 141)
on conflict do nothing;

insert into public.resources (id, key, title_en, title_ar, url, source_name, type, difficulty, is_free, verification_status, last_verified_at, last_status_code) values
  (1, 'cs-tour', 'A tour of the C# language', 'جولة في لغة C#', 'https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (2, 'cs-learn-path', 'Get started with C# (learning path)', 'ابدأ مع C# (مسار تعليمي)', 'https://learn.microsoft.com/en-us/training/paths/get-started-c-sharp-part-1/', 'Microsoft Learn', 'Course', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (3, 'dotnet-cli', '.NET CLI overview', 'نظرة عامة على أداة .NET CLI', 'https://learn.microsoft.com/en-us/dotnet/core/tools/', 'Microsoft Learn', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (4, 'cs-builtin-types', 'Built-in types (C# reference)', 'الأنواع المدمجة (مرجع C#)', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/built-in-types', 'Microsoft Learn', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (5, 'cs-operators-ref', 'C# operators and expressions', 'العوامل والتعابير في C#', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/', 'Microsoft Learn', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (6, 'cs-selection', 'Selection statements: if and switch', 'جمل الاختيار: if وswitch', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements', 'Microsoft Learn', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (7, 'cs-iteration', 'Iteration statements: for, foreach, while', 'جمل التكرار: for وforeach وwhile', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements', 'Microsoft Learn', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (8, 'cs-methods-guide', 'Methods (C# programming guide)', 'الدوال (دليل برمجة C#)', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/methods', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (9, 'dotnet-collections', 'Collections and data structures', 'المجموعات وهياكل البيانات', 'https://learn.microsoft.com/en-us/dotnet/standard/collections/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (10, 'exceptions-best-practices', 'Best practices for exceptions', 'أفضل الممارسات للاستثناءات', 'https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions', 'Microsoft Learn', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (11, 'cs-generics-doc', 'Generic types and methods', 'الأنواع والدوال العامة', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (12, 'cs-delegates-doc', 'Delegates (C# programming guide)', 'المفوِّضات (دليل برمجة C#)', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (13, 'cs-lambdas-doc', 'Lambda expressions and anonymous functions', 'تعابير Lambda والدوال المجهولة', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions', 'Microsoft Learn', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (14, 'cs-oop', 'Object-oriented programming in C#', 'البرمجة الكائنية في C#', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (15, 'cs-classes', 'Introduction to classes', 'مقدمة إلى الأصناف', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (16, 'cs-interfaces', 'Interfaces: define behaviour for multiple types', 'الواجهات: تعريف سلوك لعدة أنواع', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (17, 'architectural-principles', 'Architectural principles (SOLID, separation of concerns)', 'المبادئ المعمارية (SOLID وفصل الاهتمامات)', 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles', 'Microsoft Learn', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (18, 'nullable-refs', 'Nullable reference types', 'الأنواع المرجعية القابلة لـ null', 'https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (19, 'records-ref', 'Records (C# reference)', 'السجلات Records (مرجع C#)', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record', 'Microsoft Learn', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (20, 'pattern-matching', 'Pattern matching overview', 'نظرة عامة على مطابقة الأنماط', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (21, 'linq-overview', 'Language Integrated Query (LINQ)', 'الاستعلام المدمج في اللغة (LINQ)', 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (22, 'linq-intro-queries', 'Introduction to LINQ queries', 'مقدمة إلى استعلامات LINQ', 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries', 'Microsoft Learn', 'Tutorial', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (23, 'async-programming', 'Asynchronous programming with async and await', 'البرمجة غير المتزامنة باستخدام async وawait', 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (24, 'cancellation', 'Cancellation in managed threads', 'الإلغاء في الـ Threads المُدارة', 'https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (25, 'value-types', 'Value types (C# reference)', 'أنواع القيمة (مرجع C#)', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types', 'Microsoft Learn', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (26, 'cs-whats-new', 'What''s new in C#', 'ما الجديد في C#', 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (27, 'aspnet-fundamentals', 'ASP.NET Core fundamentals', 'أساسيات ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (28, 'first-web-api', 'Tutorial: Create a controller-based web API', 'درس: إنشاء Web API قائم على وحدات التحكم', 'https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api', 'Microsoft Learn', 'Tutorial', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (29, 'web-api-overview', 'Create web APIs with ASP.NET Core', 'إنشاء واجهات Web API باستخدام ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/web-api/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (30, 'aspnet-routing', 'Routing to controller actions', 'التوجيه إلى إجراءات وحدات التحكم', 'https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/routing', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (31, 'aspnet-di', 'Dependency injection in ASP.NET Core', 'حقن الاعتماديات في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (32, 'aspnet-configuration', 'Configuration in ASP.NET Core', 'الإعدادات في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (33, 'aspnet-options', 'Options pattern in ASP.NET Core', 'نمط Options في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (34, 'app-secrets', 'Safe storage of app secrets in development', 'التخزين الآمن لأسرار التطبيق أثناء التطوير', 'https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (35, 'model-validation', 'Model validation in ASP.NET Core', 'التحقق من النماذج في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (36, 'action-return-types', 'Controller action return types', 'أنواع القيم المُرجعة من إجراءات وحدات التحكم', 'https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (37, 'mdn-status', 'HTTP response status codes', 'رموز حالة استجابة HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status', 'MDN Web Docs', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (38, 'mdn-methods', 'HTTP request methods', 'طرق طلبات HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods', 'MDN Web Docs', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (39, 'api-design', 'Best practices for RESTful web API design', 'أفضل الممارسات لتصميم واجهات RESTful', 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design', 'Microsoft Learn', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (40, 'error-handling', 'Handle errors in ASP.NET Core', 'معالجة الأخطاء في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (41, 'web-api-errors', 'Handle errors in ASP.NET Core controller-based web APIs', 'معالجة الأخطاء في واجهات Web API القائمة على وحدات التحكم', 'https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (42, 'rfc-9457', 'RFC 9457: Problem Details for HTTP APIs', 'المعيار RFC 9457: تفاصيل المشكلات لواجهات HTTP', 'https://www.rfc-editor.org/rfc/rfc9457', 'IETF', 'Reference', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (43, 'middleware', 'ASP.NET Core middleware', 'الـ Middleware في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (44, 'logging', 'Logging in .NET and ASP.NET Core', 'التسجيل في .NET وASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (45, 'authentication', 'Overview of ASP.NET Core authentication', 'نظرة عامة على المصادقة في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (46, 'authorization', 'Introduction to authorization in ASP.NET Core', 'مقدمة إلى التفويض في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (47, 'web-api-module', 'Create a web API with ASP.NET Core controllers (module)', 'إنشاء Web API باستخدام وحدات تحكم ASP.NET Core (وحدة تعليمية)', 'https://learn.microsoft.com/en-us/training/modules/build-web-api-aspnet-core/', 'Microsoft Learn', 'Course', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (48, 'ef-overview', 'Entity Framework Core overview', 'نظرة عامة على Entity Framework Core', 'https://learn.microsoft.com/en-us/ef/core/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (49, 'ef-dbcontext-config', 'DbContext lifetime, configuration and initialization', 'عمر DbContext وإعداده وتهيئته', 'https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (50, 'ef-modeling', 'Creating and configuring a model', 'إنشاء النموذج وضبطه', 'https://learn.microsoft.com/en-us/ef/core/modeling/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (51, 'ef-migrations', 'Migrations overview', 'نظرة عامة على الـ Migrations', 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (52, 'ef-relationships', 'Introduction to relationships', 'مقدمة إلى العلاقات', 'https://learn.microsoft.com/en-us/ef/core/modeling/relationships', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (53, 'ef-saving', 'Saving data', 'حفظ البيانات', 'https://learn.microsoft.com/en-us/ef/core/saving/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (54, 'ef-tracking', 'Tracking vs. no-tracking queries', 'الاستعلامات المتتبَّعة وغير المتتبَّعة', 'https://learn.microsoft.com/en-us/ef/core/querying/tracking', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (55, 'ef-related-data', 'Loading related data', 'تحميل البيانات المرتبطة', 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (56, 'ef-client-eval', 'Client vs. server evaluation', 'التقييم على العميل مقابل الخادم', 'https://learn.microsoft.com/en-us/ef/core/querying/client-eval', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (57, 'ef-transactions', 'Using transactions', 'استخدام المعاملات', 'https://learn.microsoft.com/en-us/ef/core/saving/transactions', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (58, 'ef-concurrency', 'Handling concurrency conflicts', 'التعامل مع تعارضات التزامن', 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (59, 'ef-simple-logging', 'Simple logging in EF Core', 'التسجيل البسيط في EF Core', 'https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/simple-logging', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (60, 'ef-performance', 'EF Core performance introduction', 'مقدمة إلى الأداء في EF Core', 'https://learn.microsoft.com/en-us/ef/core/performance/', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (61, 'ef-efficient-querying', 'Efficient querying', 'الاستعلام بكفاءة', 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying', 'Microsoft Learn', 'Article', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (62, 'ef-sql-queries', 'SQL queries in EF Core (FromSql, SqlQuery)', 'استعلامات SQL في EF Core (FromSql وSqlQuery)', 'https://learn.microsoft.com/en-us/ef/core/querying/sql-queries', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (63, 'ef-resiliency', 'Connection resiliency', 'مرونة الاتصال', 'https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (64, 'ef-pagination', 'Pagination in EF Core', 'التقسيم إلى صفحات في EF Core', 'https://learn.microsoft.com/en-us/ef/core/querying/pagination', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (65, 'ef-indexes', 'Indexes in EF Core', 'الفهارس في EF Core', 'https://learn.microsoft.com/en-us/ef/core/modeling/indexes', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (66, 'ef-module', 'Persist and retrieve relational data with EF Core (module)', 'حفظ البيانات العلائقية واسترجاعها باستخدام EF Core (وحدة تعليمية)', 'https://learn.microsoft.com/en-us/training/modules/persist-data-ef-core/', 'Microsoft Learn', 'Course', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (67, 'sql-index-guide', 'SQL Server index architecture and design guide', 'دليل بنية وتصميم الفهارس في SQL Server', 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (68, 'sql-actual-plan', 'Display an actual execution plan', 'عرض خطة التنفيذ الفعلية', 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/display-an-actual-execution-plan', 'Microsoft Learn', 'Tutorial', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (69, 'sql-locking-guide', 'Transaction locking and row versioning guide', 'دليل أقفال المعاملات وإصدارات الصفوف', 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (70, 'sql-isolation', 'SET TRANSACTION ISOLATION LEVEL', 'الأمر SET TRANSACTION ISOLATION LEVEL', 'https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql', 'Microsoft Learn', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (71, 'sql-deadlocks-guide', 'Deadlocks guide', 'دليل حالات الجمود', 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (72, 'sql-injection-ms', 'SQL injection (SQL Server docs)', 'حقن SQL (توثيق SQL Server)', 'https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (73, 'owasp-sqli-cheatsheet', 'SQL Injection Prevention Cheat Sheet', 'ورقة مرجعية لمنع حقن SQL', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', 'OWASP', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (74, 'connection-pooling', 'SQL Server connection pooling (ADO.NET)', 'تجميع الاتصالات في SQL Server (ADO.NET)', 'https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql-server-connection-pooling', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (75, 'query-store', 'Monitor performance by using the Query Store', 'مراقبة الأداء باستخدام Query Store', 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (76, 'xevents-quickstart', 'Quickstart: Extended Events', 'بدء سريع: Extended Events', 'https://learn.microsoft.com/en-us/sql/relational-databases/extended-events/quick-start-extended-events-in-sql-server', 'Microsoft Learn', 'Tutorial', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (77, 'localdb', 'SQL Server Express LocalDB', 'SQL Server Express LocalDB', 'https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (78, 'ts-handbook', 'The TypeScript Handbook', 'دليل TypeScript', 'https://www.typescriptlang.org/docs/handbook/intro.html', 'TypeScript', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (79, 'ts-everyday-types', 'Everyday types', 'الأنواع اليومية', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', 'TypeScript', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (80, 'ts-functions', 'More on functions', 'المزيد عن الدوال', 'https://www.typescriptlang.org/docs/handbook/2/functions.html', 'TypeScript', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (81, 'ts-generics', 'Generics', 'الأنواع العامة', 'https://www.typescriptlang.org/docs/handbook/2/generics.html', 'TypeScript', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (82, 'ts-classes', 'Classes', 'الأصناف', 'https://www.typescriptlang.org/docs/handbook/2/classes.html', 'TypeScript', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (83, 'ts-modules', 'Modules', 'الوحدات', 'https://www.typescriptlang.org/docs/handbook/2/modules.html', 'TypeScript', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (84, 'ts-narrowing', 'Narrowing', 'تضييق الأنواع', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html', 'TypeScript', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (85, 'ts-utility-types', 'Utility types (Partial, Pick, Omit...)', 'الأنواع المساعدة (Partial وPick وOmit...)', 'https://www.typescriptlang.org/docs/handbook/utility-types.html', 'TypeScript', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (86, 'ts-playground', 'TypeScript Playground', 'ساحة تجربة TypeScript', 'https://www.typescriptlang.org/play', 'TypeScript', 'Tool', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (87, 'mdn-promise', 'Promise (JavaScript reference)', 'الكائن Promise (مرجع JavaScript)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise', 'MDN Web Docs', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (88, 'mdn-async-function', 'async function (JavaScript reference)', 'الدالة async (مرجع JavaScript)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function', 'MDN Web Docs', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (89, 'mdn-try-catch', 'try...catch (JavaScript reference)', 'الجملة try...catch (مرجع JavaScript)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch', 'MDN Web Docs', 'Reference', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (90, 'angular-overview', 'Angular overview', 'نظرة عامة على Angular', 'https://angular.dev/overview', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (91, 'angular-tutorial', 'Learn Angular (interactive tutorial)', 'تعلّم Angular (درس تفاعلي)', 'https://angular.dev/tutorials/learn-angular', 'Angular', 'Tutorial', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (92, 'angular-components', 'Components guide', 'دليل المكونات', 'https://angular.dev/guide/components', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (93, 'angular-templates', 'Template syntax', 'صياغة القوالب', 'https://angular.dev/guide/templates', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (94, 'angular-control-flow', 'Control flow (@if, @for, @switch)', 'التحكم في التدفق (@if و@for و@switch)', 'https://angular.dev/guide/templates/control-flow', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (95, 'angular-inputs', 'Accepting data with input properties', 'استقبال البيانات عبر خصائص الإدخال', 'https://angular.dev/guide/components/inputs', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (96, 'angular-outputs', 'Custom events with outputs', 'الأحداث المخصصة عبر المخرجات', 'https://angular.dev/guide/components/outputs', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (97, 'angular-di', 'Dependency injection in Angular', 'حقن الاعتماديات في Angular', 'https://angular.dev/guide/di', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (98, 'angular-routing', 'Routing in Angular', 'التوجيه في Angular', 'https://angular.dev/guide/routing', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (99, 'angular-reactive-forms', 'Reactive forms', 'النماذج التفاعلية', 'https://angular.dev/guide/forms/reactive-forms', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (100, 'angular-form-validation', 'Validating form input', 'التحقق من مدخلات النماذج', 'https://angular.dev/guide/forms/form-validation', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (101, 'angular-http', 'HTTP client', 'عميل HTTP', 'https://angular.dev/guide/http', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (102, 'angular-interceptors', 'HTTP interceptors', 'معترضات HTTP (Interceptors)', 'https://angular.dev/guide/http/interceptors', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (103, 'angular-signals', 'Signals', 'الإشارات (Signals)', 'https://angular.dev/guide/signals', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (104, 'angular-rxjs-interop', 'RxJS interop with Angular signals', 'التكامل بين RxJS وSignals في Angular', 'https://angular.dev/ecosystem/rxjs-interop', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (105, 'rxjs-overview', 'RxJS overview', 'نظرة عامة على RxJS', 'https://rxjs.dev/guide/overview', 'RxJS', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (106, 'angular-content-projection', 'Content projection with ng-content', 'إسقاط المحتوى باستخدام ng-content', 'https://angular.dev/guide/components/content-projection', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (107, 'angular-style-guide', 'Angular coding style guide', 'دليل أسلوب كتابة كود Angular', 'https://angular.dev/style-guide', 'Angular', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (108, 'angular-a11y', 'Accessibility in Angular', 'إمكانية الوصول في Angular', 'https://angular.dev/best-practices/a11y', 'Angular', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (109, 'angular-testing', 'Testing in Angular', 'الاختبار في Angular', 'https://angular.dev/guide/testing', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (110, 'angular-http-testing', 'Testing HTTP requests', 'اختبار طلبات HTTP', 'https://angular.dev/guide/http/testing', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (111, 'angular-cli', 'Angular CLI', 'أداة Angular CLI', 'https://angular.dev/tools/cli', 'Angular', 'Tool', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (112, 'angular-deployment', 'Deploying an Angular application', 'نشر تطبيق Angular', 'https://angular.dev/tools/cli/deployment', 'Angular', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (113, 'cors', 'Enable Cross-Origin Requests (CORS) in ASP.NET Core', 'تفعيل الطلبات عبر المصادر (CORS) في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/security/cors', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (114, 'mdn-cors', 'Cross-Origin Resource Sharing (CORS)', 'مشاركة الموارد عبر المصادر (CORS)', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS', 'MDN Web Docs', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (115, 'openapi-overview', 'OpenAPI support in ASP.NET Core', 'دعم OpenAPI في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (116, 'angular-making-requests', 'Making HTTP requests', 'إرسال طلبات HTTP', 'https://angular.dev/guide/http/making-requests', 'Angular', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (117, 'dotnet-testing', 'Testing in .NET', 'الاختبار في .NET', 'https://learn.microsoft.com/en-us/dotnet/core/testing/', 'Microsoft Learn', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (118, 'xunit-tutorial', 'Unit testing C# with xUnit and dotnet test', 'اختبار وحدة C# باستخدام xUnit وdotnet test', 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-csharp-with-xunit', 'Microsoft Learn', 'Tutorial', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (119, 'unit-testing-best-practices', 'Unit testing best practices', 'أفضل ممارسات اختبار الوحدة', 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices', 'Microsoft Learn', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (120, 'integration-tests', 'Integration tests in ASP.NET Core', 'اختبارات التكامل في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (121, 'ef-testing', 'Testing against your EF Core production database system', 'الاختبار مقابل نظام قاعدة بيانات الإنتاج في EF Core', 'https://learn.microsoft.com/en-us/ef/core/testing/', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (122, 'pro-git-book', 'Pro Git book', 'كتاب Pro Git', 'https://git-scm.com/book/en/v2', 'git-scm.com', 'Course', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (123, 'git-branching-nutshell', 'Git branching — branches in a nutshell', 'التفريع في Git باختصار', 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell', 'git-scm.com', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (124, 'git-basic-merging', 'Basic branching and merging', 'أساسيات التفريع والدمج', 'https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging', 'git-scm.com', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (125, 'git-rebasing', 'Rebasing', 'إعادة القاعدة (Rebase)', 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing', 'git-scm.com', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (126, 'git-reference', 'Git reference manual', 'الدليل المرجعي لـ Git', 'https://git-scm.com/docs', 'git-scm.com', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (127, 'gh-about-prs', 'About pull requests', 'حول طلبات الدمج', 'https://docs.github.com/en/pull-requests/reference/pull-requests', 'GitHub Docs', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (128, 'gh-resolve-conflict', 'Resolving a merge conflict using the command line', 'حل تعارض الدمج من سطر الأوامر', 'https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/resolving-a-merge-conflict-using-the-command-line', 'GitHub Docs', 'Tutorial', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (129, 'gh-about-readmes', 'About READMEs', 'حول ملفات README', 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes', 'GitHub Docs', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (130, 'gh-pinning', 'Pinning items to your GitHub profile', 'تثبيت العناصر في ملفك على GitHub', 'https://docs.github.com/en/account-and-profile/how-tos/profile-customization/pinning-items-to-your-profile', 'GitHub Docs', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (131, 'vscode-source-control', 'Source control in VS Code', 'إدارة الإصدارات في VS Code', 'https://code.visualstudio.com/docs/sourcecontrol/overview', 'Visual Studio Code', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (132, 'gitignore-templates', 'Ignoring files', 'تجاهل الملفات', 'https://docs.github.com/en/get-started/git-basics/ignoring-files', 'GitHub Docs', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (133, 'vscode-csharp-debugging', 'Debugging C# in VS Code', 'تصحيح C# في VS Code', 'https://code.visualstudio.com/docs/csharp/debugging', 'Visual Studio Code', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (134, 'vscode-debugging', 'Debugging in VS Code', 'التصحيح في VS Code', 'https://code.visualstudio.com/docs/debugtest/debugging', 'Visual Studio Code', 'Documentation', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (135, 'chrome-network', 'Inspect network activity (Chrome DevTools)', 'فحص نشاط الشبكة (Chrome DevTools)', 'https://developer.chrome.com/docs/devtools/network', 'Chrome for Developers', 'Tutorial', 'Beginner', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (136, 'google-code-review', 'Google engineering practices: code review', 'ممارسات Google الهندسية: مراجعة الكود', 'https://google.github.io/eng-practices/review/', 'Google', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (137, 'refactoring-guru', 'Refactoring: what it is and common techniques', 'إعادة الهيكلة: ماهيتها وأساليبها الشائعة', 'https://refactoring.guru/refactoring', 'Refactoring.Guru', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (138, 'owasp-top-ten', 'OWASP Top 10', 'قائمة OWASP لأهم 10 مخاطر', 'https://owasp.org/projects/top-ten', 'OWASP', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (139, 'aspnet-security', 'ASP.NET Core security topics', 'مواضيع الأمان في ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/security/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (140, 'aspnet-best-practices', 'ASP.NET Core best practices (performance)', 'أفضل ممارسات ASP.NET Core (الأداء)', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices', 'Microsoft Learn', 'Article', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (141, 'dotnet-diagnostics', '.NET diagnostics tools overview', 'نظرة عامة على أدوات التشخيص في .NET', 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/', 'Microsoft Learn', 'Documentation', 'Advanced', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (142, 'host-and-deploy', 'Host and deploy ASP.NET Core', 'استضافة ASP.NET Core ونشره', 'https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/', 'Microsoft Learn', 'Documentation', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (143, 'dotnet-publish', 'dotnet publish command', 'الأمر dotnet publish', 'https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-publish', 'Microsoft Learn', 'Reference', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (144, 'sre-postmortems', 'Postmortem culture: learning from failure', 'ثقافة المراجعات اللاحقة: التعلم من الإخفاق', 'https://sre.google/sre-book/postmortem-culture/', 'Google SRE book', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200),
  (145, 'adr', 'Architectural Decision Records', 'سجلات القرارات المعمارية', 'https://adr.github.io/', 'adr.github.io', 'Article', 'Intermediate', true, 'Verified', '2026-10-19T15:26:11.0157452', 200)
on conflict do nothing;

insert into public.resource_topics (resource_id, topic_id) values
  (1, 1),
  (3, 1),
  (1, 2),
  (2, 2),
  (4, 2),
  (2, 3),
  (5, 3),
  (2, 4),
  (6, 4),
  (7, 5),
  (1, 6),
  (8, 6),
  (9, 7),
  (10, 8),
  (11, 9),
  (12, 10),
  (13, 11),
  (14, 12),
  (15, 12),
  (14, 13),
  (14, 14),
  (14, 15),
  (16, 16),
  (16, 17),
  (17, 17),
  (17, 18),
  (17, 19),
  (18, 20),
  (19, 21),
  (20, 22),
  (21, 23),
  (22, 23),
  (21, 24),
  (21, 25),
  (22, 25),
  (23, 26),
  (24, 27),
  (25, 28),
  (26, 29),
  (27, 30),
  (28, 30),
  (29, 31),
  (38, 31),
  (39, 31),
  (47, 31),
  (28, 32),
  (29, 32),
  (30, 32),
  (47, 32),
  (31, 33),
  (31, 34),
  (49, 34),
  (32, 35),
  (33, 35),
  (34, 35),
  (28, 36),
  (36, 36),
  (35, 37),
  (36, 38),
  (37, 38),
  (40, 39),
  (41, 39),
  (42, 39),
  (43, 40),
  (44, 41),
  (45, 42),
  (46, 43),
  (39, 44),
  (39, 45),
  (64, 45),
  (39, 46),
  (39, 47),
  (48, 48),
  (49, 48),
  (66, 48),
  (77, 48),
  (48, 49),
  (50, 50),
  (65, 50),
  (51, 51),
  (66, 51),
  (52, 52),
  (53, 53),
  (66, 53),
  (54, 54),
  (55, 55),
  (56, 56),
  (57, 57),
  (63, 57),
  (58, 58),
  (59, 59),
  (61, 60),
  (60, 61),
  (61, 61),
  (51, 62),
  (65, 63),
  (67, 63),
  (68, 64),
  (57, 65),
  (69, 65),
  (69, 66),
  (70, 66),
  (63, 67),
  (71, 67),
  (58, 68),
  (69, 68),
  (62, 69),
  (73, 69),
  (62, 70),
  (72, 70),
  (73, 70),
  (59, 71),
  (75, 71),
  (76, 71),
  (74, 72),
  (77, 72),
  (60, 73),
  (75, 73),
  (64, 74),
  (62, 75),
  (78, 76),
  (79, 76),
  (86, 76),
  (79, 77),
  (85, 77),
  (80, 78),
  (86, 78),
  (81, 79),
  (82, 80),
  (82, 81),
  (83, 82),
  (87, 83),
  (87, 84),
  (88, 84),
  (84, 85),
  (89, 85),
  (84, 86),
  (90, 87),
  (91, 87),
  (111, 87),
  (91, 88),
  (92, 88),
  (91, 89),
  (93, 89),
  (94, 89),
  (95, 90),
  (96, 90),
  (97, 91),
  (97, 92),
  (98, 93),
  (99, 94),
  (100, 94),
  (101, 95),
  (102, 95),
  (104, 96),
  (105, 96),
  (103, 97),
  (104, 97),
  (96, 99),
  (106, 100),
  (108, 100),
  (108, 101),
  (107, 103),
  (101, 104),
  (116, 104),
  (113, 105),
  (114, 105),
  (115, 106),
  (116, 108),
  (100, 109),
  (41, 110),
  (102, 110),
  (135, 111),
  (45, 114),
  (102, 114),
  (58, 115),
  (117, 116),
  (118, 116),
  (119, 117),
  (120, 118),
  (120, 119),
  (121, 119),
  (109, 120),
  (109, 121),
  (110, 121),
  (119, 122),
  (117, 123),
  (119, 123),
  (122, 124),
  (126, 124),
  (131, 124),
  (122, 125),
  (123, 125),
  (122, 126),
  (124, 126),
  (125, 126),
  (124, 127),
  (128, 127),
  (131, 127),
  (127, 128),
  (136, 128),
  (126, 129),
  (132, 130),
  (129, 131),
  (130, 132),
  (134, 133),
  (133, 134),
  (134, 134),
  (135, 134),
  (136, 137),
  (137, 138),
  (34, 139),
  (138, 139),
  (139, 139),
  (135, 140),
  (140, 140),
  (141, 140),
  (44, 141),
  (141, 141),
  (115, 142),
  (145, 142),
  (112, 143),
  (142, 143),
  (143, 143),
  (144, 144)
on conflict do nothing;

insert into public.projects (id, slug, sort_order, title_en, title_ar, summary_en, summary_ar, requirements_en, requirements_ar, tech_stack, start_after_phase_id) values
  (1, 'employee-management', 1, 'Employee Management System', 'نظام إدارة الموظفين', 'A C# console application to manage employees, departments and payroll. Learn C# and OOP without the web stack getting in the way.', 'تطبيق Console بلغة C# لإدارة الموظفين والأقسام والرواتب، لتتعلم C# والبرمجة الكائنية دون تعقيدات الويب.', 'Add, list, update and delete employees from a console menu
Support salaried and hourly employees with different pay rules
Validate input and never crash on bad data
Search and report with LINQ (by department, salary range, payroll totals)
Save and load data to a JSON file asynchronously
Unit tests for payroll rules', 'إضافة الموظفين وعرضهم وتعديلهم وحذفهم من قائمة في Console
دعم الموظفين برواتب شهرية وبالساعة بقواعد دفع مختلفة
التحقق من المدخلات وعدم التوقف أبدًا بسبب بيانات خاطئة
البحث وإعداد التقارير باستخدام LINQ (حسب القسم، ونطاق الراتب، وإجماليات الرواتب)
حفظ البيانات وتحميلها من ملف JSON بشكل غير متزامن
اختبارات وحدة لقواعد الرواتب', 'C# · .NET console · LINQ · xUnit', 2),
  (2, 'inventory-api', 2, 'Inventory Management API', 'واجهة API لإدارة المخزون', 'A REST API for products, categories, suppliers and stock built with ASP.NET Core, EF Core and SQL Server.', 'واجهة REST للمنتجات والفئات والموردين والمخزون مبنية باستخدام ASP.NET Core وEF Core وSQL Server.', 'CRUD for products, categories and suppliers
Validation with clear error responses
Search, filtering, sorting and pagination
Correct HTTP status codes and consistent ProblemDetails errors
Stock adjustments that can never make stock negative
Structured logging and basic automated tests', 'عمليات CRUD للمنتجات والفئات والموردين
التحقق من البيانات مع استجابات أخطاء واضحة
البحث والتصفية والترتيب والتقسيم إلى صفحات
رموز حالة HTTP صحيحة وأخطاء ProblemDetails موحدة
تعديلات مخزون لا يمكن أن تجعل المخزون سالبًا أبدًا
تسجيل منظم واختبارات آلية أساسية', 'ASP.NET Core · EF Core · SQL Server · xUnit', 5),
  (3, 'project-dashboard', 3, 'Project Management Dashboard', 'لوحة إدارة المشاريع', 'An Angular + TypeScript app with mock data: projects, tasks, a dashboard, forms, search and pagination. Learn Angular without backend complexity.', 'تطبيق Angular وTypeScript ببيانات وهمية: مشاريع ومهام ولوحة معلومات ونماذج وبحث وتقسيم إلى صفحات، لتتعلم Angular دون تعقيدات الخلفية.', 'Project list, project detail with tasks, and a dashboard
Create and edit tasks with validated reactive forms
Update task status
Routing between screens
Search, filter, sort and paginate tasks
Reusable components, signals and RxJS where appropriate', 'قائمة المشاريع، وتفاصيل المشروع مع المهام، ولوحة معلومات
إنشاء المهام وتعديلها بنماذج تفاعلية متحقق منها
تحديث حالة المهمة
التوجيه بين الشاشات
البحث في المهام وتصفيتها وترتيبها وتقسيمها إلى صفحات
مكونات قابلة لإعادة الاستخدام وSignals وRxJS حيث يناسب', 'Angular · TypeScript · Signals · RxJS · Vitest', 8),
  (4, 'sales-order-management', 4, 'Sales and Order Management System', 'نظام إدارة المبيعات والطلبات', 'Your main portfolio project: a full-stack Angular + ASP.NET Core + EF Core + SQL Server system with realistic business rules.', 'مشروعك الرئيسي في معرض الأعمال: نظام متكامل بـ Angular وASP.NET Core وEF Core وSQL Server بقواعد عمل واقعية.', 'Customers, products, categories, orders and order items
The API calculates order totals — it never trusts totals from the browser
Orders can''t contain invalid products, and inventory is never reduced incorrectly
Order status changes are validated against the current state
Concurrent updates are detected (409 Conflict)
Search, filtering, pagination and a sales dashboard
Authentication and role-based authorization fundamentals
Logging, error handling and automated tests
No payment processing or real financial services', 'العملاء والمنتجات والفئات والطلبات وعناصر الطلبات
يحسب الـ API إجماليات الطلبات ولا يثق أبدًا بالإجماليات القادمة من المتصفح
لا يمكن أن تحتوي الطلبات على منتجات غير صالحة، ولا يُنقص المخزون بشكل خاطئ أبدًا
تُتحقق تغييرات حالة الطلب مقابل الحالة الحالية
اكتشاف التحديثات المتزامنة (409 Conflict)
البحث والتصفية والتقسيم إلى صفحات ولوحة مبيعات
أساسيات المصادقة والتفويض القائم على الأدوار
التسجيل ومعالجة الأخطاء والاختبارات الآلية
دون معالجة مدفوعات أو خدمات مالية حقيقية', 'Angular · ASP.NET Core · EF Core · SQL Server · xUnit · Vitest', 9)
on conflict do nothing;

insert into public.project_milestones (id, key, project_id, sort_order, title_en, title_ar, description_en, description_ar) values
  (1, 'p1-m1', 1, 1, 'Milestone 1 — Project setup and model', 'المرحلة 1 — إعداد المشروع والنموذج', 'Create the solution and model employees with proper encapsulation.', 'أنشئ الـ Solution ونمذج الموظفين بتغليف سليم.'),
  (2, 'p1-m2', 1, 2, 'Milestone 2 — Storage and operations', 'المرحلة 2 — التخزين والعمليات', 'Store employees behind an interface and build the console menu.', 'خزّن الموظفين خلف Interface وابنِ قائمة Console.'),
  (3, 'p1-m3', 1, 3, 'Milestone 3 — Reports and persistence', 'المرحلة 3 — التقارير والحفظ', 'Answer business questions with LINQ and save data between runs.', 'أجب عن أسئلة العمل باستخدام LINQ واحفظ البيانات بين مرات التشغيل.'),
  (4, 'p1-m4', 1, 4, 'Milestone 4 — Quality and change requests', 'المرحلة 4 — الجودة وطلبات التغيير', 'Test the rules, document the project and handle stakeholder change requests.', 'اختبر القواعد، ووثّق المشروع، وتعامل مع طلبات التغيير من أصحاب المصلحة.'),
  (5, 'p2-m1', 2, 1, 'Milestone 1 — Data model', 'المرحلة 1 — نموذج البيانات', 'Design the entities and relationships and create the database with migrations.', 'صمّم الكيانات والعلاقات وأنشئ قاعدة البيانات باستخدام الـ Migrations.'),
  (6, 'p2-m2', 2, 2, 'Milestone 2 — CRUD endpoints', 'المرحلة 2 — نقاط نهاية CRUD', 'Expose the data through a clean, validated REST API.', 'اكشف البيانات عبر واجهة REST نظيفة ومتحقق منها.'),
  (7, 'p2-m3', 2, 3, 'Milestone 3 — Query features', 'المرحلة 3 — ميزات الاستعلام', 'Make the product list usable and fast with real-world data volumes.', 'اجعل قائمة المنتجات قابلة للاستخدام وسريعة مع أحجام بيانات واقعية.'),
  (8, 'p2-m4', 2, 4, 'Milestone 4 — Production readiness', 'المرحلة 4 — الجاهزية للإنتاج', 'Logging, tests, documentation — and stakeholder change requests.', 'التسجيل والاختبارات والتوثيق، إضافة إلى طلبات التغيير من أصحاب المصلحة.'),
  (9, 'p3-m1', 3, 1, 'Milestone 1 — Setup and models', 'المرحلة 1 — الإعداد والنماذج', 'Create the app, its structure and a mock data service.', 'أنشئ التطبيق وهيكله وخدمة بيانات وهمية.'),
  (10, 'p3-m2', 3, 2, 'Milestone 2 — Screens and routing', 'المرحلة 2 — الشاشات والتوجيه', 'Build the main screens and navigation.', 'ابنِ الشاشات الرئيسية والتنقل.'),
  (11, 'p3-m3', 3, 3, 'Milestone 3 — Forms and lists', 'المرحلة 3 — النماذج والقوائم', 'Create and edit tasks, and make large lists manageable.', 'أنشئ المهام وعدّلها، واجعل القوائم الكبيرة سهلة الإدارة.'),
  (12, 'p3-m4', 3, 4, 'Milestone 4 — Quality and change requests', 'المرحلة 4 — الجودة وطلبات التغيير', 'Tests, documentation and stakeholder change requests.', 'الاختبارات والتوثيق وطلبات التغيير من أصحاب المصلحة.'),
  (13, 'p4-m1', 4, 1, 'Milestone 1 — Domain and database', 'المرحلة 1 — المجال وقاعدة البيانات', 'Model the sales domain and create a well-constrained SQL Server schema.', 'نمذج مجال المبيعات وأنشئ مخطط SQL Server بقيود سليمة.'),
  (14, 'p4-m2', 4, 2, 'Milestone 2 — Ordering API and business rules', 'المرحلة 2 — واجهة الطلبات وقواعد العمل', 'The heart of the system: placing and managing orders safely.', 'قلب النظام: تقديم الطلبات وإدارتها بأمان.'),
  (15, 'p4-m3', 4, 3, 'Milestone 3 — Angular UI', 'المرحلة 3 — واجهة Angular', 'A clean, responsive frontend for daily sales work.', 'واجهة نظيفة ومتجاوبة للعمل اليومي في المبيعات.'),
  (16, 'p4-m4', 4, 4, 'Milestone 4 — Security, testing and polish', 'المرحلة 4 — الأمان والاختبار والصقل', 'Make it trustworthy and presentable — then handle change requests.', 'اجعله جديرًا بالثقة وقابلًا للعرض، ثم تعامل مع طلبات التغيير.')
on conflict do nothing;

insert into public.project_tasks (id, key, milestone_id, sort_order, title_en, title_ar, description_en, description_ar, acceptance_criteria_en, acceptance_criteria_ar, estimated_minutes, priority, is_change_request, unlock_at_percent) values
  (1, 'p1-t1', 1, 1, 'Create the solution and console project', 'إنشاء الـ Solution ومشروع Console', 'Create EmployeeManagement.sln with a console app and a class library for the domain, and initialise Git.', 'أنشئ EmployeeManagement.sln يحتوي على تطبيق Console ومكتبة Class Library للمجال، وهيّئ Git.', 'dotnet build succeeds
The console app references the library
A .gitignore excludes bin/ and obj/', 'ينجح الأمر dotnet build
يشير تطبيق Console إلى المكتبة
يستثني ملف .gitignore المجلدين bin/ وobj/', 30, 'High', false, 0),
  (2, 'p1-t2', 1, 2, 'Define the Employee class', 'تعريف الـ Class الخاص بالموظف', 'Employee has Id, FullName, Email, Department and a constructor that rejects invalid values.', 'يحتوي Employee على Id وFullName وEmail وDepartment ومُنشئ يرفض القيم غير الصالحة.', 'Properties can''t be set to invalid values from outside
Invalid email or empty name throws ArgumentException', 'لا يمكن ضبط الخصائص على قيم غير صالحة من الخارج
البريد غير الصالح أو الاسم الفارغ يرمي ArgumentException', 45, 'High', false, 0),
  (3, 'p1-t3', 1, 3, 'Salaried and hourly employees', 'موظفون برواتب شهرية وبالساعة', 'Make Employee abstract with CalculateMonthlyPay(), implemented by SalariedEmployee and HourlyEmployee.', 'اجعل Employee مجردًا مع الدالة CalculateMonthlyPay()، ونفّذها في SalariedEmployee وHourlyEmployee.', 'Payroll code never checks the concrete type
Hourly pay = rate × hours, overtime above 160h at 1.5×', 'كود الرواتب لا يتحقق من النوع الفعلي أبدًا
أجر الساعة = المعدل × الساعات، والعمل الإضافي فوق 160 ساعة بمعامل 1.5', 60, 'Medium', false, 0),
  (4, 'p1-t4', 2, 1, 'IEmployeeRepository with an in-memory implementation', 'الواجهة IEmployeeRepository مع تطبيق في الذاكرة', 'Define Add, GetById, GetAll, Update and Delete, and implement them with a Dictionary<int, Employee>.', 'عرّف Add وGetById وGetAll وUpdate وDelete، ونفّذها باستخدام Dictionary<int, Employee>.', 'GetById is O(1)
The console code depends only on the interface', 'تعمل GetById في O(1)
يعتمد كود Console على الـ Interface فقط', 60, 'High', false, 0),
  (5, 'p1-t5', 2, 2, 'Console menu: add, list, update, delete', 'قائمة Console: إضافة وعرض وتعديل وحذف', 'A loop shows a menu, reads the choice and calls small methods for each operation.', 'حلقة تعرض قائمة، وتقرأ الاختيار، وتستدعي دوالًا صغيرة لكل عملية.', 'Each menu option is a separate method
Choosing 0 exits cleanly', 'كل خيار في القائمة دالة منفصلة
اختيار 0 يخرج من البرنامج بشكل سليم', 60, 'High', false, 0),
  (6, 'p1-t6', 2, 3, 'Input validation and error handling', 'التحقق من المدخلات ومعالجة الأخطاء', 'Use TryParse for numbers, show friendly messages and handle ''employee not found''.', 'استخدم TryParse للأرقام، واعرض رسائل ودية، وتعامل مع حالة عدم وجود الموظف.', 'Typing letters for a salary never crashes the app
Nullable warnings: zero', 'كتابة حروف في حقل الراتب لا توقف التطبيق أبدًا
عدد تحذيرات Nullable: صفر', 45, 'Medium', false, 0),
  (7, 'p1-t7', 3, 1, 'Search and filter employees', 'البحث عن الموظفين وتصفيتهم', 'Search by name (case-insensitive), filter by department and salary range, sort by name or pay.', 'ابحث بالاسم (دون تمييز حالة الأحرف)، وصفِّ حسب القسم ونطاق الراتب، ورتّب حسب الاسم أو الأجر.', 'Implemented with LINQ, no manual loops
Filters can be combined', 'مُنفّذ باستخدام LINQ دون حلقات يدوية
يمكن الجمع بين المرشحات', 45, 'High', false, 0),
  (8, 'p1-t8', 3, 2, 'Payroll and department reports', 'تقارير الرواتب والأقسام', 'Total payroll per department, average pay, headcount, and the top 3 earners per department.', 'إجمالي الرواتب لكل قسم، ومتوسط الأجر، وعدد الموظفين، وأعلى 3 أجورًا في كل قسم.', 'Uses GroupBy with aggregation
Output is aligned in columns', 'يستخدم GroupBy مع التجميع
المخرجات منسقة في أعمدة', 60, 'High', false, 0),
  (9, 'p1-t9', 3, 3, 'Save and load data as JSON', 'حفظ البيانات وتحميلها بصيغة JSON', 'Persist employees to employees.json with System.Text.Json and async file APIs.', 'احفظ الموظفين في employees.json باستخدام System.Text.Json وواجهات الملفات غير المتزامنة.', 'Data survives restarting the app
A missing or corrupt file is handled with a clear message', 'تبقى البيانات بعد إعادة تشغيل التطبيق
يُعالَج الملف المفقود أو التالف برسالة واضحة', 60, 'Medium', false, 0),
  (10, 'p1-t10', 4, 1, 'Unit tests for payroll rules', 'اختبارات وحدة لقواعد الرواتب', 'Add an xUnit project and test pay calculations including overtime boundaries.', 'أضف مشروع xUnit واختبر حسابات الأجور بما فيها حدود العمل الإضافي.', 'At least 8 tests, all passing
Covers exactly 160 hours and 161 hours', '8 اختبارات على الأقل وكلها ناجحة
تغطي 160 ساعة بالضبط و161 ساعة', 60, 'High', false, 0),
  (11, 'p1-t11', 4, 2, 'README and repository', 'ملف README والمستودع', 'Write a README with features, a screenshot of the console and run instructions; push to GitHub.', 'اكتب README يحتوي على الميزات ولقطة شاشة من Console وتعليمات التشغيل، وارفعه إلى GitHub.', 'Someone can run it by following the README
Commit history has meaningful messages', 'يستطيع أي شخص تشغيله باتباع README
سجل الـ Commits يحتوي على رسائل ذات معنى', 30, 'Medium', false, 0),
  (12, 'p1-cr1', 4, 3, 'Change request: add hire date and years of service', 'طلب تغيير: إضافة تاريخ التعيين وسنوات الخدمة', 'HR wants a HireDate on every employee and a report of years of service per department. Existing JSON files must still load.', 'تريد الموارد البشرية حقل HireDate لكل موظف وتقريرًا بسنوات الخدمة لكل قسم، ويجب أن تظل ملفات JSON الحالية قابلة للتحميل.', 'Old employees.json files load without errors
Report shows average years of service per department', 'تُحمَّل ملفات employees.json القديمة دون أخطاء
يعرض التقرير متوسط سنوات الخدمة لكل قسم', 45, 'Medium', true, 40),
  (13, 'p1-cr2', 4, 4, 'Change request: prevent duplicate emails', 'طلب تغيير: منع تكرار البريد الإلكتروني', 'Two employees were created with the same email. Make emails unique (case-insensitive) on add and update.', 'تم إنشاء موظفين بالبريد الإلكتروني نفسه. اجعل البريد فريدًا (دون تمييز حالة الأحرف) عند الإضافة والتعديل.', 'Adding ''Sara@x.com'' when ''sara@x.com'' exists is refused
A test covers the rule', 'يُرفض إضافة Sara@x.com إذا كان sara@x.com موجودًا
يوجد اختبار يغطي القاعدة', 30, 'High', true, 60),
  (14, 'p1-cr3', 4, 5, 'Change request: export payroll to CSV', 'طلب تغيير: تصدير الرواتب إلى CSV', 'Finance needs the monthly payroll as a CSV file they can open in Excel.', 'يحتاج قسم المالية إلى كشف الرواتب الشهري كملف CSV يمكن فتحه في Excel.', 'Values containing commas are quoted correctly
Decimal separator is consistent (invariant culture)', 'القيم التي تحتوي على فواصل توضع بين علامات اقتباس بشكل صحيح
فاصل الكسور العشرية ثابت (Invariant culture)', 40, 'Low', true, 80),
  (15, 'p2-t1', 5, 1, 'Create the Web API project', 'إنشاء مشروع Web API', 'Create Inventory.Api (controllers) and Inventory.Api.Tests in one solution.', 'أنشئ Inventory.Api (بوحدات تحكم) وInventory.Api.Tests في Solution واحدة.', 'dotnet run starts the API
The OpenAPI document is reachable in Development', 'يشغّل الأمر dotnet run الـ API
وثيقة OpenAPI متاحة في بيئة التطوير', 30, 'High', false, 0),
  (16, 'p2-t2', 5, 2, 'Define Product, Category and Supplier entities', 'تعريف كيانات Product وCategory وSupplier', 'Product: Name, Sku, Price, Stock, CategoryId. Category: Name. Supplier: Name, Email.', 'Product: الاسم وSku والسعر والمخزون وCategoryId. وCategory: الاسم. وSupplier: الاسم والبريد.', 'Max lengths and decimal(18,2) configured
Sku has a unique index', 'الأطوال القصوى وdecimal(18,2) مضبوطة
يوجد فهرس فريد على Sku', 45, 'High', false, 0),
  (17, 'p2-t3', 5, 3, 'Configure relationships', 'ضبط العلاقات', 'Product → Category (many-to-one) and Product ↔ Supplier (many-to-many with SupplierPrice).', 'العلاقة Product → Category (متعدد-إلى-واحد)، والعلاقة Product ↔ Supplier (متعدد-إلى-متعدد مع SupplierPrice).', 'Deleting a category with products is refused
Join entity has a composite key', 'يُرفض حذف فئة تحتوي على منتجات
كيان الربط له مفتاح مركب', 45, 'High', false, 0),
  (18, 'p2-t4', 5, 4, 'Configure DbContext and connection string', 'ضبط DbContext وسلسلة الاتصال', 'Register InventoryDbContext with a LocalDB connection string from appsettings.json.', 'سجّل InventoryDbContext بسلسلة اتصال LocalDB من appsettings.json.', 'No credentials committed
DbContext is scoped', 'لا توجد بيانات اعتماد مرفوعة
الـ DbContext بنطاق Scoped', 30, 'High', false, 0),
  (19, 'p2-t5', 5, 5, 'Create the initial migration and verify the schema', 'إنشاء الـ Migration الأولى والتحقق من المخطط', 'Generate and apply InitialCreate, then inspect tables, keys and indexes in SSMS.', 'أنشئ InitialCreate وطبّقها، ثم افحص الجداول والمفاتيح والفهارس في SSMS.', 'Schema matches your design
Foreign keys are indexed', 'المخطط يطابق تصميمك
المفاتيح الأجنبية مفهرسة', 40, 'High', false, 0),
  (20, 'p2-t6', 6, 1, 'Categories CRUD with DTOs', 'عمليات CRUD للفئات باستخدام DTOs', 'GET list, GET by id, POST, PUT and DELETE for categories, using request/response DTOs.', 'نقاط GET للقائمة وGET بالمعرف وPOST وPUT وDELETE للفئات باستخدام DTOs للطلبات والاستجابات.', 'Entities are never returned directly
POST returns 201 with Location', 'لا تُرجَع الكيانات مباشرة أبدًا
تُرجع POST الرمز 201 مع Location', 60, 'High', false, 0),
  (21, 'p2-t7', 6, 2, 'Products CRUD with validation', 'عمليات CRUD للمنتجات مع التحقق', 'Full CRUD for products with data annotations and a check that the category exists.', 'CRUD كامل للمنتجات مع Data annotations والتحقق من وجود الفئة.', 'Invalid input returns 400 with field errors
Unknown categoryId returns 400, not 500', 'المدخلات غير الصالحة تُرجع 400 مع أخطاء الحقول
المعرف categoryId غير الموجود يُرجع 400 وليس 500', 75, 'High', false, 0),
  (22, 'p2-t8', 6, 3, 'Status codes and ProblemDetails', 'رموز الحالة وProblemDetails', 'Add a global exception handler and consistent 404/409/500 responses.', 'أضف معالج استثناءات عامًا واستجابات موحدة للرموز 404/409/500.', 'No stack traces in responses
Every error response has the same shape', 'لا توجد Stack traces في الاستجابات
كل استجابات الأخطاء لها الشكل نفسه', 45, 'High', false, 0),
  (23, 'p2-t9', 6, 4, 'Stock adjustment endpoint', 'نقطة نهاية لتعديل المخزون', 'POST /api/products/{id}/stock-adjustments with a quantity (+/-) and a reason, applied atomically.', 'النقطة POST /api/products/{id}/stock-adjustments بكمية (+/-) وسبب، تُطبَّق بشكل ذري.', 'Stock can never go below zero, even with parallel requests
Insufficient stock returns 409', 'لا يمكن أن ينخفض المخزون عن الصفر أبدًا حتى مع الطلبات المتوازية
عدم كفاية المخزون يُرجع 409', 60, 'High', false, 0),
  (24, 'p2-t10', 7, 1, 'Pagination', 'التقسيم إلى صفحات', 'Return PagedResult<ProductDto> with page, pageSize (max 100) and totalCount.', 'أرجع PagedResult<ProductDto> مع page وpageSize (بحد أقصى 100) وtotalCount.', 'Deterministic order
pageSize=1000 is clamped to 100', 'ترتيب حتمي
القيمة pageSize=1000 تُقيَّد إلى 100', 40, 'High', false, 0),
  (25, 'p2-t11', 7, 2, 'Search and filtering', 'البحث والتصفية', 'Optional q (name/sku), minPrice, maxPrice and inStock filters.', 'مرشحات اختيارية: q (الاسم/Sku) وminPrice وmaxPrice وinStock.', 'All values are SQL parameters
Filters combine correctly', 'كل القيم معاملات SQL
تتجمع المرشحات بشكل صحيح', 40, 'High', false, 0),
  (26, 'p2-t12', 7, 3, 'Sorting', 'الترتيب', 'sortBy = name | price | stock with a desc flag, using an allow-list.', 'المعامل sortBy = name | price | stock مع علم desc، باستخدام قائمة مسموحة.', 'Unknown sortBy falls back to name
Tie-breaker on Id', 'القيمة غير المعروفة لـ sortBy ترجع إلى name
ترتيب ثانوي حسب Id', 30, 'Medium', false, 0),
  (27, 'p2-t13', 7, 4, 'Check the generated SQL', 'فحص SQL المولَّد', 'Enable SQL logging, confirm one query per list request and use AsNoTracking for reads.', 'فعّل تسجيل SQL، وتأكد من استعلام واحد لكل طلب قائمة، واستخدم AsNoTracking للقراءة.', 'No N+1 queries
List endpoints select only the DTO columns', 'لا توجد استعلامات N+1
نقاط نهاية القوائم تختار أعمدة الـ DTO فقط', 45, 'Medium', false, 0),
  (28, 'p2-t14', 8, 1, 'Structured logging and request timing', 'التسجيل المنظم وتوقيت الطلبات', 'Log stock changes with message templates and add a middleware that logs request duration.', 'سجّل تغييرات المخزون بقوالب الرسائل، وأضف Middleware يسجل مدة الطلب.', 'No string interpolation in log calls
Requests over 500 ms log a warning', 'لا يوجد String interpolation في استدعاءات التسجيل
الطلبات التي تتجاوز 500 مللي ثانية تسجل تحذيرًا', 40, 'Medium', false, 0),
  (29, 'p2-t15', 8, 2, 'Unit tests for stock rules', 'اختبارات وحدة لقواعد المخزون', 'Test stock adjustment rules, including the exact boundary (stock == quantity).', 'اختبر قواعد تعديل المخزون، بما فيها الحد الدقيق (المخزون == الكمية).', 'Boundaries covered
Tests run in under a second', 'الحدود مغطاة
تعمل الاختبارات في أقل من ثانية', 45, 'High', false, 0),
  (30, 'p2-t16', 8, 3, 'API tests with WebApplicationFactory', 'اختبارات API باستخدام WebApplicationFactory', 'Test 200/201/400/404/409 paths for products against a test database.', 'اختبر مسارات 200/201/400/404/409 للمنتجات على قاعدة بيانات اختبار.', 'Tests don''t touch your development database
dotnet test is green', 'لا تلمس الاختبارات قاعدة بيانات التطوير
نتيجة dotnet test ناجحة', 60, 'High', false, 0),
  (31, 'p2-t17', 8, 4, 'README with example requests', 'ملف README مع أمثلة طلبات', 'Document setup, migrations and include an .http file with example requests.', 'وثّق الإعداد والـ Migrations، وأرفق ملف .http بأمثلة طلبات.', 'Setup works on a clean machine
Every endpoint has an example', 'يعمل الإعداد على جهاز نظيف
لكل نقطة نهاية مثال', 30, 'Medium', false, 0),
  (32, 'p2-cr1', 8, 5, 'Change request: add a Barcode to products', 'طلب تغيير: إضافة باركود للمنتجات', 'The warehouse scans barcodes. Add a required, unique Barcode without breaking existing rows.', 'يمسح المستودع الباركود ضوئيًا. أضف Barcode مطلوبًا وفريدًا دون كسر الصفوف الموجودة.', 'Migration backfills existing rows
DTOs and validation updated
Existing tests still pass', 'تملأ الـ Migration الصفوف الموجودة
تم تحديث الـ DTOs والتحقق
الاختبارات الحالية لا تزال ناجحة', 45, 'Medium', true, 30),
  (33, 'p2-cr2', 8, 6, 'Change request: filter by category and supplier', 'طلب تغيير: التصفية حسب الفئة والمورد', 'Purchasing wants to see all products of a category, or supplied by a specific supplier.', 'يريد قسم المشتريات رؤية كل منتجات فئة ما، أو المنتجات التي يوردها مورد محدد.', 'categoryId and supplierId filters work together
Supporting index exists', 'يعمل المرشحان categoryId وsupplierId معًا
يوجد فهرس داعم', 30, 'Medium', true, 50),
  (34, 'p2-cr3', 8, 7, 'Change request: the product list is slow', 'طلب تغيير: قائمة المنتجات بطيئة', 'With 100,000 products the list takes 4 seconds. Find out why and fix it; document before/after timings.', 'مع 100,000 منتج تستغرق القائمة 4 ثوانٍ. اكتشف السبب وأصلحه، ووثّق الأزمنة قبل وبعد.', 'Root cause identified from SQL/plan
Response under 200 ms for page 1', 'تحديد السبب الجذري من SQL/الخطة
الاستجابة أقل من 200 مللي ثانية للصفحة الأولى', 60, 'High', true, 70),
  (35, 'p2-cr4', 8, 8, 'Change request: low-stock report', 'طلب تغيير: تقرير المخزون المنخفض', 'GET /api/reports/low-stock?threshold=10 grouped by category with counts.', 'النقطة GET /api/reports/low-stock?threshold=10 مجمّعة حسب الفئة مع الأعداد.', 'Aggregation runs in SQL
Threshold validated (1–1000)', 'يُنفَّذ التجميع في SQL
التحقق من الحد (1–1000)', 40, 'Low', true, 85),
  (36, 'p3-t1', 9, 1, 'Create the Angular app and folder structure', 'إنشاء تطبيق Angular وهيكل المجلدات', 'ng new with routing, then create core/, shared/ and features/ folders.', 'نفّذ ng new مع التوجيه، ثم أنشئ المجلدات core/ وshared/ وfeatures/.', 'ng serve runs
Structure documented in the README', 'يعمل ng serve
الهيكل موثّق في README', 30, 'High', false, 0),
  (37, 'p3-t2', 9, 2, 'TypeScript models', 'نماذج TypeScript', 'Interfaces for Project and Task; TaskStatus as a string literal union.', 'Interfaces لـ Project وTask، والحالة TaskStatus كاتحاد نصوص حرفية.', 'No ''any'' anywhere
Dates typed consistently', 'لا يوجد any في أي مكان
التواريخ محددة الأنواع بشكل متسق', 30, 'High', false, 0),
  (38, 'p3-t3', 9, 3, 'Mock data service with signals', 'خدمة بيانات وهمية باستخدام Signals', 'A ProjectStore service holding projects and tasks in signals with methods to change them.', 'خدمة ProjectStore تحمل المشاريع والمهام في Signals مع دوال لتغييرها.', 'Components never mutate arrays directly
At least 3 projects and 40 tasks of sample data', 'لا تعدّل المكونات المصفوفات مباشرة أبدًا
3 مشاريع و40 مهمة على الأقل كبيانات تجريبية', 45, 'High', false, 0),
  (39, 'p3-t4', 10, 1, 'Routes and navigation', 'المسارات والتنقل', 'Routes for /dashboard, /projects and /projects/:id, lazy-loaded, with a not-found page.', 'مسارات لـ /dashboard و/projects و/projects/:id بتحميل كسول، مع صفحة غير موجود.', 'Refreshing a detail URL works
Unknown URLs show the not-found page', 'تحديث عنوان صفحة التفاصيل يعمل
العناوين غير المعروفة تعرض صفحة غير موجود', 40, 'High', false, 0),
  (40, 'p3-t5', 10, 2, 'Project list with reusable cards', 'قائمة المشاريع ببطاقات قابلة لإعادة الاستخدام', 'A ProjectCard component with inputs for the project and an output when opened.', 'مكون ProjectCard بمدخلات للمشروع ومخرج عند فتحه.', 'ProjectCard doesn''t inject any service
Progress shown per project', 'لا يحقن ProjectCard أي خدمة
يُعرض التقدم لكل مشروع', 45, 'High', false, 0),
  (41, 'p3-t6', 10, 3, 'Task list with status updates', 'قائمة المهام مع تحديث الحالة', 'Show tasks of a project and let the user change status; the dashboard updates immediately.', 'اعرض مهام المشروع واسمح للمستخدم بتغيير الحالة، مع تحديث لوحة المعلومات فورًا.', '@for with track
Status change reflected everywhere', 'استخدام @for مع track
يظهر تغيير الحالة في كل مكان', 60, 'High', false, 0),
  (42, 'p3-t7', 10, 4, 'Dashboard with computed statistics', 'لوحة معلومات بإحصائيات محسوبة', 'Totals per status, overdue tasks and progress per project using computed().', 'الإجماليات حسب الحالة، والمهام المتأخرة، والتقدم لكل مشروع باستخدام computed().', 'No manual recalculation code
Numbers match the task list', 'لا يوجد كود إعادة حساب يدوي
الأرقام تطابق قائمة المهام', 45, 'Medium', false, 0),
  (43, 'p3-t8', 11, 1, 'Create/edit task form with validation', 'نموذج إنشاء/تعديل المهمة مع التحقق', 'One reactive form for create and edit: title (required, max 120), status, due date, assignee.', 'نموذج تفاعلي واحد للإنشاء والتعديل: العنوان (مطلوب، 120 حرفًا كحد أقصى)، والحالة، وتاريخ الاستحقاق، والمسؤول.', 'Errors shown after touch or submit
Edit mode pre-fills values', 'تظهر الأخطاء بعد لمس الحقل أو الإرسال
وضع التعديل يملأ القيم مسبقًا', 60, 'High', false, 0),
  (44, 'p3-t9', 11, 2, 'Search, filter and sort tasks', 'البحث في المهام وتصفيتها وترتيبها', 'Debounced search box, status filter and sortable columns.', 'مربع بحث مؤجَّل، ومرشح للحالة، وأعمدة قابلة للترتيب.', 'Search waits 300 ms after typing
Filters combine', 'ينتظر البحث 300 مللي ثانية بعد الكتابة
تتجمع المرشحات', 45, 'High', false, 0),
  (45, 'p3-t10', 11, 3, 'Pagination', 'التقسيم إلى صفحات', 'Paginate the task list (10/20/50 per page) and reset to page 1 when filters change.', 'قسّم قائمة المهام إلى صفحات (10/20/50 لكل صفحة) وعُد إلى الصفحة الأولى عند تغيّر المرشحات.', 'Shows ''x–y of total''
Prev/Next disabled at the edges', 'يعرض النطاق من x إلى y من الإجمالي
زرا السابق/التالي معطّلان عند الحدود', 30, 'Medium', false, 0),
  (46, 'p3-t11', 11, 4, 'Loading, empty and error states', 'حالات التحميل والفراغ والخطأ', 'Simulate latency in the mock service and add skeleton, empty and error states.', 'حاكِ التأخير في الخدمة الوهمية، وأضف حالات الهيكل والفراغ والخطأ.', 'Every list has an empty state
Errors offer a retry', 'لكل قائمة حالة فراغ
تعرض الأخطاء إعادة المحاولة', 30, 'Medium', false, 0),
  (47, 'p3-t12', 12, 1, 'Component tests', 'اختبارات المكونات', 'Test ProjectCard rendering and the task form validation.', 'اختبر عرض ProjectCard والتحقق في نموذج المهمة.', 'ng test is green
Tests assert on rendered text, not internals', 'نتيجة ng test ناجحة
تتحقق الاختبارات من النص المعروض لا التفاصيل الداخلية', 45, 'Medium', false, 0),
  (48, 'p3-t13', 12, 2, 'Service tests', 'اختبارات الخدمات', 'Test ProjectStore: adding a task, changing status and computed progress.', 'اختبر ProjectStore: إضافة مهمة، وتغيير الحالة، والتقدم المحسوب.', 'Covers at least 5 behaviours', 'تغطي 5 سلوكيات على الأقل', 30, 'Medium', false, 0),
  (49, 'p3-t14', 12, 3, 'README and screenshots', 'ملف README ولقطات الشاشة', 'Document features and add screenshots of the dashboard and task list.', 'وثّق الميزات وأضف لقطات شاشة للوحة المعلومات وقائمة المهام.', 'Screenshots in docs/screenshots
Run instructions verified', 'لقطات الشاشة في docs/screenshots
تعليمات التشغيل متحقق منها', 30, 'Medium', false, 0),
  (50, 'p3-cr1', 12, 4, 'Bug report: due date before start date is accepted', 'بلاغ خطأ: يُقبل تاريخ استحقاق قبل تاريخ البدء', 'A user saved a task due before it starts. Add a start date and a cross-field validator.', 'حفظ مستخدم مهمة يحين موعدها قبل بدئها. أضف تاريخ بدء ومتحققًا بين الحقلين.', 'The error appears on the due date field
A test reproduces the original bug', 'يظهر الخطأ على حقل تاريخ الاستحقاق
يوجد اختبار يعيد إنتاج الخطأ الأصلي', 30, 'High', true, 40),
  (51, 'p3-cr2', 12, 5, 'Change request: task priority', 'طلب تغيير: أولوية المهمة', 'Add a priority (Low/Medium/High) to tasks, show it as a badge and allow filtering by it.', 'أضف أولوية (منخفضة/متوسطة/عالية) للمهام، واعرضها كشارة، واسمح بالتصفية حسبها.', 'Existing sample data gets a default priority
Filter combines with the others', 'البيانات التجريبية الموجودة تحصل على أولوية افتراضية
يتجمع المرشح مع المرشحات الأخرى', 45, 'Medium', true, 60),
  (52, 'p3-cr3', 12, 6, 'Change request: dashboard is slow with 2,000 tasks', 'طلب تغيير: لوحة المعلومات بطيئة مع 2000 مهمة', 'Generate 2,000 tasks, profile the dashboard with DevTools and fix what makes it slow.', 'أنشئ 2000 مهمة، وحلّل أداء لوحة المعلومات بأدوات المطورين، وأصلح ما يجعلها بطيئة.', 'Profiling evidence before and after
Typing in search stays responsive', 'أدلة تحليل الأداء قبل وبعد
تبقى الكتابة في البحث سريعة الاستجابة', 60, 'Medium', true, 80),
  (53, 'p4-t1', 13, 1, 'Repository and solution structure', 'هيكل المستودع والـ Solution', 'backend/ (API + tests) and frontend/ (Angular) in one repository with a .gitignore and README skeleton.', 'المجلدان backend/ (الـ API والاختبارات) وfrontend/ (Angular) في مستودع واحد مع .gitignore وهيكل README.', 'Both apps start
Angular can call a health endpoint (CORS configured)', 'يعمل التطبيقان
يستطيع Angular استدعاء نقطة الصحة (مع ضبط CORS)', 40, 'High', false, 0),
  (54, 'p4-t2', 13, 2, 'Entities: Customer, Category, Product, Order, OrderItem', 'الكيانات: Customer وCategory وProduct وOrder وOrderItem', 'Order owns its items; OrderItem stores the unit price at the time of ordering.', 'يملك الطلب عناصره، ويخزن OrderItem سعر الوحدة وقت الطلب.', 'Changing a product price doesn''t change past orders
Relationships and delete behaviours justified', 'تغيير سعر المنتج لا يغيّر الطلبات السابقة
العلاقات وسلوك الحذف مبرّرة', 60, 'High', false, 0),
  (55, 'p4-t3', 13, 3, 'Constraints, indexes and rowversion', 'القيود والفهارس وrowversion', 'Check constraints (quantity > 0, stock >= 0), indexes for list screens and a rowversion on Order and Product.', 'قيود CHECK (الكمية > 0، والمخزون >= 0)، وفهارس لشاشات القوائم، وrowversion على Order وProduct.', 'Constraints exist in the database, not only in C#
Indexes match the planned queries', 'القيود موجودة في قاعدة البيانات وليس في C# فقط
الفهارس تطابق الاستعلامات المخططة', 45, 'High', false, 0),
  (56, 'p4-t4', 13, 4, 'Migration and demo seed data', 'الـ Migration وبيانات العرض التجريبية', 'Initial migration plus an idempotent seed of categories, products and customers.', 'Migration أولية مع تعبئة Idempotent للفئات والمنتجات والعملاء.', 'Running the seed twice creates no duplicates', 'تشغيل التعبئة مرتين لا ينشئ تكرارات', 40, 'Medium', false, 0),
  (57, 'p4-t5', 14, 1, 'Customers and products endpoints', 'نقاط نهاية العملاء والمنتجات', 'Paged, searchable and sortable list endpoints plus CRUD for customers and products.', 'نقاط قوائم مقسّمة إلى صفحات وقابلة للبحث والترتيب، مع CRUD للعملاء والمنتجات.', 'PagedResult contract shared with Angular
Projection to DTOs', 'عقد PagedResult مشترك مع Angular
التحويل إلى DTOs', 60, 'High', false, 0),
  (58, 'p4-t6', 14, 2, 'Place order with server-calculated totals', 'تقديم الطلب مع إجماليات يحسبها الخادم', 'POST /api/orders receives customerId and lines (productId, quantity) only; prices and totals come from the database.', 'تستقبل POST /api/orders المعرف customerId والأسطر (productId وquantity) فقط، وتأتي الأسعار والإجماليات من قاعدة البيانات.', 'Unknown or inactive product → 400 with the line index
Any ''total'' sent by the client is ignored
Duplicate product lines are merged or rejected consistently', 'المنتج غير الموجود أو غير النشط ← 400 مع رقم السطر
يُتجاهل أي إجمالي يرسله العميل
تُدمج أسطر المنتجات المكررة أو تُرفض بشكل متسق', 90, 'High', false, 0),
  (59, 'p4-t7', 14, 3, 'Inventory reduction in the same transaction', 'خفض المخزون في المعاملة نفسها', 'Placing an order reduces stock atomically; if any line lacks stock, nothing is saved.', 'يُنقص تقديم الطلب المخزون بشكل ذري، وإذا نقص المخزون في أي سطر لا يُحفظ شيء.', 'Out of stock → 409 ''out_of_stock'' and no partial order
Parallel orders can''t oversell', 'نفاد المخزون ← 409 بالرمز out_of_stock دون طلب جزئي
الطلبات المتوازية لا تبيع أكثر من المتاح', 60, 'High', false, 0),
  (60, 'p4-t8', 14, 4, 'Order status transitions', 'انتقالات حالة الطلب', 'Draft → Submitted → Shipped → Delivered, and Submitted → Cancelled. Invalid transitions return 409.', 'Draft ← Submitted ← Shipped ← Delivered، وSubmitted ← Cancelled. والانتقالات غير الصالحة تُرجع 409.', 'Rule lives in one place and is unit-tested
The API returns allowed next statuses for the UI', 'القاعدة في مكان واحد ومختبرة باختبارات وحدة
يُرجع الـ API الحالات التالية المسموحة للواجهة', 45, 'High', false, 0),
  (61, 'p4-t9', 14, 5, 'Detect concurrent updates', 'اكتشاف التحديثات المتزامنة', 'Order updates require the rowVersion the client saw; stale updates return 409 ''concurrency_conflict''.', 'تتطلب تحديثات الطلب قيمة rowVersion التي رآها العميل، والتحديثات القديمة تُرجع 409 بالرمز concurrency_conflict.', 'Two-tab scenario demonstrated
Integration test asserts the 409', 'سيناريو التبويبين مُثبت
اختبار تكامل يتحقق من 409', 45, 'Medium', false, 0),
  (62, 'p4-t10', 15, 1, 'App shell, routing and API services', 'هيكل التطبيق والتوجيه وخدمات الـ API', 'Sidebar layout, lazy routes for customers, products, orders and dashboard, and typed API services.', 'تخطيط بشريط جانبي، ومسارات كسولة للعملاء والمنتجات والطلبات ولوحة المعلومات، وخدمات API محددة الأنواع.', 'No HttpClient calls inside components
Base URL configured in one place', 'لا توجد استدعاءات HttpClient داخل المكونات
العنوان الأساسي مضبوط في مكان واحد', 60, 'High', false, 0),
  (63, 'p4-t11', 15, 2, 'Products and customers tables', 'جداول المنتجات والعملاء', 'Server-side search, filters and paging with create/edit forms and delete confirmation.', 'بحث وتصفية وتقسيم إلى صفحات على الخادم، مع نماذج إنشاء/تعديل وتأكيد للحذف.', 'Filters in the URL
Deleting the last row of a page behaves correctly', 'المرشحات في العنوان
حذف آخر صف في صفحة يتصرف بشكل صحيح', 75, 'High', false, 0),
  (64, 'p4-t12', 15, 3, 'Order form with dynamic lines', 'نموذج الطلب بأسطر ديناميكية', 'FormArray of lines, product picker, quantity validation and a display-only estimated total.', 'FormArray للأسطر، ومنتقي المنتجات، والتحقق من الكمية، وإجمالي تقديري للعرض فقط.', 'Server validation errors shown on the right line
The saved total shown comes from the API response', 'تظهر أخطاء تحقق الخادم على السطر الصحيح
الإجمالي المحفوظ المعروض يأتي من استجابة الـ API', 90, 'High', false, 0),
  (65, 'p4-t13', 15, 4, 'Error handling and loading states', 'معالجة الأخطاء وحالات التحميل', 'An HTTP error interceptor, toasts for 409/5xx, offline detection and loading skeletons.', 'Interceptor لأخطاء HTTP، وتنبيهات للرموز 409/5xx، واكتشاف انقطاع الاتصال، وهياكل التحميل.', 'Stopping the API shows a friendly message
Double-submitting an order is impossible', 'إيقاف الـ API يعرض رسالة ودية
يستحيل إرسال الطلب مرتين', 45, 'Medium', false, 0),
  (66, 'p4-t14', 15, 5, 'Sales dashboard', 'لوحة المبيعات', 'Revenue by month, top products and orders by status, aggregated on the server.', 'الإيرادات حسب الشهر، وأفضل المنتجات، والطلبات حسب الحالة، مجمّعة على الخادم.', 'One request per widget at most
Aggregation runs in SQL', 'طلب واحد لكل عنصر كحد أقصى
يُنفَّذ التجميع في SQL', 75, 'Medium', false, 0),
  (67, 'p4-t15', 16, 1, 'Authentication with a demo user', 'المصادقة بمستخدم تجريبي', 'A login endpoint issuing a JWT for seeded demo users; Angular login page, interceptor and guard.', 'نقطة نهاية لتسجيل الدخول تصدر JWT لمستخدمين تجريبيين، مع صفحة دخول وInterceptor وGuard في Angular.', 'Signing key in user secrets
Requests without a token get 401', 'مفتاح التوقيع في User secrets
الطلبات بدون رمز تحصل على 401', 90, 'High', false, 0),
  (68, 'p4-t16', 16, 2, 'Role-based authorization', 'التفويض القائم على الأدوار', 'Sales users create orders; only Managers can ship or cancel submitted orders.', 'يُنشئ مستخدمو المبيعات الطلبات، والمديرون فقط يستطيعون شحن الطلبات المقدمة أو إلغاءها.', '403 for forbidden actions
The UI hides actions the user can''t perform', '403 للإجراءات الممنوعة
تخفي الواجهة الإجراءات التي لا يستطيع المستخدم تنفيذها', 45, 'High', false, 0),
  (69, 'p4-t17', 16, 3, 'Unit tests for totals and transitions', 'اختبارات وحدة للإجماليات والانتقالات', 'Test total calculation, rounding and every status transition.', 'اختبر حساب الإجمالي والتقريب وكل انتقال للحالة.', 'All transitions covered with [Theory]
Rounding rule documented in a test name', 'كل الانتقالات مغطاة بـ [Theory]
قاعدة التقريب موثقة في اسم اختبار', 60, 'High', false, 0),
  (70, 'p4-t18', 16, 4, 'API, integration and component tests', 'اختبارات الـ API والتكامل والمكونات', 'Order endpoints via WebApplicationFactory, stock reduction integration test and order form component tests.', 'نقاط نهاية الطلبات عبر WebApplicationFactory، واختبار تكامل لخفض المخزون، واختبارات مكون نموذج الطلب.', 'dotnet test and ng test both green
Tests run without your dev database', 'نتيجتا dotnet test وng test ناجحتان
تعمل الاختبارات دون قاعدة بيانات التطوير', 75, 'High', false, 0),
  (71, 'p4-t19', 16, 5, 'Logging and diagnostics', 'التسجيل والتشخيص', 'Structured logs for order events with OrderId, traceId in error responses, and slow-request warnings.', 'سجلات منظمة لأحداث الطلبات مع OrderId، وtraceId في استجابات الأخطاء، وتحذيرات للطلبات البطيئة.', 'You can answer ''what happened to order 42?'' from the logs', 'تستطيع الإجابة عن سؤال: ماذا حدث للطلب 42؟ من السجلات', 40, 'Medium', false, 0),
  (72, 'p4-t20', 16, 6, 'README, screenshots and local publishing', 'ملف README ولقطات الشاشة والنشر المحلي', 'Complete the portfolio checklist and document how to publish the app locally.', 'أكمل قائمة تحقق معرض الأعمال، ووثّق كيفية نشر التطبيق محليًا.', 'All portfolio checklist items done
Known limitations listed honestly', 'كل بنود قائمة تحقق معرض الأعمال منجزة
القيود المعروفة مذكورة بصدق', 60, 'Medium', false, 0),
  (73, 'p4-cr1', 16, 7, 'Change request: discount codes', 'طلب تغيير: رموز الخصم', 'Marketing wants percentage discount codes with an expiry date. The server validates codes and applies the discount.', 'يريد التسويق رموز خصم بنسبة مئوية مع تاريخ انتهاء، ويتحقق الخادم من الرموز ويطبّق الخصم.', 'Expired or unknown codes → 400
Discount never makes a total negative
Existing totals tests still pass', 'الرموز المنتهية أو غير المعروفة ← 400
لا يجعل الخصم الإجمالي سالبًا أبدًا
اختبارات الإجماليات الحالية لا تزال ناجحة', 75, 'Medium', true, 30),
  (74, 'p4-cr2', 16, 8, 'Change request: restock on cancellation', 'طلب تغيير: إعادة المخزون عند الإلغاء', 'Cancelling a submitted order must return its quantities to stock; delivered orders can never be cancelled.', 'يجب أن يعيد إلغاء الطلب المقدَّم كمياته إلى المخزون، ولا يمكن إلغاء الطلبات المسلّمة أبدًا.', 'Status change and restock in one transaction
Cancelling twice doesn''t restock twice', 'تغيير الحالة وإعادة المخزون في معاملة واحدة
الإلغاء مرتين لا يعيد المخزون مرتين', 60, 'High', true, 50),
  (75, 'p4-cr3', 16, 9, 'Incident: the orders endpoint returns thousands of records', 'حادثة: نقطة نهاية الطلبات تُرجع آلاف السجلات', 'The orders page takes 6 seconds and the response is 9 MB. Investigate and fix with paging and projection.', 'تستغرق صفحة الطلبات 6 ثوانٍ وحجم الاستجابة 9 ميجابايت. حقّق وأصلح بالتقسيم إلى صفحات والتحويل.', 'Response under 50 KB per page
Number of SQL queries per request documented before/after', 'الاستجابة أقل من 50 كيلوبايت لكل صفحة
توثيق عدد استعلامات SQL لكل طلب قبل وبعد', 60, 'High', true, 60),
  (76, 'p4-cr4', 16, 10, 'Bug report: quantity error isn''t displayed', 'بلاغ خطأ: خطأ الكمية لا يظهر', 'When the API rejects a line quantity, the order form shows nothing. Find the mismatch and fix it.', 'عندما يرفض الـ API كمية سطر ما، لا يعرض نموذج الطلب شيئًا. اكتشف عدم التطابق وأصلحه.', 'Error shown next to the right line
A component test covers it', 'يظهر الخطأ بجوار السطر الصحيح
يغطيه اختبار مكون', 30, 'Medium', true, 70),
  (77, 'p4-cr5', 16, 11, 'Change request: monthly sales CSV export', 'طلب تغيير: تصدير المبيعات الشهرية إلى CSV', 'Finance needs a CSV of monthly sales per category, downloadable from the dashboard.', 'يحتاج قسم المالية إلى ملف CSV للمبيعات الشهرية لكل فئة، قابل للتنزيل من لوحة المعلومات.', 'Correct Content-Type and file name
Large months stream without loading everything in memory', 'Content-Type واسم ملف صحيحان
الأشهر الكبيرة تُرسل تدفقيًا دون تحميل كل شيء في الذاكرة', 60, 'Low', true, 85)
on conflict do nothing;

insert into public.project_task_topics (project_task_id, topic_id) values
  (1, 1),
  (15, 1),
  (5, 4),
  (5, 5),
  (5, 6),
  (4, 7),
  (13, 7),
  (6, 8),
  (9, 8),
  (13, 8),
  (7, 11),
  (2, 12),
  (2, 13),
  (3, 14),
  (3, 15),
  (4, 16),
  (54, 19),
  (6, 20),
  (12, 21),
  (60, 22),
  (74, 22),
  (7, 23),
  (8, 24),
  (12, 24),
  (14, 24),
  (35, 24),
  (66, 24),
  (77, 24),
  (9, 26),
  (14, 26),
  (15, 30),
  (31, 31),
  (20, 32),
  (18, 35),
  (20, 36),
  (35, 36),
  (21, 37),
  (58, 37),
  (73, 37),
  (22, 38),
  (60, 38),
  (22, 39),
  (28, 40),
  (28, 41),
  (71, 41),
  (67, 42),
  (68, 43),
  (24, 45),
  (57, 45),
  (75, 45),
  (25, 46),
  (33, 46),
  (57, 46),
  (26, 47),
  (57, 47),
  (18, 48),
  (16, 49),
  (16, 50),
  (54, 50),
  (55, 50),
  (19, 51),
  (32, 51),
  (56, 51),
  (17, 52),
  (54, 52),
  (20, 53),
  (21, 53),
  (27, 54),
  (23, 57),
  (58, 57),
  (59, 57),
  (74, 57),
  (55, 58),
  (61, 58),
  (27, 59),
  (27, 60),
  (75, 60),
  (34, 61),
  (75, 61),
  (32, 62),
  (56, 62),
  (19, 63),
  (33, 63),
  (55, 63),
  (34, 64),
  (23, 68),
  (59, 68),
  (66, 75),
  (77, 75),
  (37, 76),
  (37, 77),
  (51, 77),
  (36, 87),
  (40, 88),
  (41, 89),
  (52, 89),
  (40, 90),
  (38, 91),
  (39, 93),
  (62, 93),
  (43, 94),
  (50, 94),
  (64, 94),
  (62, 95),
  (44, 96),
  (38, 97),
  (42, 97),
  (52, 97),
  (46, 98),
  (41, 99),
  (46, 100),
  (63, 101),
  (44, 102),
  (45, 102),
  (51, 102),
  (36, 103),
  (53, 104),
  (62, 104),
  (58, 106),
  (64, 109),
  (76, 109),
  (65, 110),
  (65, 111),
  (63, 112),
  (63, 113),
  (67, 114),
  (61, 115),
  (10, 116),
  (29, 116),
  (69, 116),
  (10, 117),
  (29, 117),
  (69, 117),
  (73, 117),
  (30, 118),
  (70, 118),
  (30, 119),
  (70, 119),
  (47, 120),
  (70, 120),
  (48, 121),
  (1, 124),
  (11, 129),
  (53, 130),
  (11, 131),
  (31, 131),
  (49, 131),
  (72, 131),
  (72, 132),
  (50, 134),
  (76, 134),
  (52, 140),
  (71, 141),
  (72, 143)
on conflict do nothing;

insert into public.portfolio_checklist_items (id, key, sort_order, title_en, title_ar, description_en, description_ar) values
  (1, 'readme', 1, 'Clear README', 'ملف README واضح', 'A one-line summary of what the project does and who it is for.', 'ملخص من سطر واحد لما يفعله المشروع ولمن هو.'),
  (2, 'setup', 2, 'Setup instructions', 'تعليمات الإعداد', 'Prerequisites and commands that work on a clean machine.', 'المتطلبات والأوامر التي تعمل على جهاز نظيف.'),
  (3, 'screenshots', 3, 'Screenshots', 'لقطات الشاشة', 'Two or three screenshots (or a short GIF) of the main screens.', 'لقطتان أو ثلاث (أو صورة متحركة قصيرة) للشاشات الرئيسية.'),
  (4, 'features', 4, 'Feature list', 'قائمة الميزات', 'What a user can do, in plain language.', 'ما يستطيع المستخدم فعله بلغة بسيطة.'),
  (5, 'architecture', 5, 'Architecture summary', 'ملخص البنية', 'Layers, main folders and key design decisions.', 'الطبقات والمجلدات الرئيسية وقرارات التصميم الأساسية.'),
  (6, 'database', 6, 'Database setup', 'إعداد قاعدة البيانات', 'How to create the database, apply migrations and seed data.', 'كيفية إنشاء قاعدة البيانات وتطبيق الـ Migrations وتعبئة البيانات.'),
  (7, 'api-examples', 7, 'Example API requests', 'أمثلة طلبات API', 'An .http file or curl examples for the main endpoints.', 'ملف .http أو أمثلة curl لنقاط النهاية الرئيسية.'),
  (8, 'testing', 8, 'Testing instructions', 'تعليمات الاختبار', 'How to run the tests — and they pass.', 'كيفية تشغيل الاختبارات، وأنها ناجحة.'),
  (9, 'limitations', 9, 'Known limitations', 'القيود المعروفة', 'An honest list of what''s missing or simplified.', 'قائمة صادقة بما هو ناقص أو مبسّط.')
on conflict do nothing;

insert into public.practice_exercises (id, key, type, topic_id, difficulty, estimated_minutes, title_en, title_ar, problem_en, problem_ar, code, code_language, expected_outcome_en, expected_outcome_ar, hints_en, hints_ar, solution_en, solution_ar, solution_code) values
  (1, 'code-linq-transform', 'Coding', 23, 'Beginner', 15, 'Transform a list with LINQ', 'تحويل قائمة باستخدام LINQ', 'Given a list of employees, return the names (upper-case) of active employees in the ''Sales'' department earning more than 10,000, sorted by salary descending.', 'لديك قائمة موظفين: أرجع أسماء (بأحرف كبيرة) الموظفين النشطين في قسم Sales الذين يتقاضون أكثر من 10,000، مرتبة تنازليًا حسب الراتب.', 'public record Employee(string Name, string Department, decimal Salary, bool IsActive);

List<Employee> employees =
[
    new("Sara", "Sales", 14_000m, true),
    new("Omar", "Sales", 18_000m, true),
    new("Lina", "IT", 20_000m, true),
    new("Ali", "Sales", 9_000m, true),
    new("Huda", "Sales", 16_000m, false),
];

// TODO: names (upper-case) of active Sales employees earning > 10,000, highest salary first
List<string> result = /* your LINQ here */;', 'csharp', 'A List<string> such as ["OMAR", "SARA"] built with one LINQ method chain.', 'قائمة List<string> مثل ["OMAR", "SARA"] مبنية بسلسلة LINQ واحدة.', 'Filter first with Where, combining conditions with &&.
OrderByDescending must come before Select, while you still have the Salary.
Finish with ToList().', 'صفِّ أولًا باستخدام Where مع دمج الشروط بـ &&.
يجب أن تأتي OrderByDescending قبل Select بينما لا يزال الراتب متاحًا.
أنهِ السلسلة بـ ToList().', 'Filter, then sort, then project. Sorting after Select would lose access to Salary.', 'صفِّ ثم رتّب ثم اختر الأعمدة، فالترتيب بعد Select يفقدك الوصول إلى الراتب.', 'List<string> result = employees
    .Where(e => e.IsActive && e.Department == "Sales" && e.Salary > 10_000m)
    .OrderByDescending(e => e.Salary)
    .Select(e => e.Name.ToUpperInvariant())
    .ToList();
// ["OMAR", "SARA"]'),
  (2, 'code-linq-group-sales', 'Coding', 24, 'Intermediate', 25, 'Monthly sales per category', 'المبيعات الشهرية لكل فئة', 'Orders have Date and Lines (Category, Quantity, UnitPrice). Produce one row per (Year, Month, Category) with the total amount, ordered by year, month, then total descending.', 'للطلبات تاريخ Date وأسطر Lines (الفئة والكمية وسعر الوحدة). أنتج صفًا واحدًا لكل (سنة، شهر، فئة) مع المبلغ الإجمالي، مرتبًا حسب السنة ثم الشهر ثم الإجمالي تنازليًا.', 'public record OrderLine(string Category, int Quantity, decimal UnitPrice);
public record Order(DateTime Date, List<OrderLine> Lines);

// TODO: one row per (Year, Month, Category) with Total, ordered by Year, Month, Total desc
var report = orders /* ... */;', 'csharp', 'Rows like { Year = 2026, Month = 10, Category = "Laptops", Total = 18500 } — equivalent to GROUP BY YEAR, MONTH, Category.', 'صفوف مثل { Year = 2026, Month = 10, Category = "Laptops", Total = 18500 }، وهو ما يعادل GROUP BY YEAR, MONTH, Category.', 'Flatten orders and lines with SelectMany, keeping the order date.
Group by an anonymous type: new { o.Date.Year, o.Date.Month, l.Category }.
Sum Quantity * UnitPrice inside each group.', 'سطّح الطلبات والأسطر بـ SelectMany مع الاحتفاظ بتاريخ الطلب.
جمّع حسب نوع مجهول: new { o.Date.Year, o.Date.Month, l.Category }.
اجمع Quantity * UnitPrice داخل كل مجموعة.', 'SelectMany creates (date, line) pairs, GroupBy builds the composite key, Select projects the aggregate, and OrderBy/ThenBy/ThenByDescending sorts.', 'تُنشئ SelectMany أزواج (التاريخ، السطر)، وتبني GroupBy المفتاح المركب، وتختار Select التجميع، وترتّب OrderBy/ThenBy/ThenByDescending.', 'var report = orders
    .SelectMany(o => o.Lines, (o, l) => new { o.Date, Line = l })
    .GroupBy(x => new { x.Date.Year, x.Date.Month, x.Line.Category })
    .Select(g => new
    {
        g.Key.Year,
        g.Key.Month,
        g.Key.Category,
        Total = g.Sum(x => x.Line.Quantity * x.Line.UnitPrice)
    })
    .OrderBy(r => r.Year).ThenBy(r => r.Month).ThenByDescending(r => r.Total)
    .ToList();'),
  (3, 'code-implement-interface', 'Coding', 16, 'Beginner', 20, 'Implement a shipping calculator interface', 'تنفيذ واجهة حاسبة الشحن', 'Implement IShippingCalculator twice: StandardShipping (20 + 5 per kg) and ExpressShipping (50 + 10 per kg, free above 1,000 order total). The checkout code must work with either.', 'نفّذ IShippingCalculator مرتين: StandardShipping (20 + 5 لكل كجم) وExpressShipping (50 + 10 لكل كجم، ومجاني عند تجاوز إجمالي الطلب 1,000). ويجب أن يعمل كود الدفع مع أيٍّ منهما.', 'public interface IShippingCalculator
{
    decimal Calculate(decimal weightKg, decimal orderTotal);
}

// TODO: StandardShipping: 20 + 5 per kg
// TODO: ExpressShipping: 50 + 10 per kg, free when orderTotal > 1000

public class Checkout
{
    // TODO: receive an IShippingCalculator and use it
    public decimal Total(decimal itemsTotal, decimal weightKg) => itemsTotal;
}', 'csharp', 'Two classes implementing the interface, and a Checkout class that receives IShippingCalculator in its constructor.', 'صنفان ينفذان الـ Interface، وصنف Checkout يستقبل IShippingCalculator في مُنشئه.', 'The interface has one method: decimal Calculate(decimal weightKg, decimal orderTotal).
Checkout should not know which implementation it has.', 'للـ Interface دالة واحدة: decimal Calculate(decimal weightKg, decimal orderTotal).
يجب ألا يعرف Checkout أي تطبيق لديه.', 'Each class implements Calculate with its own rule. Checkout depends on the abstraction, so adding a third method later needs no change to Checkout (open/closed).', 'ينفذ كل صنف Calculate بقاعدته الخاصة، ويعتمد Checkout على التجريد، فإضافة طريقة ثالثة لاحقًا لا تتطلب تغيير Checkout (مبدأ المفتوح/المغلق).', 'public class StandardShipping : IShippingCalculator
{
    public decimal Calculate(decimal weightKg, decimal orderTotal) => 20m + 5m * weightKg;
}

public class ExpressShipping : IShippingCalculator
{
    public decimal Calculate(decimal weightKg, decimal orderTotal) =>
        orderTotal > 1000m ? 0m : 50m + 10m * weightKg;
}

public class Checkout(IShippingCalculator shipping)
{
    public decimal Total(decimal itemsTotal, decimal weightKg) =>
        itemsTotal + shipping.Calculate(weightKg, itemsTotal);
}

var total = new Checkout(new ExpressShipping()).Total(1200m, 3m);   // 1200'),
  (4, 'code-encapsulate-account', 'Coding', 13, 'Beginner', 20, 'Encapsulate a bank account', 'تغليف حساب بنكي', 'The starter BankAccount has a public Balance setter. Make it impossible to put the account into an invalid state: no negative deposits, no overdraft, and a read-only transaction history.', 'الصنف BankAccount المبدئي يحتوي على Setter عام للرصيد. اجعل من المستحيل وضع الحساب في حالة غير صالحة: لا إيداعات سالبة، ولا سحب على المكشوف، وسجل معاملات للقراءة فقط.', 'public class BankAccount
{
    public decimal Balance { get; set; }          // ❌ anyone can set -1,000,000
    public List<string> History { get; } = [];    // ❌ anyone can Clear() it

    public void Deposit(decimal amount) { Balance += amount; History.Add($"+{amount}"); }
    public void Withdraw(decimal amount) { Balance -= amount; History.Add($"-{amount}"); }
}', 'csharp', 'Balance has a private setter, Deposit/Withdraw validate input, and History is exposed as IReadOnlyList<string>.', 'للرصيد Setter خاص، وتتحقق Deposit/Withdraw من المدخلات، ويُكشف السجل History كـ IReadOnlyList<string>.', 'Use ''private set'' or a private field.
Throw ArgumentOutOfRangeException for amounts <= 0.
Keep a private List<string> and expose it as IReadOnlyList.', 'استخدم private set أو حقلًا خاصًا.
ارمِ ArgumentOutOfRangeException للمبالغ <= 0.
احتفظ بـ List<string> خاصة واكشفها كـ IReadOnlyList.', 'All state changes go through methods that enforce the rules, so callers can''t bypass them.', 'كل تغييرات الحالة تمر عبر دوال تفرض القواعد، فلا يستطيع المستدعون تجاوزها.', 'public class BankAccount
{
    private readonly List<string> _history = [];

    public decimal Balance { get; private set; }
    public IReadOnlyList<string> History => _history;

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Deposit must be positive.");
        Balance += amount;
        _history.Add($"+{amount}");
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Withdrawal must be positive.");
        if (amount > Balance) throw new InvalidOperationException("Insufficient funds.");
        Balance -= amount;
        _history.Add($"-{amount}");
    }
}'),
  (5, 'code-validate-request', 'Coding', 37, 'Intermediate', 20, 'Validate an API request', 'التحقق من طلب API', 'Add validation to CreateProductRequest: Name required (max 100), Price between 0.01 and 1,000,000, Stock >= 0, and DiscountPrice (optional) lower than Price.', 'أضف التحقق إلى CreateProductRequest: الاسم مطلوب (100 حرف كحد أقصى)، والسعر بين 0.01 و1,000,000، والمخزون >= 0، والسعر المخفض (اختياري) أقل من السعر.', 'public record CreateProductRequest(
    string? Name,
    decimal Price,
    int Stock,
    decimal? DiscountPrice);

// TODO: add validation so invalid requests return 400 with field errors', 'csharp', 'Invalid requests return 400 with field-level errors before the action runs.', 'تُرجع الطلبات غير الصالحة 400 مع أخطاء على مستوى الحقول قبل تنفيذ الإجراء.', 'Use [Required] etc. on record parameters.
Cross-field rules belong in IValidatableObject.Validate.
[ApiController] returns the 400 automatically.', 'استخدم [Required] وما شابهها على معاملات الـ Record.
قواعد ما بين الحقول مكانها IValidatableObject.Validate.
تُرجع [ApiController] الرمز 400 تلقائيًا.', 'Data annotations cover single fields; IValidatableObject covers the DiscountPrice < Price rule and names the field so the UI can show the message in the right place.', 'تغطي Data annotations الحقول المفردة، وتغطي IValidatableObject قاعدة DiscountPrice < Price وتسمّي الحقل لتعرض الواجهة الرسالة في المكان الصحيح.', 'public record CreateProductRequest(
    [Required, MaxLength(100)] string? Name,
    [Range(0.01, 1_000_000)] decimal Price,
    [Range(0, int.MaxValue)] int Stock,
    decimal? DiscountPrice) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (DiscountPrice is { } discount && discount >= Price)
            yield return new ValidationResult(
                "Discount price must be lower than the price.",
                [nameof(DiscountPrice)]);
    }
}'),
  (6, 'code-paged-query', 'Coding', 45, 'Intermediate', 25, 'Write a paged query', 'كتابة استعلام مقسّم إلى صفحات', 'Implement ListAsync(page, pageSize) returning PagedResult<ProductDto>. Clamp pageSize to 1–100, page >= 1, sort deterministically and count the total.', 'نفّذ ListAsync(page, pageSize) التي تُرجع PagedResult<ProductDto>. قيّد pageSize بين 1 و100، وpage >= 1، ورتّب بشكل حتمي، واحسب الإجمالي.', 'public record ProductDto(int Id, string Name, decimal Price);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public async Task<PagedResult<ProductDto>> ListAsync(int page, int pageSize, CancellationToken ct)
{
    // TODO
    throw new NotImplementedException();
}', 'csharp', 'Two SQL queries (COUNT and a page with OFFSET/FETCH) and no tracking.', 'استعلاما SQL (COUNT وصفحة باستخدام OFFSET/FETCH) دون تتبع.', 'Math.Clamp is your friend.
OrderBy before Skip/Take, with ThenBy(p => p.Id) as tie-breaker.
Project to the DTO with Select before ToListAsync.', 'الدالة Math.Clamp صديقتك.
ضع OrderBy قبل Skip/Take مع ThenBy(p => p.Id) كترتيب ثانوي.
حوّل إلى الـ DTO بـ Select قبل ToListAsync.', 'Clamp inputs, count, then OrderBy/ThenBy, Skip, Take and Select. The tie-breaker makes pages stable.', 'قيّد المدخلات، واحسب العدد، ثم OrderBy/ThenBy وSkip وTake وSelect، والترتيب الثانوي يجعل الصفحات مستقرة.', 'public async Task<PagedResult<ProductDto>> ListAsync(int page, int pageSize, CancellationToken ct)
{
    page = Math.Max(1, page);
    pageSize = Math.Clamp(pageSize, 1, 100);

    var query = db.Products.AsNoTracking();
    var total = await query.CountAsync(ct);

    var items = await query
        .OrderBy(p => p.Name).ThenBy(p => p.Id)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .ToListAsync(ct);

    return new PagedResult<ProductDto>(items, page, pageSize, total);
}'),
  (7, 'code-ts-dto-types', 'Coding', 77, 'Beginner', 15, 'Create TypeScript types for an API', 'إنشاء أنواع TypeScript لواجهة API', 'Write TypeScript types matching this C# contract: record OrderDto(int Id, DateTime CreatedAt, OrderStatus Status, decimal Total, List<OrderLineDto> Lines) where OrderStatus is serialised as a string. Also derive a CreateOrderRequest without Id, CreatedAt, Status or Total.', 'اكتب أنواع TypeScript تطابق عقد C# التالي: record OrderDto(int Id, DateTime CreatedAt, OrderStatus Status, decimal Total, List<OrderLineDto> Lines) حيث تُرسل OrderStatus كنص. واشتق أيضًا CreateOrderRequest دون Id وCreatedAt وStatus وTotal.', '// C# contract (JSON uses camelCase and string enums)
public enum OrderStatus { Draft, Submitted, Shipped, Delivered, Cancelled }
public record OrderLineDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice);
public record OrderDto(int Id, DateTime CreatedAt, OrderStatus Status, decimal Total, List<OrderLineDto> Lines);', 'csharp', 'camelCase interfaces, a string-literal union for status, and a derived request type using Omit or Pick.', 'Interfaces بصيغة camelCase، واتحاد نصوص حرفية للحالة، ونوع طلب مشتق باستخدام Omit أو Pick.', 'DateTime becomes string (ISO 8601) in JSON.
decimal and int both become number.
Omit<OrderDto, ''id'' | ''createdAt'' | ''status'' | ''total''>', 'يتحول DateTime إلى string (بصيغة ISO 8601) في JSON.
يتحول كل من decimal وint إلى number.
استخدم Omit<OrderDto, ''id'' | ''createdAt'' | ''status'' | ''total''>', 'Mirror the JSON shape, not the C# types. Deriving the request type keeps both in sync when fields change.', 'اعكس شكل JSON لا أنواع C#، واشتقاق نوع الطلب يبقيهما متزامنين عند تغيّر الحقول.', 'export type OrderStatus = ''Draft'' | ''Submitted'' | ''Shipped'' | ''Delivered'' | ''Cancelled'';

export interface OrderLineDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  id: number;
  createdAt: string;      // ISO 8601
  status: OrderStatus;
  total: number;
  lines: OrderLineDto[];
}

export type CreateOrderRequest = Omit<OrderDto, ''id'' | ''createdAt'' | ''status'' | ''total'' | ''lines''> & {
  lines: Pick<OrderLineDto, ''productId'' | ''quantity''>[];   // the server looks up names and prices
};'),
  (8, 'code-ts-load-state', 'Coding', 86, 'Intermediate', 20, 'Model a request state with a discriminated union', 'نمذجة حالة الطلب باتحاد مميَّز', 'Create a LoadState<T> type with ''idle'', ''loading'', ''error'' (message) and ''ready'' (data) cases, and a describe() function the compiler forces to handle every case.', 'أنشئ نوعًا LoadState<T> بحالات idle وloading وerror (مع رسالة) وready (مع بيانات)، ودالة describe() يُجبرها المترجم على معالجة كل الحالات.', '// TODO: LoadState<T> with idle | loading | error(message) | ready(data)
// TODO: describe(state) handles every case; adding a case without handling it must not compile', 'typescript', 'Adding a new case without handling it causes a compile error.', 'إضافة حالة جديدة دون معالجتها تسبب خطأ ترجمة.', 'Use a ''kind'' property as the discriminant.
In the default branch assign the value to a variable of type never.', 'استخدم الخاصية kind كعنصر مميِّز.
في الفرع الافتراضي أسند القيمة إلى متغير من النوع never.', 'switch (state.kind) narrows each branch; the never assignment is an exhaustiveness check.', 'تضيّق switch (state.kind) النوع في كل فرع، والإسناد إلى never فحص للشمولية.', 'export type LoadState<T> =
  | { kind: ''idle'' }
  | { kind: ''loading'' }
  | { kind: ''error''; message: string }
  | { kind: ''ready''; data: T };

export function describe<T>(state: LoadState<T>): string {
  switch (state.kind) {
    case ''idle'': return ''Nothing loaded yet'';
    case ''loading'': return ''Loading…'';
    case ''error'': return `Failed: ${state.message}`;
    case ''ready'': return ''Loaded'';
    default: {
      const exhaustive: never = state;   // compile error if a case is missing
      return exhaustive;
    }
  }
}'),
  (9, 'code-angular-form', 'Coding', 94, 'Intermediate', 30, 'Build an Angular reactive form', 'بناء نموذج تفاعلي في Angular', 'Build a ''New customer'' form with name (required, max 80), email (required, valid email) and phone (optional, digits only). Show errors after a field is touched and disable Save while invalid or saving.', 'ابنِ نموذج عميل جديد بالاسم (مطلوب، 80 حرفًا كحد أقصى) والبريد (مطلوب، بريد صالح) والهاتف (اختياري، أرقام فقط). اعرض الأخطاء بعد لمس الحقل، وعطّل زر الحفظ إذا كان النموذج غير صالح أو أثناء الحفظ.', '@Component({
  selector: ''app-customer-form'',
  imports: [ReactiveFormsModule],
  template: `
    <form>
      <!-- TODO: name, email, phone with validation messages -->
      <button type="submit">Save</button>
    </form>
  `,
})
export class CustomerFormComponent {
  readonly saving = signal(false);
  // TODO: form definition and submit()
}', 'typescript', 'A typed form (getRawValue() returns { name: string; email: string; phone: string }) with accessible labels and error messages.', 'نموذج محدد الأنواع (تُرجع getRawValue() القيمة { name: string; email: string; phone: string }) مع تسميات ورسائل خطأ تراعي إمكانية الوصول.', 'inject(FormBuilder).nonNullable.group({...})
Validators.pattern(/^[0-9]*$/) for the phone.
Link each error to its input with aria-describedby.', 'استخدم inject(FormBuilder).nonNullable.group({...})
استخدم Validators.pattern(/^[0-9]*$/) للهاتف.
اربط كل خطأ بحقله باستخدام aria-describedby.', 'Define the group with validators, check form.invalid on submit (markAllAsTouched), and render errors with @if when the control is touched.', 'عرّف المجموعة مع المتحققات، وافحص form.invalid عند الإرسال (markAllAsTouched)، واعرض الأخطاء بـ @if عندما يُلمس الحقل.', '@Component({
  selector: ''app-customer-form'',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="name">Name</label>
      <input id="name" formControlName="name" aria-describedby="name-error" />
      @if (form.controls.name.touched && form.controls.name.invalid) {
        <small id="name-error" class="error">Name is required (max 80 characters).</small>
      }

      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" aria-describedby="email-error" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <small id="email-error" class="error">Enter a valid email.</small>
      }

      <label for="phone">Phone (optional)</label>
      <input id="phone" inputmode="numeric" formControlName="phone" />

      <button type="submit" [disabled]="form.invalid || saving()">Save</button>
    </form>
  `,
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['''', [Validators.required, Validators.maxLength(80)]],
    email: ['''', [Validators.required, Validators.email]],
    phone: ['''', Validators.pattern(/^[0-9]*$/)],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    console.log(this.form.getRawValue());
  }
}'),
  (10, 'code-angular-signal-filter', 'Coding', 97, 'Beginner', 20, 'Filter a list with signals', 'تصفية قائمة باستخدام Signals', 'A component has a signal of products. Add a search signal and a ''only in stock'' signal, and a computed() that returns the filtered list and its count.', 'لدى مكون Signal للمنتجات. أضف Signal للبحث وSignal لخيار المتوفر فقط، وcomputed() تُرجع القائمة المُصفّاة وعددها.', 'interface Product { id: number; name: string; stock: number; }

export class ProductListComponent {
  readonly products = signal<Product[]>([
    { id: 1, name: ''Keyboard'', stock: 4 },
    { id: 2, name: ''Mouse'', stock: 0 },
    { id: 3, name: ''Monitor'', stock: 9 },
  ]);
  // TODO: search + inStockOnly signals, filtered + count computed
}', 'typescript', 'Typing or toggling updates the list immediately with no manual subscriptions.', 'الكتابة أو التبديل يحدّث القائمة فورًا دون اشتراكات يدوية.', 'computed(() => this.products().filter(...)) reads all the signals it depends on.
Normalise case with toLowerCase().', 'تقرأ computed(() => this.products().filter(...)) كل الـ Signals التي تعتمد عليها.
وحّد حالة الأحرف باستخدام toLowerCase().', 'Because computed() tracks every signal it reads, the filtered list recalculates only when products, search or inStockOnly change.', 'لأن computed() تتتبع كل Signal تقرؤه، يُعاد حساب القائمة المُصفّاة فقط عند تغيّر المنتجات أو البحث أو خيار المتوفر فقط.', 'export class ProductListComponent {
  readonly products = signal<Product[]>([/* ... */]);
  readonly search = signal('''');
  readonly inStockOnly = signal(false);

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.products().filter(p =>
      (!this.inStockOnly() || p.stock > 0) &&
      (q === '''' || p.name.toLowerCase().includes(q)));
  });

  readonly count = computed(() => this.filtered().length);
}

// Template:
// <input [value]="search()" (input)="search.set($any($event.target).value)" />
// <label><input type="checkbox" [checked]="inStockOnly()" (change)="inStockOnly.set(!inStockOnly())" /> In stock only</label>
// <p>{{ count() }} products</p>'),
  (11, 'code-async-whenall', 'Coding', 26, 'Intermediate', 20, 'Run independent async calls concurrently', 'تشغيل استدعاءات غير متزامنة مستقلة بالتوازي', 'The dashboard awaits three independent service calls one after another (each ~300 ms). Make them run concurrently and keep exceptions observable.', 'تنتظر لوحة المعلومات ثلاثة استدعاءات خدمة مستقلة واحدًا تلو الآخر (كل منها نحو 300 مللي ثانية). اجعلها تعمل بالتزامن مع إبقاء الاستثناءات قابلة للملاحظة.', 'public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct)
{
    var weather = await weatherService.GetAsync(ct);     // ~300 ms
    var rates = await currencyService.GetRatesAsync(ct); // ~300 ms
    var news = await newsService.GetHeadlinesAsync(ct);  // ~300 ms
    return new DashboardDto(weather, rates, news);       // total ~900 ms
}', 'csharp', 'Total time ≈ the slowest call (~300 ms) instead of the sum (~900 ms).', 'يصبح الزمن الإجمالي ≈ زمن أبطأ استدعاء (نحو 300 مللي ثانية) بدلًا من المجموع (نحو 900 مللي ثانية).', 'Start all tasks first, then await Task.WhenAll.
Don''t do this with the same DbContext instance — it isn''t thread-safe.', 'ابدأ كل المهام أولًا ثم انتظر Task.WhenAll.
لا تفعل ذلك مع نسخة DbContext نفسها لأنها غير آمنة مع الـ Threads.', 'Create the three tasks without awaiting, await Task.WhenAll, then read each task''s Result (safe after WhenAll). For EF Core, each concurrent query needs its own DbContext.', 'أنشئ المهام الثلاث دون انتظار، ثم انتظر Task.WhenAll، ثم اقرأ Result لكل مهمة (آمن بعد WhenAll). ومع EF Core يحتاج كل استعلام متزامن إلى DbContext خاص به.', 'public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct)
{
    // Start all three first...
    var weatherTask = weatherService.GetAsync(ct);
    var ratesTask = currencyService.GetRatesAsync(ct);
    var newsTask = newsService.GetHeadlinesAsync(ct);

    // ...then wait for all of them (~300 ms total). If any fails, the exception is thrown here.
    await Task.WhenAll(weatherTask, ratesTask, newsTask);

    return new DashboardDto(weatherTask.Result, ratesTask.Result, newsTask.Result);
}'),
  (12, 'code-pattern-transitions', 'Coding', 22, 'Intermediate', 20, 'Order status transitions with pattern matching', 'انتقالات حالة الطلب باستخدام مطابقة الأنماط', 'Write CanMove(from, to) for: Draft→Submitted, Submitted→Shipped, Submitted→Cancelled, Shipped→Delivered. Everything else is forbidden. Also write AllowedNext(from).', 'اكتب CanMove(from, to) للانتقالات: Draft→Submitted وSubmitted→Shipped وSubmitted→Cancelled وShipped→Delivered، وكل ما عداها ممنوع. واكتب أيضًا AllowedNext(from).', 'public enum OrderStatus { Draft, Submitted, Shipped, Delivered, Cancelled }

public static class OrderRules
{
    public static bool CanMove(OrderStatus from, OrderStatus to)
    {
        // TODO
        throw new NotImplementedException();
    }

    public static IReadOnlyList<OrderStatus> AllowedNext(OrderStatus from)
    {
        // TODO
        throw new NotImplementedException();
    }
}', 'csharp', 'A single tuple switch expression; AllowedNext derived from CanMove so the rule exists once.', 'تعبير switch واحد على Tuple، مع اشتقاق AllowedNext من CanMove لتكون القاعدة في مكان واحد.', '(from, to) switch { (Draft, Submitted) => true, ... _ => false }
Enum.GetValues<OrderStatus>().Where(s => CanMove(from, s))', '(from, to) switch { (Draft, Submitted) => true, ... _ => false }
Enum.GetValues<OrderStatus>().Where(s => CanMove(from, s))', 'One switch expression holds the whole rule; AllowedNext reuses it so the UI and API can never disagree.', 'يحمل تعبير switch واحد القاعدة كاملة، وتعيد AllowedNext استخدامه فلا تختلف الواجهة والـ API أبدًا.', 'public static class OrderRules
{
    public static bool CanMove(OrderStatus from, OrderStatus to) => (from, to) switch
    {
        (OrderStatus.Draft, OrderStatus.Submitted) => true,
        (OrderStatus.Submitted, OrderStatus.Shipped or OrderStatus.Cancelled) => true,
        (OrderStatus.Shipped, OrderStatus.Delivered) => true,
        _ => false
    };

    public static IReadOnlyList<OrderStatus> AllowedNext(OrderStatus from) =>
        Enum.GetValues<OrderStatus>().Where(to => CanMove(from, to)).ToList();
}'),
  (13, 'dbg-null-reference', 'Debugging', 20, 'Beginner', 15, 'NullReferenceException in the order summary', 'استثناء NullReferenceException في ملخص الطلب', 'The order summary crashes with ''Object reference not set to an instance of an object'' for some orders but not others. Find the cause and fix it without hiding the problem.', 'يتوقف ملخص الطلب مع رسالة Object reference not set to an instance of an object لبعض الطلبات دون غيرها. اكتشف السبب وأصلحه دون إخفاء المشكلة.', 'public class Order
{
    public int Id { get; set; }
    public decimal Total { get; set; }
    public Coupon Coupon { get; set; } = null!;   // guest orders have no coupon
}

public record Coupon(string Code, decimal Percent);

string Summary(Order order) =>
    $"Order #{order.Id}: {order.Total:C} (coupon {order.Coupon.Code})";   // 💥 for guest orders', 'csharp', 'Orders without a coupon print ''No coupon''; the compiler warns if someone forgets the null check again.', 'الطلبات دون قسيمة تطبع No coupon، ويحذّر المترجم إذا نسي أحد التحقق من null مجددًا.', 'Which property is null only for some orders?
Look at Coupon — guest orders don''t have one.
Make the type say the truth: Coupon? and handle it.', 'ما الخاصية التي تكون null لبعض الطلبات فقط؟
انظر إلى Coupon، فطلبات الزوار لا تحتوي عليها.
اجعل النوع يعبّر عن الحقيقة: Coupon? وتعامل معه.', 'Coupon is optional but declared as non-nullable and initialised with null!. Declare it as Coupon?, use ?. and ?? to print a fallback, and let nullable warnings guard future code.', 'القسيمة Coupon اختيارية لكنها معرّفة كغير قابلة لـ null ومهيأة بـ null!. عرّفها كـ Coupon?، واستخدم ?. و?? لطباعة قيمة بديلة، ودع تحذيرات Nullable تحمي الكود مستقبلًا.', 'public class Order
{
    public int Id { get; set; }
    public decimal Total { get; set; }
    public Coupon? Coupon { get; set; }           // the type now tells the truth
}

string Summary(Order order) =>
    $"Order #{order.Id}: {order.Total:C} ({order.Coupon?.Code ?? "No coupon"})";'),
  (14, 'dbg-linq-average', 'Debugging', 24, 'Beginner', 15, 'Wrong average rating', 'متوسط تقييم خاطئ', 'A report shows average product ratings of 4 and 3 when the real averages are 4.5 and 3.67. Debug the LINQ query.', 'يعرض تقرير متوسط تقييمات المنتجات 4 و3 بينما المتوسطان الحقيقيان 4.5 و3.67. صحّح استعلام LINQ.', 'var averages = reviews
    .GroupBy(r => r.ProductName)
    .Select(g => new
    {
        Product = g.Key,
        Average = g.Sum(r => r.Stars) / g.Count()    // Stars is int
    })
    .ToList();
// Keyboard: 4 (expected 4.5), Mouse: 3 (expected 3.67)', 'csharp', 'Averages with decimals, rounded to 2 places.', 'متوسطات بكسور عشرية مقربة إلى منزلتين.', 'What type are Sum() and Count() returning here?
int / int in C# is integer division.', 'ما نوع القيمتين اللتين تُرجعهما Sum() وCount() هنا؟
قسمة int على int في C# قسمة صحيحة.', 'Sum(r => r.Stars) / Count() divides two ints. Use Average(r => r.Stars), which returns double, or cast before dividing; then Math.Round(..., 2).', 'التعبير Sum(r => r.Stars) / Count() يقسم عددين صحيحين. استخدم Average(r => r.Stars) التي تُرجع double، أو حوّل النوع قبل القسمة، ثم Math.Round(..., 2).', 'var averages = reviews
    .GroupBy(r => r.ProductName)
    .Select(g => new
    {
        Product = g.Key,
        Average = Math.Round(g.Average(r => r.Stars), 2)   // Average returns double
    })
    .ToList();'),
  (15, 'dbg-ef-n-plus-one', 'Debugging', 60, 'Intermediate', 25, 'Slow orders endpoint (EF Core)', 'نقطة نهاية طلبات بطيئة (EF Core)', 'GET /api/orders takes 3 seconds for 200 orders. The SQL log shows the same SELECT repeated 200 times. Find and fix the problem.', 'يستغرق GET /api/orders ثلاث ثوانٍ لـ 200 طلب، ويُظهر سجل SQL الجملة SELECT نفسها مكررة 200 مرة. اكتشف المشكلة وأصلحها.', '[HttpGet]
public async Task<List<OrderListItem>> List(CancellationToken ct)
{
    var orders = await db.Orders.OrderByDescending(o => o.CreatedAt).Take(200).ToListAsync(ct);
    var result = new List<OrderListItem>();
    foreach (var order in orders)
    {
        var customer = await db.Customers.FirstAsync(c => c.Id == order.CustomerId, ct);   // runs 200 times
        result.Add(new OrderListItem(order.Id, customer.Name, order.Total, order.CreatedAt));
    }
    return result;
}', 'csharp', 'One SQL query for the whole list, returning only the columns the DTO needs.', 'استعلام SQL واحد للقائمة كاملة يُرجع فقط الأعمدة التي يحتاجها الـ DTO.', 'Count the queries: 1 + N.
The loop calls the database once per order.
Project with Select so the JOIN happens in SQL.', 'احسب الاستعلامات: 1 + N.
الحلقة تستدعي قاعدة البيانات مرة لكل طلب.
حوّل بـ Select ليتم الربط JOIN داخل SQL.', 'Classic N+1: the customer is loaded inside the loop. Replace it with a single projection (o => new OrderListItem(o.Id, o.Customer.Name, ...)) and AsNoTracking.', 'مشكلة N+1 الكلاسيكية: يُحمَّل العميل داخل الحلقة. استبدلها بتحويل واحد (o => new OrderListItem(o.Id, o.Customer.Name, ...)) مع AsNoTracking.', '[HttpGet]
public Task<List<OrderListItem>> List(CancellationToken ct) =>
    db.Orders.AsNoTracking()
        .OrderByDescending(o => o.CreatedAt)
        .Take(200)
        .Select(o => new OrderListItem(o.Id, o.Customer.Name, o.Total, o.CreatedAt))   // one query with a JOIN
        .ToListAsync(ct);'),
  (16, 'dbg-status-codes', 'Debugging', 38, 'Beginner', 15, 'API returns 200 for a missing product', 'الـ API يُرجع 200 لمنتج غير موجود', 'The Angular page shows an empty product card instead of a ''not found'' message. The Network tab shows 200 OK with an empty body (or 204). Fix the endpoint.', 'تعرض صفحة Angular بطاقة منتج فارغة بدلًا من رسالة غير موجود، ويُظهر تبويب Network الرمز 200 OK بمحتوى فارغ (أو 204). أصلح نقطة النهاية.', '[HttpGet("{id:int}")]
public async Task<IActionResult> Get(int id, CancellationToken ct)
{
    var product = await db.Products.AsNoTracking()
        .Where(p => p.Id == id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .FirstOrDefaultAsync(ct);

    return Ok(product);   // product can be null
}', 'csharp', 'Missing products return 404 with ProblemDetails; existing ones return 200 with the DTO.', 'تُرجع المنتجات غير الموجودة 404 مع ProblemDetails، وتُرجع الموجودة 200 مع الـ DTO.', 'What does Ok(null) send?
Change the return type to ActionResult<ProductDto>.', 'ماذا يرسل Ok(null)؟
غيّر نوع القيمة المُرجعة إلى ActionResult<ProductDto>.', 'Returning a null object from an action produces 204/200 with no body. Return NotFound() when the lookup fails so clients can react correctly.', 'إرجاع كائن null من إجراء ينتج 204/200 بلا محتوى. أرجع NotFound() عند فشل البحث ليتمكن العملاء من التصرف بشكل صحيح.', '[HttpGet("{id:int}")]
public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct)
{
    var product = await db.Products.AsNoTracking()
        .Where(p => p.Id == id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .FirstOrDefaultAsync(ct);

    return product is null ? NotFound() : product;   // 404 vs 200
}'),
  (17, 'dbg-angular-form-validation', 'Debugging', 94, 'Intermediate', 20, 'Angular form submits invalid data', 'نموذج Angular يرسل بيانات غير صالحة', 'The product form lets users save an empty price, and the ''Price is required'' message never appears. Find the two bugs.', 'يسمح نموذج المنتج للمستخدمين بحفظ سعر فارغ، ولا تظهر رسالة السعر مطلوب أبدًا. اكتشف الخطأين.', '@Component({
  selector: ''app-product-form'',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" />
      <input type="number" formControlName="Price" />
      @if (form.controls.price.touched && form.controls.price.hasError(''required'')) {
        <small>Price is required</small>
      }
      <button type="submit">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  readonly form = inject(FormBuilder).group({
    name: ['''', Validators.required],
    price: [null, null, [Validators.required, Validators.min(0.01)]],
  });
  save() { console.log(this.form.value); }
}', 'typescript', 'Save is disabled while invalid, and the required message appears under the price input after it is touched.', 'زر الحفظ معطّل ما دام النموذج غير صالح، وتظهر رسالة الحقل المطلوب أسفل حقل السعر بعد لمسه.', 'Compare the formControlName in the template with the control name in the TypeScript.
Check how the validators were passed to the control.', 'قارن formControlName في القالب باسم الحقل في TypeScript.
تحقق من طريقة تمرير المتحققات إلى الحقل.', 'Bug 1: the template uses formControlName="Price" but the control is ''price'' (case-sensitive). Bug 2: the validators were passed as the third array element, which is treated as async validators. Use [0, [Validators.required, Validators.min(0.01)]].', 'الخطأ الأول: يستخدم القالب formControlName="Price" بينما اسم الحقل price (حساس لحالة الأحرف). الخطأ الثاني: مُررت المتحققات كعنصر ثالث في المصفوفة فاعتُبرت متحققات غير متزامنة. استخدم [0, [Validators.required, Validators.min(0.01)]].', '@Component({
  selector: ''app-product-form'',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" />
      <input type="number" formControlName="price" />        <!-- name matches the control -->
      @if (form.controls.price.touched && form.controls.price.hasError(''required'')) {
        <small>Price is required</small>
      }
      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class ProductFormComponent {
  readonly form = inject(FormBuilder).group({
    name: ['''', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],   // sync validators = 2nd item
  });
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    console.log(this.form.getRawValue());
  }
}'),
  (18, 'dbg-http-not-sent', 'Debugging', 95, 'Beginner', 15, 'The delete request is never sent', 'طلب الحذف لا يُرسل أبدًا', 'Clicking ''Delete'' shows the success toast, but the item comes back after a refresh. The Network tab shows no DELETE request.', 'النقر على زر الحذف يعرض تنبيه النجاح، لكن العنصر يعود بعد التحديث، ولا يُظهر تبويب Network أي طلب DELETE.', 'async delete(item: Product): Promise<void> {
  this.api.deleteProduct(item.id);          // returns an Observable
  this.items.update(list => list.filter(p => p.id !== item.id));
  this.toast.show(''Deleted'');
}', 'typescript', 'The DELETE request is sent, the toast appears only after success, and errors are shown.', 'يُرسل طلب DELETE، ويظهر التنبيه فقط بعد النجاح، وتُعرض الأخطاء.', 'HttpClient returns a cold Observable.
Nothing happens until someone subscribes (or awaits firstValueFrom).', 'يُرجع HttpClient كائن Observable باردًا.
لا يحدث شيء حتى يشترك أحد (أو ينتظر firstValueFrom).', 'The code calls this.api.delete(id) but ignores the Observable. Await firstValueFrom(...) (or subscribe) and show the toast after it resolves, inside try/catch.', 'يستدعي الكود this.api.delete(id) لكنه يتجاهل الـ Observable. انتظر firstValueFrom(...) (أو اشترك) واعرض التنبيه بعد اكتماله داخل try/catch.', 'async delete(item: Product): Promise<void> {
  try {
    await firstValueFrom(this.api.deleteProduct(item.id));   // the request is sent here
    this.items.update(list => list.filter(p => p.id !== item.id));
    this.toast.show(''Deleted'');
  } catch (error) {
    this.toast.error(''Could not delete the product.'');
  }
}'),
  (19, 'dbg-cors', 'Debugging', 105, 'Intermediate', 20, 'Blocked by CORS policy', 'محظور بسبب سياسة CORS', 'Angular on http://localhost:4200 gets ''blocked by CORS policy: No Access-Control-Allow-Origin header'' when calling the API. Postman works fine. Find the configuration mistakes.', 'يحصل Angular على http://localhost:4200 على رسالة blocked by CORS policy: No Access-Control-Allow-Origin header عند استدعاء الـ API، بينما يعمل Postman جيدًا. اكتشف أخطاء الإعداد.', 'builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:4200/")
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();
app.MapControllers();
app.UseCors("frontend");
app.Run();', 'csharp', 'Browser requests from the Angular dev server succeed; other origins are still refused.', 'تنجح طلبات المتصفح من خادم تطوير Angular، وتبقى المصادر الأخرى مرفوضة.', 'Why does Postman work? Who enforces CORS?
Compare the configured origin with the browser''s origin character by character.
Check where UseCors is in the pipeline.', 'لماذا يعمل Postman؟ ومن يفرض CORS؟
قارن المصدر المضبوط بمصدر المتصفح حرفًا بحرف.
تحقق من موضع UseCors في المسار.', 'Two mistakes: the origin is configured as ''http://localhost:4200/'' (a trailing slash never matches an Origin header) and app.UseCors() is called after MapControllers. Remove the slash and call UseCors before mapping endpoints.', 'خطآن: المصدر مضبوط كـ http://localhost:4200/ (والشرطة المائلة في النهاية لا تطابق رأس Origin أبدًا)، واستُدعيت app.UseCors() بعد MapControllers. احذف الشرطة واستدعِ UseCors قبل ربط نقاط النهاية.', 'builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:4200")     // an Origin header never ends with ''/''
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();
app.UseCors("frontend");                       // before the endpoints
app.MapControllers();
app.Run();'),
  (20, 'dbg-non-sargable', 'Debugging', 63, 'Intermediate', 25, 'Index not used for a date filter', 'الفهرس لا يُستخدم لتصفية التاريخ', 'Orders has an index on OrderDate, but ''orders of 2026'' scans 5 million rows. Read the EF query and the generated SQL and fix it.', 'يحتوي الجدول Orders على فهرس على OrderDate، لكن استعلام طلبات عام 2026 يمسح 5 ملايين صف. اقرأ استعلام EF وSQL المولَّد وأصلحه.', '// Index: IX_Orders_OrderDate
var orders2026 = await db.Orders
    .Where(o => o.OrderDate.Year == 2026)
    .CountAsync(ct);

// Generated SQL:
// SELECT COUNT(*) FROM [Orders] AS [o] WHERE DATEPART(year, [o].[OrderDate]) = 2026', 'csharp', 'An index seek using a date range: WHERE OrderDate >= @from AND OrderDate < @to.', 'عملية Index seek باستخدام نطاق تاريخ: WHERE OrderDate >= @from AND OrderDate < @to.', 'What does o.OrderDate.Year == 2026 become in SQL?
Functions on the column make the predicate non-sargable.', 'إلامَ يتحول o.OrderDate.Year == 2026 في SQL؟
الدوال على العمود تجعل الشرط غير قابل لاستخدام الفهرس (Non-sargable).', 'EF translates .Year to DATEPART(year, OrderDate), which prevents a seek. Compute the boundaries in C# and filter with a half-open range.', 'يترجم EF الخاصية .Year إلى DATEPART(year, OrderDate) مما يمنع الـ Seek. احسب الحدود في C# وصفِّ بنطاق نصف مفتوح.', 'var from = new DateTime(2026, 1, 1);
var to = from.AddYears(1);

var orders2026 = await db.Orders
    .Where(o => o.OrderDate >= from && o.OrderDate < to)   // sargable half-open range
    .CountAsync(ct);

// SELECT COUNT(*) FROM [Orders] AS [o] WHERE [o].[OrderDate] >= @from AND [o].[OrderDate] < @to'),
  (21, 'dbg-async-blocking', 'Debugging', 26, 'Intermediate', 20, 'The API freezes under load', 'الـ API يتجمد تحت الضغط', 'With 50 concurrent users the API stops responding for seconds at a time, although CPU usage is low. Look for the anti-pattern.', 'مع 50 مستخدمًا متزامنًا يتوقف الـ API عن الاستجابة لثوانٍ، رغم انخفاض استهلاك المعالج. ابحث عن النمط الخاطئ.', 'public class ReportsController(ReportService reports) : ControllerBase
{
    [HttpGet("sales")]
    public IActionResult Sales()
    {
        var data = reports.GetSalesAsync().Result;   // blocks a thread while SQL runs
        return Ok(data);
    }
}', 'csharp', 'Fully async code paths: no .Result, .Wait() or GetAwaiter().GetResult().', 'مسارات كود غير متزامنة بالكامل: دون .Result أو .Wait() أو GetAwaiter().GetResult().', 'Low CPU + slow responses = threads are waiting, not working.
Search the code for .Result.', 'انخفاض المعالج مع بطء الاستجابة يعني أن الـ Threads تنتظر لا تعمل.
ابحث في الكود عن .Result.', 'Blocking on async I/O (.Result) holds a thread-pool thread for the whole database call, starving the pool. Make the method async and await all the way up to the controller.', 'الحجز على عمليات الإدخال والإخراج غير المتزامنة (.Result) يحتفظ بـ Thread من المجمّع طوال استدعاء قاعدة البيانات فيستنزف المجمّع. اجعل الدالة غير متزامنة واستخدم await حتى وحدة التحكم.', 'public class ReportsController(ReportService reports) : ControllerBase
{
    [HttpGet("sales")]
    public async Task<ActionResult<SalesReport>> Sales(CancellationToken ct)
    {
        var data = await reports.GetSalesAsync(ct);   // thread returns to the pool while waiting
        return data;
    }
}'),
  (22, 'dbg-deferred-execution', 'Debugging', 25, 'Intermediate', 15, 'Report changes after it was ''calculated''', 'تقرير يتغير بعد حسابه', 'The code builds lowStock, then restocks products, then prints lowStock — and the printed list is empty. Why?', 'يبني الكود القائمة lowStock، ثم يعيد تعبئة المنتجات، ثم يطبع lowStock، فتكون القائمة المطبوعة فارغة. لماذا؟', 'var lowStock = products.Where(p => p.Stock < 5);

foreach (var p in products)
    p.Stock += 20;                    // restock everything

Console.WriteLine($"Low stock before restock: {lowStock.Count()}");   // prints 0 😕', 'csharp', 'The report shows the products that were low before restocking.', 'يعرض التقرير المنتجات التي كانت منخفضة قبل إعادة التعبئة.', 'When does the Where actually run?', 'متى تُنفَّذ Where فعليًا؟', 'lowStock is a deferred query; it runs when printed, after restocking. Materialise it with ToList() at the moment you need the snapshot.', 'القائمة lowStock استعلام مؤجل يُنفَّذ عند الطباعة بعد إعادة التعبئة. نفّذه بـ ToList() في اللحظة التي تحتاج فيها اللقطة.', 'var lowStock = products.Where(p => p.Stock < 5).ToList();   // snapshot NOW

foreach (var p in products)
    p.Stock += 20;

Console.WriteLine($"Low stock before restock: {lowStock.Count}");'),
  (23, 'dbg-captive-dependency', 'Debugging', 34, 'Advanced', 25, 'Random ''A second operation was started on this context'' errors', 'أخطاء عشوائية: A second operation was started on this context', 'Under load, requests sometimes fail with InvalidOperationException: ''A second operation was started on this context instance before a previous operation completed''. Locally everything works.', 'تحت الضغط تفشل الطلبات أحيانًا مع InvalidOperationException: A second operation was started on this context instance before a previous operation completed، بينما يعمل كل شيء محليًا.', '// Program.cs
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(cs));   // scoped
builder.Services.AddSingleton<PriceCache>();                            // singleton

public class PriceCache(AppDbContext db)        // captured forever, shared by all requests
{
    public Task<decimal> GetPriceAsync(int productId) =>
        db.Products.Where(p => p.Id == productId).Select(p => p.Price).FirstAsync();
}', 'csharp', 'Each request uses its own DbContext; no shared state across requests.', 'يستخدم كل طلب DbContext خاصًا به، دون حالة مشتركة بين الطلبات.', 'Look at the service registrations in Program.cs.
Which service is a singleton but receives AppDbContext?', 'انظر إلى تسجيلات الخدمات في Program.cs.
أي خدمة مسجلة كـ Singleton لكنها تستقبل AppDbContext؟', 'PriceCache is registered as a singleton and captures the scoped DbContext, so concurrent requests share it. Make PriceCache scoped, or keep it singleton and create a scope with IServiceScopeFactory when it needs the database.', 'الخدمة PriceCache مسجلة كـ Singleton وتلتقط الـ DbContext ذا النطاق Scoped، فتتشاركه الطلبات المتزامنة. اجعل PriceCache بنطاق Scoped، أو أبقها Singleton وأنشئ Scope باستخدام IServiceScopeFactory عند حاجتها لقاعدة البيانات.', '// Option 1: match the lifetime of its dependency
builder.Services.AddScoped<PriceCache>();

// Option 2: stay singleton (e.g. to keep a cache) and create a scope per use
public class PriceCache(IServiceScopeFactory scopes)
{
    public async Task<decimal> GetPriceAsync(int productId)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.Products.Where(p => p.Id == productId).Select(p => p.Price).FirstAsync();
    }
}'),
  (24, 'scn-thousands-of-records', 'Scenario', 61, 'Intermediate', 25, 'An API returns thousands of unnecessary records', 'واجهة API تُرجع آلاف السجلات غير الضرورية', 'The customers page loads slowly. The Network tab shows GET /api/customers returning 18 MB: every customer with every order and order line. The page displays 20 rows with name, city and order count. What would you do, in what order, and how would you prove it worked?', 'تُحمَّل صفحة العملاء ببطء، ويُظهر تبويب Network أن GET /api/customers يُرجع 18 ميجابايت: كل عميل مع كل طلباته وأسطر الطلبات، بينما تعرض الصفحة 20 صفًا بالاسم والمدينة وعدد الطلبات. ماذا ستفعل، وبأي ترتيب، وكيف ستثبت أن الحل نجح؟', '[HttpGet]
public List<Customer> GetAll() =>
    db.Customers
      .Include(c => c.Orders)
          .ThenInclude(o => o.Lines)
      .ToList();      // 40,000 customers × orders × lines → 18 MB of JSON', 'csharp', 'A plan covering measurement, paging, projection, query count and verification.', 'خطة تغطي القياس، والتقسيم إلى صفحات، والتحويل، وعدد الاستعلامات، والتحقق.', 'What does the screen actually need?
Where is the data shaped — in SQL or in C#?
How will you measure before and after?', 'ما الذي تحتاجه الشاشة فعليًا؟
أين يتشكل شكل البيانات: في SQL أم في C#؟
كيف ستقيس قبل وبعد؟', '1) Measure: response size, duration and SQL statement count. 2) Add paging (page/pageSize with a max). 3) Replace Include(...) with a Select projection to a CustomerListItem(Name, City, OrderCount = c.Orders.Count()). 4) AsNoTracking. 5) Add an index if the sort/filter needs one. 6) Measure again and record the numbers in the PR. Also update the Angular page to request pages.', '1) قِس حجم الاستجابة ومدتها وعدد جمل SQL. 2) أضف التقسيم إلى صفحات (page/pageSize مع حد أقصى). 3) استبدل Include(...) بتحويل Select إلى CustomerListItem(Name, City, OrderCount = c.Orders.Count()). 4) استخدم AsNoTracking. 5) أضف فهرسًا إذا احتاجه الترتيب أو التصفية. 6) قِس مرة أخرى وسجّل الأرقام في طلب الدمج. وحدّث صفحة Angular لتطلب الصفحات.', '[HttpGet]
public async Task<PagedResult<CustomerListItem>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    pageSize = Math.Clamp(pageSize, 1, 100);
    var query = db.Customers.AsNoTracking();
    var total = await query.CountAsync(ct);
    var items = await query
        .OrderBy(c => c.Name).ThenBy(c => c.Id)
        .Skip((Math.Max(page, 1) - 1) * pageSize).Take(pageSize)
        .Select(c => new CustomerListItem(c.Id, c.Name, c.City, c.Orders.Count()))   // COUNT in SQL
        .ToListAsync(ct);
    return new PagedResult<CustomerListItem>(items, page, pageSize, total);
}'),
  (25, 'scn-concurrent-order-update', 'Scenario', 115, 'Intermediate', 25, 'Two users update the same order', 'مستخدمان يحدّثان الطلب نفسه', 'Sara changes order #42''s shipping address. At the same time Omar, who opened the order 10 minutes ago, changes its status and saves. Sara''s address change disappears. Explain what happened and design a fix across database, API and UI.', 'تغيّر سارة عنوان الشحن للطلب رقم 42، وفي الوقت نفسه يغيّر عمر حالته ويحفظ بعد أن فتحه قبل 10 دقائق، فتختفي تعديلات سارة على العنوان. اشرح ما حدث وصمّم حلًا عبر قاعدة البيانات والـ API والواجهة.', '10:00  Omar opens order #42        (address = "Old St.", status = Submitted)
10:05  Sara opens order #42        (address = "Old St.")
10:06  Sara saves address = "New St."         → UPDATE ... SET Address = ''New St.''
10:10  Omar saves status = Shipped, and his form still contains address = "Old St."
                                               → UPDATE ... SET Address = ''Old St.'', Status = ''Shipped''
Result: Sara''s change is silently lost.', 'text', 'An explanation of the lost update and an optimistic concurrency design with a user-friendly conflict message.', 'شرح لمشكلة فقدان التحديث وتصميم للتزامن المتفائل مع رسالة تعارض ودية للمستخدم.', 'Omar''s form sent the whole order back, including the old address.
How can the API know Omar edited an old version?', 'أرسل نموذج عمر الطلب كاملًا، بما في ذلك العنوان القديم.
كيف يعرف الـ API أن عمر عدّل نسخة قديمة؟', 'It''s a lost update (last write wins). Add a rowversion to Order, include it in the DTO, send it back on save and set it as the OriginalValue. EF adds ''WHERE RowVersion = @original''; a stale save throws DbUpdateConcurrencyException → 409 ''concurrency_conflict''. The UI tells Omar the order changed and offers to reload. Also consider sending only changed fields (PATCH) to reduce conflicts.', 'إنها مشكلة فقدان التحديث (آخر كتابة تفوز). أضف rowversion إلى Order، وضمّنه في الـ DTO، وأعده عند الحفظ، واضبطه كـ OriginalValue. سيضيف EF الشرط WHERE RowVersion = @original، والحفظ القديم يرمي DbUpdateConcurrencyException ← 409 بالرمز concurrency_conflict. وتخبر الواجهة عمر بأن الطلب تغيّر وتعرض إعادة التحميل. وفكّر أيضًا في إرسال الحقول المتغيرة فقط (PATCH) لتقليل التعارضات.', NULL),
  (26, 'scn-angular-page-slow', 'Scenario', 89, 'Intermediate', 25, 'An Angular page becomes slow', 'صفحة Angular تصبح بطيئة', 'The tasks page was fast with 50 tasks. With 3,000 tasks, typing in the search box lags and the page freezes for a second after each status change. How do you investigate and what are the likely fixes?', 'كانت صفحة المهام سريعة مع 50 مهمة، ومع 3000 مهمة أصبحت الكتابة في مربع البحث متأخرة وتتجمد الصفحة ثانية بعد كل تغيير حالة. كيف تحقق، وما الإصلاحات المرجحة؟', NULL, NULL, 'A DevTools-based investigation and at least three concrete fixes.', 'تحقيق يعتمد على أدوات المطورين وثلاثة إصلاحات محددة على الأقل.', 'Record a Performance profile while typing.
How many DOM nodes are rendered? Is every row re-created?
Are expensive functions called from the template?', 'سجّل ملف أداء Performance أثناء الكتابة.
كم عدد عقد DOM المعروضة؟ وهل يُعاد إنشاء كل صف؟
هل تُستدعى دوال مكلفة من القالب؟', 'Profile first. Typical causes: rendering all 3,000 rows (add pagination or virtual scrolling), @for tracking by index or object identity after immutable updates (track task.id), expensive methods called in the template on every change (move to computed()), and filtering on every keystroke (debounce). Re-profile to confirm.', 'حلّل الأداء أولًا. الأسباب المعتادة: عرض 3000 صف كلها (أضف التقسيم إلى صفحات أو التمرير الافتراضي)، وتتبع @for بالفهرس أو بهوية الكائن بعد التحديثات غير القابلة للتغيير (استخدم track task.id)، واستدعاء دوال مكلفة في القالب مع كل تغيير (انقلها إلى computed())، والتصفية مع كل ضغطة مفتاح (استخدم Debounce). ثم أعد التحليل للتأكد.', NULL),
  (27, 'scn-fast-local-slow-prod', 'Scenario', 64, 'Advanced', 30, 'Fast locally, slow in production', 'سريع محليًا وبطيء في الإنتاج', 'The product search endpoint takes 40 ms on your machine and 6 seconds in production. Same code, same query. List the possible reasons and how you would confirm each one.', 'تستغرق نقطة نهاية البحث عن المنتجات 40 مللي ثانية على جهازك و6 ثوانٍ في الإنتاج، بالكود نفسه والاستعلام نفسه. اذكر الأسباب المحتملة وكيف ستتحقق من كل منها.', NULL, NULL, 'Data volume, plans, parameter sniffing, missing indexes, blocking, network/payload size — each with a way to check.', 'حجم البيانات، والخطط، وParameter sniffing، والفهارس المفقودة، والحجب، وحجم الشبكة/البيانات، مع طريقة تحقق لكل منها.', 'How many rows does production have?
Is the same execution plan used?
Is the query waiting rather than working?', 'كم عدد الصفوف في الإنتاج؟
هل تُستخدم خطة التنفيذ نفسها؟
هل الاستعلام ينتظر بدلًا من أن يعمل؟', 'Check: data volume (5k vs 5M rows) → test with realistic data; the actual plan from Query Store (scan vs seek, missing index); parameter sniffing (a plan compiled for a rare value) → compare plans for different parameters; blocking/waits (sys.dm_exec_requests); stale statistics; and response size/network. Fix the confirmed cause, not all of them blindly.', 'افحص: حجم البيانات (5 آلاف مقابل 5 ملايين صف) واختبر ببيانات واقعية؛ والخطة الفعلية من Query Store (مسح أم Seek، وفهرس مفقود)؛ وParameter sniffing (خطة مترجمة لقيمة نادرة) بمقارنة الخطط لمعاملات مختلفة؛ والحجب والانتظار (sys.dm_exec_requests)؛ والإحصاءات القديمة؛ وحجم الاستجابة والشبكة. أصلح السبب المؤكد لا كل الأسباب عشوائيًا.', NULL),
  (28, 'scn-validation-ui', 'Scenario', 109, 'Intermediate', 20, 'The UI can''t display an API validation error', 'الواجهة لا تستطيع عرض خطأ تحقق من الـ API', 'Users report that ''Save'' sometimes does nothing. The API returns 400 { errors: { "Lines[2].Quantity": ["Quantity exceeds stock"] } } but the form shows no message. What needs to change on each side?', 'يبلغ المستخدمون أن زر الحفظ أحيانًا لا يفعل شيئًا. يُرجع الـ API الرمز 400 { errors: { "Lines[2].Quantity": ["Quantity exceeds stock"] } } لكن النموذج لا يعرض أي رسالة. ما الذي يجب تغييره في كل جهة؟', NULL, NULL, 'A mapping strategy from API error keys to form controls, plus a fallback message.', 'استراتيجية لتحويل مفاتيح أخطاء الـ API إلى حقول النموذج، مع رسالة احتياطية.', 'The key uses PascalCase and an index path.
What should happen to errors that don''t match any control?', 'يستخدم المفتاح صيغة PascalCase ومسارًا بالفهرس.
ماذا يجب أن يحدث للأخطاء التي لا تطابق أي حقل؟', 'Agree on a key format (camelCase JSON paths: lines[2].quantity) or normalise on the client. Map the path to the FormArray control (form.get([''lines'', 2, ''quantity''])) and setErrors({ server: message }). Show any unmatched errors in a summary at the top of the form, and never let a failed save look like nothing happened.', 'اتفقوا على صيغة للمفاتيح (مسارات JSON بصيغة camelCase مثل lines[2].quantity) أو وحّدوها في العميل. حوّل المسار إلى حقل FormArray (form.get([''lines'', 2, ''quantity''])) واستدعِ setErrors({ server: message }). واعرض الأخطاء غير المطابقة في ملخص أعلى النموذج، ولا تدع حفظًا فاشلًا يبدو وكأن شيئًا لم يحدث.', NULL),
  (29, 'scn-change-breaks-feature', 'Scenario', 123, 'Intermediate', 20, 'A change breaks an existing feature', 'تغيير يكسر ميزة موجودة', 'You added discount codes. Two days later, finance reports that invoices for orders without a code now show a total of 0. What do you do right now, and what do you change so this can''t happen again?', 'أضفت رموز الخصم، وبعد يومين أبلغ قسم المالية أن فواتير الطلبات دون رمز تعرض الآن إجماليًا قدره 0. ماذا تفعل الآن، وماذا تغيّر حتى لا يتكرر ذلك؟', NULL, NULL, 'Immediate mitigation, root cause, a regression test and process improvements.', 'تخفيف فوري، والسبب الجذري، واختبار انحدار، وتحسينات في العملية.', 'Can you roll back or hot-fix quickly?
Write the failing test before fixing.
Which orders were affected and need correcting?', 'هل يمكنك التراجع أو إصدار إصلاح عاجل بسرعة؟
اكتب الاختبار الفاشل قبل الإصلاح.
أي الطلبات تأثرت وتحتاج إلى تصحيح؟', 'Mitigate (roll back or hot-fix), reproduce with a failing test (order without code → total unchanged), fix (null discount treated as 0%), identify and correct affected invoices with a reviewed SQL script, then add tests for the ''no discount'' path and a pre-merge test run. Write a short blameless review.', 'خفّف الأثر (تراجع أو إصلاح عاجل)، وأعد إنتاج الخطأ باختبار فاشل (طلب دون رمز ← إجمالي دون تغيير)، وأصلح (اعتبار الخصم الفارغ 0%)، وحدّد الفواتير المتأثرة وصحّحها بسكربت SQL مُراجع، ثم أضف اختبارات لمسار عدم وجود خصم وتشغيلًا للاختبارات قبل الدمج، واكتب مراجعة قصيرة دون لوم.', NULL),
  (30, 'scn-oversell-stock', 'Scenario', 68, 'Advanced', 25, 'The last item was sold twice', 'بيعت القطعة الأخيرة مرتين', 'During a flash sale, stock for a product went to -3. The code loads the product, checks Stock >= quantity, subtracts and saves. Explain the race and propose two different fixes with their trade-offs.', 'أثناء تخفيضات سريعة وصل مخزون منتج إلى -3. يحمّل الكود المنتج، ويتحقق من Stock >= quantity، ثم يطرح ويحفظ. اشرح حالة السباق واقترح إصلاحين مختلفين مع مفاضلاتهما.', 'public async Task ReserveAsync(int productId, int quantity, CancellationToken ct)
{
    var product = await db.Products.FindAsync([productId], ct);
    if (product!.Stock < quantity)
        throw new BusinessRuleException("out_of_stock", "Not enough stock.");

    product.Stock -= quantity;              // two requests can both get here
    await db.SaveChangesAsync(ct);
}', 'csharp', 'A clear race-condition timeline and two fixes (atomic conditional UPDATE, optimistic concurrency) plus a database constraint.', 'خط زمني واضح لحالة السباق، وإصلاحان (تحديث شرطي ذري، وتزامن متفائل)، إضافة إلى قيد في قاعدة البيانات.', 'Two requests read Stock = 1 at the same time.
Can the check and the update happen in one statement?
What should the database itself refuse?', 'طلبان يقرآن Stock = 1 في الوقت نفسه.
هل يمكن أن يحدث الفحص والتحديث في جملة واحدة؟
ما الذي يجب أن ترفضه قاعدة البيانات نفسها؟', 'Both requests read 1, both pass the check, both subtract. Fix A: UPDATE ... SET Stock = Stock - @q WHERE Id = @id AND Stock >= @q (ExecuteUpdateAsync) and treat 0 rows as ''out of stock'' — simple and fast. Fix B: rowversion on Product and retry on DbUpdateConcurrencyException — more code, but works for complex changes. Add CHECK (Stock >= 0) as the last line of defence.', 'يقرأ الطلبان القيمة 1، وينجح كلاهما في الفحص، ويطرح كلاهما. الإصلاح أ: UPDATE ... SET Stock = Stock - @q WHERE Id = @id AND Stock >= @q (عبر ExecuteUpdateAsync) واعتبار 0 صفوف نفادًا للمخزون، وهو بسيط وسريع. الإصلاح ب: rowversion على Product وإعادة المحاولة عند DbUpdateConcurrencyException، وهو كود أكثر لكنه يصلح للتغييرات المعقدة. وأضف CHECK (Stock >= 0) كخط دفاع أخير.', 'public async Task ReserveAsync(int productId, int quantity, CancellationToken ct)
{
    var updated = await db.Products
        .Where(p => p.Id == productId && p.Stock >= quantity)
        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - quantity), ct);

    if (updated == 0)
        throw new BusinessRuleException("out_of_stock", "Not enough stock.");
}

// And in the model, as the last line of defence:
// b.Entity<Product>().ToTable(t => t.HasCheckConstraint("CK_Product_Stock", "Stock >= 0"));'),
  (31, 'scn-pool-exhausted', 'Scenario', 72, 'Advanced', 20, 'Timeout: max pool size was reached', 'انتهاء المهلة: تم الوصول إلى الحجم الأقصى للمجمّع', 'After the API runs for about an hour, every request fails with ''Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool.'' Restarting fixes it temporarily. How do you find the cause?', 'بعد تشغيل الـ API لمدة ساعة تقريبًا تفشل كل الطلبات مع الرسالة Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool. وإعادة التشغيل تحل المشكلة مؤقتًا. كيف تجد السبب؟', 'public class NightlyExport(IConfiguration config)
{
    public async Task RunAsync()
    {
        foreach (var region in regions)
        {
            var connection = new SqlConnection(config.GetConnectionString("Default"));
            await connection.OpenAsync();
            var command = new SqlCommand("SELECT ... WHERE Region = @r", connection);
            command.Parameters.AddWithValue("@r", region);
            var reader = await command.ExecuteReaderAsync();
            await WriteCsvAsync(reader);
            // connection is never closed
        }
    }
}', 'csharp', 'Evidence-based investigation pointing to leaked connections or long-held connections, and the code fix.', 'تحقيق قائم على الأدلة يشير إلى اتصالات مسرّبة أو محتجزة طويلًا، مع إصلاح الكود.', 'Count sessions per program_name in sys.dm_exec_sessions over time.
Search the code for ''new SqlConnection'' without using.
Are long transactions or streaming readers holding connections?', 'احسب الجلسات لكل program_name في sys.dm_exec_sessions عبر الزمن.
ابحث في الكود عن new SqlConnection دون using.
هل تحتجز معاملات طويلة أو قارئات تدفقية الاتصالات؟', 'Watch sessions grow towards 100 (the default Max Pool Size). The usual cause is a connection or DbContext that''s never disposed (e.g. created manually in a background job) or kept open across slow work. Wrap connections in using/await using, use scoped DbContexts, keep transactions short. Raising Max Pool Size only hides the leak.', 'راقب نمو الجلسات نحو 100 (القيمة الافتراضية لـ Max Pool Size). السبب المعتاد اتصال أو DbContext لا يُتخلص منه أبدًا (مثل إنشائه يدويًا في مهمة خلفية) أو يبقى مفتوحًا أثناء عمل بطيء. غلّف الاتصالات بـ using/await using، واستخدم DbContext بنطاق Scoped، واجعل المعاملات قصيرة. ورفع Max Pool Size يخفي التسريب فقط.', 'public async Task RunAsync(CancellationToken ct)
{
    foreach (var region in regions)
    {
        await using var connection = new SqlConnection(config.GetConnectionString("Default"));
        await connection.OpenAsync(ct);
        await using var command = new SqlCommand("SELECT ... WHERE Region = @r", connection);
        command.Parameters.Add(new SqlParameter("@r", SqlDbType.NVarChar, 50) { Value = region });
        await using var reader = await command.ExecuteReaderAsync(ct);
        await WriteCsvAsync(reader, ct);
    }   // disposed → returned to the pool every iteration
}'),
  (32, 'rev-orders-controller', 'CodeReview', 36, 'Intermediate', 25, 'Review: create order endpoint', 'مراجعة: نقطة نهاية إنشاء الطلب', 'Review this endpoint as if it were a pull request. List correctness, security, performance and maintainability problems, missing validation and testing gaps.', 'راجع نقطة النهاية هذه كأنها طلب دمج. اذكر مشكلات الصحة والأمان والأداء وقابلية الصيانة، والتحقق الناقص، والفجوات في الاختبار.', '[HttpPost("api/orders")]
public IActionResult Create(Order order)                 // binds directly to the entity
{
    foreach (var line in order.Lines)
    {
        var product = db.Products.Find(line.ProductId);   // one query per line
        product.Stock -= line.Quantity;
    }
    order.CreatedAt = DateTime.Now;
    db.Orders.Add(order);                                 // order.Total comes from the browser
    db.SaveChanges();
    return Ok(order);
}', 'csharp', 'At least six findings with a suggested fix for each.', 'ست ملاحظات على الأقل مع إصلاح مقترح لكل منها.', 'Where does the total come from?
What does the client receive back?
What happens with 2 parallel orders for the last item?', 'من أين يأتي الإجمالي؟
ماذا يستقبل العميل في الاستجابة؟
ماذا يحدث مع طلبين متوازيين لآخر قطعة؟', 'Findings: (1) trusts the client''s Total — recalculate from database prices; (2) binds directly to the entity (over-posting, e.g. Status) — use a request DTO; (3) no validation (empty lines, quantity <= 0, unknown products); (4) synchronous Find/SaveChanges — use async with CancellationToken; (5) N+1 product lookups in the loop; (6) race on stock — atomic update or concurrency token, plus CHECK constraint; (7) returns the entity (cycles, internal fields) and 200 — return 201 with a DTO; (8) no tests for totals or stock rules.', 'الملاحظات: (1) يثق بإجمالي العميل، والصحيح إعادة الحساب من أسعار قاعدة البيانات؛ (2) يربط الطلب مباشرة بالكيان (Over-posting مثل Status)، فاستخدم DTO للطلب؛ (3) لا يوجد تحقق (أسطر فارغة، وكمية <= 0، ومنتجات غير معروفة)؛ (4) استدعاءات Find/SaveChanges متزامنة، فاستخدم الإصدارات غير المتزامنة مع CancellationToken؛ (5) بحث N+1 عن المنتجات داخل الحلقة؛ (6) حالة سباق على المخزون، فاستخدم تحديثًا ذريًا أو رمز تزامن مع قيد CHECK؛ (7) يُرجع الكيان (حلقات وحقول داخلية) مع 200، والصحيح 201 مع DTO؛ (8) لا توجد اختبارات للإجماليات أو قواعد المخزون.', 'public record PlaceOrderLine([Range(1, int.MaxValue)] int ProductId, [Range(1, 1000)] int Quantity);
public record PlaceOrderRequest([Range(1, int.MaxValue)] int CustomerId,
                                [Required, MinLength(1)] List<PlaceOrderLine>? Lines);

[HttpPost("api/orders")]
public async Task<ActionResult<OrderDto>> Create(PlaceOrderRequest request, CancellationToken ct)
{
    var order = await orders.PlaceAsync(request, ct);   // loads products in ONE query, validates,
                                                        // prices from the DB, reduces stock atomically
    return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
}'),
  (33, 'rev-sql-search', 'CodeReview', 70, 'Intermediate', 15, 'Review: product search with raw SQL', 'مراجعة: البحث عن المنتجات بـ SQL خام', 'A teammate wrote a ''faster'' search with raw SQL and dynamic sorting. Review it.', 'كتب زميل بحثًا أسرع باستخدام SQL خام وترتيب ديناميكي. راجعه.', '[HttpGet("api/products/search")]
public List<Product> Search(string term, string sortBy) =>
    db.Products
      .FromSqlRaw("SELECT * FROM Products WHERE Name LIKE ''%" + term + "%'' ORDER BY " + sortBy)
      .ToList();', 'csharp', 'Identify the injection points and propose a safe version.', 'حدّد نقاط الحقن واقترح نسخة آمنة.', 'Which parts of the SQL come from the user?
Can column names be parameters?', 'أي أجزاء SQL تأتي من المستخدم؟
هل يمكن أن تكون أسماء الأعمدة معاملات؟', 'Both ''term'' and ''sortBy'' are concatenated into the SQL — classic injection (and plan-cache pollution). Use FromSql with interpolation (parameters) or plain LINQ for the filter, map sortBy through an allow-list switch, cap the result size and escape LIKE wildcards.', 'يُدمج كل من term وsortBy في نص SQL، وهو حقن كلاسيكي (مع تلويث ذاكرة الخطط). استخدم FromSql مع الإدماج (معاملات) أو LINQ العادية للتصفية، وحوّل sortBy عبر switch بقائمة مسموحة، وحدّد حجم النتائج، وعالج رموز LIKE الخاصة.', '[HttpGet("api/products/search")]
public Task<List<ProductDto>> Search(string term, string? sortBy, CancellationToken ct)
{
    var pattern = SearchService.LikePattern(term);                  // escapes %, _ and [
    var query = db.Products.AsNoTracking().Where(p => EF.Functions.Like(p.Name, pattern));

    query = sortBy switch                                           // allow-list
    {
        "price" => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
        _       => query.OrderBy(p => p.Name).ThenBy(p => p.Id)
    };

    return query.Take(50).Select(p => new ProductDto(p.Id, p.Name, p.Price)).ToListAsync(ct);
}'),
  (34, 'rev-angular-component', 'CodeReview', 95, 'Intermediate', 20, 'Review: Angular orders component', 'مراجعة: مكون الطلبات في Angular', 'Review this component for correctness, maintainability, performance and user experience.', 'راجع هذا المكون من حيث الصحة وقابلية الصيانة والأداء وتجربة المستخدم.', '@Component({
  selector: ''app-orders'',
  template: `
    <h2>Orders ({{ total() }})</h2>
    @for (o of orders; track $index) {
      <div>{{ o.customer }} — {{ o.amount }} <button (click)="del(o.id)">x</button></div>
    }
  `,
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit() {
    interval(5000).subscribe(() =>
      this.http.get<any[]>(''http://localhost:5080/api/orders'').subscribe(r => (this.orders = r)));
  }
  total() { return this.orders.reduce((s, o) => s + o.amount, 0); }
  del(id: number) { this.http.delete(''http://localhost:5080/api/orders/'' + id).subscribe(); }
}', 'typescript', 'At least five findings with improvements.', 'خمس ملاحظات على الأقل مع التحسينات.', 'Where should HTTP calls live?
What happens when the user navigates away?
What does the user see while loading or on error?', 'أين يجب أن تكون استدعاءات HTTP؟
ماذا يحدث عندما ينتقل المستخدم إلى صفحة أخرى؟
ماذا يرى المستخدم أثناء التحميل أو عند الخطأ؟', 'Findings: HttpClient and URL hard-coded in the component (move to a typed service + base URL token); ''any'' everywhere (use interfaces); the interval subscription is never cleaned up (takeUntilDestroyed or toSignal); no loading, empty or error states; @for without a proper track (track order.id); total recalculated by a template method on every change (computed()); a delete without confirmation.', 'الملاحظات: الـ HttpClient والعنوان مكتوبان مباشرة في المكون (انقلهما إلى خدمة محددة الأنواع مع InjectionToken للعنوان)؛ واستخدام any في كل مكان (استخدم Interfaces)؛ واشتراك interval لا يُنظَّف أبدًا (استخدم takeUntilDestroyed أو toSignal)؛ ولا توجد حالات تحميل أو فراغ أو خطأ؛ و@for دون track مناسب (track order.id)؛ والإجمالي يُعاد حسابه بدالة في القالب مع كل تغيير (استخدم computed())؛ وحذف دون تأكيد.', '@Component({
  selector: ''app-orders'',
  template: `
    <h2>Orders ({{ total() }})</h2>
    @if (state().kind === ''loading'') { <app-skeleton /> }
    @else if (state().kind === ''error'') { <app-error-state (retry)="reload()" /> }
    @else if (orders().length === 0) { <app-empty-state /> }
    @else {
      @for (o of orders(); track o.id) {
        <app-order-row [order]="o" (delete)="confirmDelete(o)" />
      }
    }
  `,
})
export class OrdersComponent {
  private readonly api = inject(OrdersApi);            // typed service, base URL configured once
  readonly orders = signal<OrderListItem[]>([]);
  readonly state = signal<{ kind: ''loading'' | ''ready'' | ''error'' }>({ kind: ''loading'' });
  readonly total = computed(() => this.orders().reduce((s, o) => s + o.amount, 0));

  constructor() {
    interval(5000).pipe(startWith(0), switchMap(() => this.api.list()), takeUntilDestroyed())
      .subscribe({ next: r => { this.orders.set(r); this.state.set({ kind: ''ready'' }); },
                   error: () => this.state.set({ kind: ''error'' }) });
  }
}'),
  (35, 'rev-swallowed-exceptions', 'CodeReview', 8, 'Beginner', 15, 'Review: error handling in an import job', 'مراجعة: معالجة الأخطاء في مهمة استيراد', 'This import ''never fails'', but customers keep disappearing from imports. Review the error handling.', 'مهمة الاستيراد هذه لا تفشل أبدًا، لكن العملاء يختفون باستمرار من عمليات الاستيراد. راجع معالجة الأخطاء.', 'public async Task ImportAsync(IEnumerable<string[]> rows)
{
    foreach (var row in rows)
    {
        try
        {
            var customer = new Customer(row[0], row[1], decimal.Parse(row[2]));
            db.Customers.Add(customer);
            await db.SaveChangesAsync();
        }
        catch (Exception)
        {
        }
    }
}

public void Process() { try { Run(); } catch (Exception ex) { throw ex; } }', 'csharp', 'Explain why errors are invisible and rewrite the handling.', 'اشرح لماذا الأخطاء غير مرئية وأعد كتابة المعالجة.', 'What happens inside the empty catch?
What does ''throw ex'' do to the stack trace?', 'ماذا يحدث داخل catch الفارغة؟
ماذا تفعل throw ex بـ Stack trace؟', 'The empty catch swallows every failure, so bad rows vanish silently; catching Exception also hides programming bugs; ''throw ex'' resets the stack trace. Validate rows explicitly, collect per-row errors into a report, log unexpected exceptions with context and rethrow with ''throw;''. Return a summary (imported, rejected with reasons).', 'تبتلع catch الفارغة كل الأعطال فتختفي الصفوف الخاطئة بصمت، والتقاط Exception يخفي أيضًا أخطاء البرمجة، وتعيد throw ex ضبط Stack trace. تحقق من الصفوف صراحةً، واجمع أخطاء كل صف في تقرير، وسجّل الاستثناءات غير المتوقعة مع السياق وأعد رميها بـ throw;. وأرجع ملخصًا (المستورد، والمرفوض مع الأسباب).', 'public async Task<ImportResult> ImportAsync(IEnumerable<string[]> rows, CancellationToken ct)
{
    var result = new ImportResult();
    var line = 0;
    foreach (var row in rows)
    {
        line++;
        if (row.Length < 3 || !decimal.TryParse(row[2], CultureInfo.InvariantCulture, out var credit))
        {
            result.Rejected.Add((line, "Invalid credit limit"));
            continue;
        }
        db.Customers.Add(new Customer(row[0], row[1], credit));
        result.Imported++;
    }
    await db.SaveChangesAsync(ct);    // unexpected failures surface instead of vanishing
    logger.LogInformation("Import finished: {Imported} imported, {Rejected} rejected", result.Imported, result.Rejected.Count);
    return result;
}

public void Process() { try { Run(); } catch (Exception ex) { logger.LogError(ex, "Run failed"); throw; } }'),
  (36, 'rev-tolist-before-where', 'CodeReview', 56, 'Intermediate', 15, 'Review: a reusable data-access helper', 'مراجعة: أداة مساعدة قابلة لإعادة الاستخدام للوصول إلى البيانات', 'This helper is used by 12 endpoints. Review it for performance.', 'تستخدم 12 نقطة نهاية هذه الأداة المساعدة. راجعها من حيث الأداء.', 'public class Repository<T>(AppDbContext db) where T : class
{
    public IEnumerable<T> GetAll() => db.Set<T>().ToList();
}

// Used like this in 12 endpoints:
var recent = repo.GetAll().Where(o => o.CreatedAt > since).Take(20);', 'csharp', 'Explain what SQL runs and how to fix the helper without breaking callers.', 'اشرح ما يُنفَّذ في SQL وكيف تُصلح الأداة دون كسر المستدعين.', 'What does ToList() inside GetAll() do?
What is the return type?', 'ماذا تفعل ToList() داخل GetAll()؟
ما نوع القيمة المُرجعة؟', 'GetAll() materialises the entire table (with tracking), so every caller''s Where/Take runs in memory — 12 endpoints reading the full table. Return IQueryable<T> with AsNoTracking (or, better, specific query methods that filter and project in SQL), and check the generated SQL for each endpoint.', 'تنفّذ GetAll() الجدول كاملًا (مع التتبع)، فتعمل Where/Take لدى كل مستدعٍ في الذاكرة، أي 12 نقطة نهاية تقرأ الجدول كاملًا. أرجع IQueryable<T> مع AsNoTracking (أو الأفضل: دوال استعلام محددة تصفّي وتحوّل في SQL)، وافحص SQL المولَّد لكل نقطة نهاية.', '// Prefer specific query methods that filter and project in SQL:
public Task<List<OrderListItem>> RecentAsync(DateTime since, int take, CancellationToken ct) =>
    db.Orders.AsNoTracking()
        .Where(o => o.CreatedAt > since)
        .OrderByDescending(o => o.CreatedAt)
        .Take(take)
        .Select(o => new OrderListItem(o.Id, o.Customer.Name, o.Total, o.CreatedAt))
        .ToListAsync(ct);

// If a generic helper must stay, at least keep it composable:
public IQueryable<T> Query() => db.Set<T>().AsNoTracking();'),
  (37, 'rev-god-service', 'CodeReview', 18, 'Intermediate', 20, 'Review: OrderManager', 'مراجعة: OrderManager', 'OrderManager has grown to 1,400 lines. Review the excerpt for design problems and suggest a refactoring plan that can be done in small, safe steps.', 'نما OrderManager إلى 1400 سطر. راجع المقتطف لاكتشاف مشكلات التصميم، واقترح خطة إعادة هيكلة يمكن تنفيذها بخطوات صغيرة وآمنة.', 'public class OrderManager
{
    public void PlaceOrder(OrderForm form)
    {
        if (form.Lines.Count == 0) throw new Exception("empty");
        using var db = new AppDbContext();                    // created here
        decimal total = 0;
        foreach (var l in form.Lines)
        {
            var p = db.Products.Find(l.ProductId);
            total += p!.Price * l.Quantity * (DateTime.Now.DayOfWeek == DayOfWeek.Friday ? 0.9m : 1m);
        }
        var order = new Order { Total = total, CreatedAt = DateTime.Now };
        db.Orders.Add(order);
        db.SaveChanges();
        new SmtpClient("smtp.company.local").Send("shop@x.com", form.Email, "Thanks", $"Total {total}");
        File.AppendAllText(@"C:\logs\orders.txt", $"{order.Id};{total}\n");
    }
    // ... 1,400 more lines: refunds, reports, CSV export, coupons ...
}', 'csharp', 'Identified responsibilities, SOLID violations and an incremental plan.', 'تحديد المسؤوليات ومخالفات SOLID وخطة تدريجية.', 'Count the reasons this class would change.
Which dependencies are created with ''new''?
How would you test PlaceOrder today?', 'احسب الأسباب التي قد تجعل هذا الصنف يتغير.
أي الاعتماديات تُنشأ بـ new؟
كيف ستختبر PlaceOrder اليوم؟', 'It validates, prices, persists, emails and writes files (SRP); it creates SmtpClient/DbContext with new and reads DateTime.Now (DIP, untestable). Plan: add characterisation tests; extract OrderValidator and PriceCalculator (pure, unit-tested); inject IEmailSender and TimeProvider; move persistence into OrderService; delete the dead code. Commit each step separately.', 'يتحقق ويسعّر ويحفظ ويرسل البريد ويكتب الملفات (مخالفة SRP)، وينشئ SmtpClient/DbContext بـ new ويقرأ DateTime.Now (مخالفة DIP وغير قابل للاختبار). الخطة: أضف اختبارات توصيفية؛ واستخرج OrderValidator وPriceCalculator (صافيين ومختبرين)؛ واحقن IEmailSender وTimeProvider؛ وانقل الحفظ إلى OrderService؛ واحذف الكود الميت. ونفّذ Commit لكل خطوة على حدة.', NULL),
  (38, 'rev-weak-tests', 'CodeReview', 117, 'Intermediate', 15, 'Review: tests that don''t test', 'مراجعة: اختبارات لا تختبر شيئًا', 'These tests are all green, yet a discount bug reached production. Review the tests.', 'كل هذه الاختبارات ناجحة، ومع ذلك وصل خطأ في الخصم إلى الإنتاج. راجع الاختبارات.', '[Fact]
public void ApplyDiscount_Works()
{
    var calc = new DiscountCalculator();
    calc.Apply(100m, "SAVE10");                       // no assertion
}

[Fact]
public void ApplyDiscount_ReturnsExpected()
{
    var calc = new DiscountCalculator();
    var expected = calc.Apply(100m, "SAVE10");        // expected computed by the code under test
    Assert.Equal(expected, calc.Apply(100m, "SAVE10"));
}

[Fact]
public void ApplyDiscount_NotNull() =>
    Assert.NotNull(new DiscountCalculator().Apply(100m, "SAVE10"));', 'csharp', 'Explain why each test gives false confidence and rewrite one properly.', 'اشرح لماذا يعطي كل اختبار ثقة زائفة، وأعد كتابة واحد منها بشكل صحيح.', 'Does every test have a meaningful assertion?
Is the expected value calculated with the same code being tested?', 'هل لكل اختبار تحقق ذو معنى؟
هل القيمة المتوقعة محسوبة بالكود نفسه الذي يُختبر؟', 'Test 1 has no assertion; test 2 computes the expected value with the production method (it can never fail); test 3 only asserts NotNull; none covers boundaries (0%, 100%, expired code). Use hard-coded expected values, Arrange-Act-Assert, [Theory] for boundaries, and a test that reproduces the production bug.', 'الاختبار الأول بلا تحقق؛ والثاني يحسب القيمة المتوقعة بدالة الإنتاج نفسها (فلا يمكن أن يفشل أبدًا)؛ والثالث يتحقق فقط من NotNull؛ ولا يغطي أي منها الحدود (0% و100% والرمز المنتهي). استخدم قيمًا متوقعة ثابتة، ونمط Arrange-Act-Assert، و[Theory] للحدود، واختبارًا يعيد إنتاج خطأ الإنتاج.', '[Theory]
[InlineData(100, "SAVE10", 90)]
[InlineData(100, null, 100)]        // the production bug: no code must not change the total
[InlineData(100, "FREE100", 0)]
[InlineData(0, "SAVE10", 0)]
public void Apply_returns_discounted_total(decimal total, string? code, decimal expected)
{
    var calc = new DiscountCalculator(new FakeCodes(("SAVE10", 10), ("FREE100", 100)));
    Assert.Equal(expected, calc.Apply(total, code));
}

[Fact]
public void Expired_code_is_rejected()
{
    var calc = new DiscountCalculator(new FakeCodes(("OLD", 10, expired: true)));
    Assert.Throws<InvalidDiscountCodeException>(() => calc.Apply(100m, "OLD"));
}'),
  (39, 'rev-logging-secrets', 'CodeReview', 141, 'Beginner', 15, 'Review: login logging', 'مراجعة: التسجيل في تسجيل الدخول', 'Review the logging in this login method for security and usefulness.', 'راجع التسجيل في دالة تسجيل الدخول هذه من حيث الأمان والفائدة.', 'public async Task<IActionResult> Login(LoginRequest r)
{
    logger.LogError($"Login attempt {r.Email} / {r.Password}");
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == r.Email);
    if (user is null) { logger.LogInformation("no user"); return BadRequest("Email not registered"); }
    if (!hasher.Verify(user.PasswordHash, r.Password)) return BadRequest("Wrong password");
    var token = tokens.Create(user);
    logger.LogInformation($"Issued token {token} for {user.Email}");
    return Ok(new { token });
}', 'csharp', 'Identify sensitive data, poor log levels and missing context; rewrite the log statements.', 'حدّد البيانات الحساسة ومستويات السجل السيئة والسياق الناقص، وأعد كتابة جمل التسجيل.', 'What ends up in the log file?
Can you search these logs by user id?', 'ماذا ينتهي به المطاف في ملف السجل؟
هل يمكنك البحث في هذه السجلات بمعرف المستخدم؟', 'It logs the password and the JWT (secrets in logs), uses string interpolation (no structured properties), logs failures at Information and success at Error, and leaks whether an email exists in the response. Log only user id/email hash with templates, Warning for failed logins, never secrets, and return the same message for unknown user and wrong password.', 'يسجل كلمة المرور ورمز JWT (أسرار في السجلات)، ويستخدم String interpolation (دون خصائص منظمة)، ويسجل الفشل بمستوى Information والنجاح بمستوى Error، ويكشف في الاستجابة ما إذا كان البريد موجودًا. سجّل فقط معرف المستخدم أو Hash البريد باستخدام القوالب، وبمستوى Warning لمحاولات الدخول الفاشلة، ولا تسجل الأسرار أبدًا، وأرجع الرسالة نفسها للمستخدم غير الموجود ولكلمة المرور الخاطئة.', 'public async Task<IActionResult> Login(LoginRequest r, CancellationToken ct)
{
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == r.Email, ct);
    if (user is null || !hasher.Verify(user.PasswordHash, r.Password))
    {
        logger.LogWarning("Failed login for {EmailHash}", Hash(r.Email));   // no password, no raw email
        return Unauthorized(new { code = "invalid_credentials" });           // same answer for both cases
    }

    logger.LogInformation("User {UserId} signed in", user.Id);               // never log the token
    return Ok(new { token = tokens.Create(user) });
}')
on conflict do nothing;

insert into public.interview_questions (id, key, category, topic_id, difficulty, question_en, question_ar, answer_en, answer_ar, example_code, follow_up_en, follow_up_ar) values
  (1, 'iq-cs-value-vs-reference', 'CSharp', 28, 'Beginner', 'What is the difference between a value type and a reference type?', 'ما الفرق بين نوع القيمة والنوع المرجعي؟', 'A value type (int, decimal, DateTime, struct) holds its data directly; assigning it copies the value. A reference type (class, string, array) holds a reference to an object on the heap; assigning it copies the reference, so both variables point to the same object. string is a reference type but immutable, so it behaves like a value.', 'يحمل نوع القيمة (int وdecimal وDateTime وstruct) بياناته مباشرة، وإسناده ينسخ القيمة. أما النوع المرجعي (class وstring والمصفوفة) فيحمل مرجعًا إلى كائن في الـ Heap، وإسناده ينسخ المرجع فيشير المتغيران إلى الكائن نفسه. والنوع string مرجعي لكنه غير قابل للتغيير، لذا يتصرف كقيمة.', 'var a = new Point(1, 2);      // struct (value type)
var b = a;  b.X = 99;         // a.X is still 1

var c = new Customer("Sara"); // class (reference type)
var d = c;  d.Name = "Omar";  // c.Name is now "Omar" — same object

object boxed = 42;            // boxing: the int is copied into a heap object', 'What is boxing and when does it happen?', 'ما هو Boxing ومتى يحدث؟'),
  (2, 'iq-cs-interface-vs-abstract', 'CSharp', 16, 'Intermediate', 'When would you use an interface instead of an abstract class?', 'متى تستخدم Interface بدلًا من Abstract class؟', 'Use an interface to define a contract that unrelated classes can implement (a class can implement many interfaces) — ideal for dependency injection and testing. Use an abstract class when related classes share state or implementation and form a true ''is-a'' hierarchy; a class can inherit only one class.', 'استخدم Interface لتعريف عقد يمكن لأصناف غير مرتبطة تنفيذه (ويمكن للصنف تنفيذ عدة Interfaces)، وهو مثالي لحقن الاعتماديات والاختبار. واستخدم Abstract class عندما تتشارك أصناف مرتبطة حالة أو تطبيقًا وتشكّل تسلسل is-a حقيقيًا، علمًا بأن الصنف يرث من Class واحد فقط.', NULL, 'Interfaces can now have default implementations — does that change your answer?', 'أصبحت الـ Interfaces تدعم تطبيقات افتراضية، فهل يغيّر ذلك إجابتك؟'),
  (3, 'iq-cs-solid', 'CSharp', 18, 'Intermediate', 'Explain the SOLID principles with a practical example of one of them.', 'اشرح مبادئ SOLID مع مثال عملي لأحدها.', 'Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion. Example of D: OrderService depends on IEmailSender injected through its constructor instead of creating SmtpClient itself, so it can be tested with a fake and the email provider can change without touching OrderService.', 'المسؤولية الواحدة، والمفتوح/المغلق، واستبدال Liskov، وفصل الواجهات، وعكس الاعتماديات. مثال على D: تعتمد OrderService على IEmailSender المحقون عبر المُنشئ بدلًا من إنشاء SmtpClient بنفسها، فيمكن اختبارها ببديل وتغيير مزود البريد دون المساس بـ OrderService.', NULL, 'Can applying SOLID too strictly hurt a codebase?', 'هل يمكن أن يضر تطبيق SOLID بصرامة مبالغ فيها بقاعدة الكود؟'),
  (4, 'iq-cs-async-await', 'CSharp', 26, 'Intermediate', 'What does async/await do, and why shouldn''t you call .Result on a Task?', 'ماذا تفعل async/await، ولماذا لا يجب استدعاء .Result على Task؟', 'await releases the current thread while an I/O operation is in progress and resumes the method when it completes, so a server can handle many requests with few threads. .Result or .Wait() block the thread until the task finishes, wasting threads, risking thread-pool starvation and, in some contexts, deadlocks.', 'تحرر await الـ Thread الحالي أثناء تنفيذ عملية إدخال/إخراج وتستأنف الدالة عند اكتمالها، فيستطيع الخادم معالجة طلبات كثيرة بعدد قليل من الـ Threads. أما .Result أو .Wait() فتحجزان الـ Thread حتى تنتهي المهمة، مما يهدر الـ Threads ويعرّض لاستنزاف المجمّع، وقد يسبب Deadlock في بعض السياقات.', '// ✅ thread is released while SQL Server works
var orders = await db.Orders.Where(o => o.CustomerId == id).ToListAsync(ct);

// ❌ blocks a thread-pool thread for the whole call
var orders2 = db.Orders.Where(o => o.CustomerId == id).ToListAsync().Result;', 'Does async make a CPU-heavy calculation faster?', 'هل تجعل async العملية الحسابية الثقيلة أسرع؟'),
  (5, 'iq-cs-linq-deferred', 'CSharp', 25, 'Intermediate', 'What is deferred execution in LINQ?', 'ما هو التنفيذ المؤجل في LINQ؟', 'Most LINQ operators build a query that runs only when it is enumerated (foreach, ToList, Count, First). Each enumeration runs it again. With EF Core this means a database round trip per enumeration; call ToList() once when you need a snapshot.', 'تبني معظم عوامل LINQ استعلامًا لا يُنفَّذ إلا عند المرور عليه (foreach أو ToList أو Count أو First)، وكل مرور يعيد تنفيذه. ومع EF Core يعني ذلك رحلة إلى قاعدة البيانات في كل مرور، فاستدعِ ToList() مرة واحدة عندما تحتاج إلى لقطة ثابتة.', NULL, 'Which LINQ operators execute immediately?', 'أي عوامل LINQ تُنفَّذ فورًا؟'),
  (6, 'iq-cs-records', 'CSharp', 21, 'Beginner', 'What is a record and when would you use one?', 'ما هو الـ Record ومتى تستخدمه؟', 'A record is a type with value-based equality, concise positional syntax and non-destructive mutation via ''with''. It fits immutable data such as DTOs, API requests/responses and value objects (Money). Entities tracked by EF Core are usually classes because they have identity and change over time.', 'الـ Record نوع يتميز بالمساواة القائمة على القيمة، وبصياغة موضعية مختصرة، وبالتعديل غير المدمر عبر with. وهو مناسب للبيانات غير القابلة للتغيير مثل DTOs وطلبات واستجابات الـ API وكائنات القيمة (Money). أما الكيانات التي يتتبعها EF Core فعادةً ما تكون Classes لأن لها هوية وتتغير بمرور الوقت.', NULL, NULL, NULL),
  (7, 'iq-cs-exceptions', 'CSharp', 8, 'Beginner', 'What is the difference between ''throw;'' and ''throw ex;''?', 'ما الفرق بين throw; وthrow ex;؟', '''throw;'' rethrows the current exception and preserves the original stack trace. ''throw ex;'' throws the same object but resets the stack trace to the current line, hiding where the error really happened.', 'تعيد throw; رمي الاستثناء الحالي مع الحفاظ على Stack trace الأصلي، بينما ترمي throw ex; الكائن نفسه لكنها تعيد ضبط Stack trace إلى السطر الحالي، فتخفي مكان حدوث الخطأ فعلًا.', NULL, 'When is it acceptable to catch Exception?', 'متى يكون التقاط Exception مقبولًا؟'),
  (8, 'iq-cs-nullable', 'CSharp', 20, 'Beginner', 'What problem do nullable reference types solve?', 'ما المشكلة التي تحلها Nullable reference types؟', 'They make null-ability part of the type: string never null, string? may be null. The compiler warns when you might dereference null or assign null to a non-nullable reference, moving many NullReferenceExceptions from runtime to compile time.', 'تجعل قابلية القيمة لأن تكون null جزءًا من النوع: string لا يكون null أبدًا، وstring? قد يكون null. ويحذّر المترجم عند احتمال الوصول إلى null أو إسناد null إلى مرجع غير قابل لذلك، فينقل كثيرًا من استثناءات NullReferenceException من وقت التشغيل إلى وقت الترجمة.', NULL, 'What does the ! (null-forgiving) operator do, and why use it sparingly?', 'ماذا يفعل العامل ! (null-forgiving)، ولماذا يجب استخدامه باعتدال؟'),
  (9, 'iq-net-di-lifetimes', 'DotNet', 34, 'Intermediate', 'Explain Transient, Scoped and Singleton lifetimes. Which one is DbContext and why?', 'اشرح أعمار Transient وScoped وSingleton. وما عمر DbContext ولماذا؟', 'Transient: a new instance each time it is resolved. Scoped: one instance per scope — per HTTP request in ASP.NET Core. Singleton: one instance for the application''s lifetime. DbContext is Scoped: it tracks changes for one unit of work and isn''t thread-safe, so it must not be shared across requests.', 'Transient: نسخة جديدة في كل مرة تُطلب فيها الخدمة. Scoped: نسخة واحدة لكل نطاق، أي لكل طلب HTTP في ASP.NET Core. Singleton: نسخة واحدة طوال عمر التطبيق. والـ DbContext بنطاق Scoped لأنه يتتبع التغييرات لوحدة عمل واحدة وليس آمنًا مع الـ Threads، فلا يجب مشاركته بين الطلبات.', NULL, 'What is a captive dependency?', 'ما هي Captive dependency؟'),
  (10, 'iq-net-configuration', 'DotNet', 35, 'Beginner', 'How does configuration work in .NET, and where should secrets go?', 'كيف تعمل الإعدادات في .NET، وأين يجب وضع الأسرار؟', 'Configuration is layered: appsettings.json, appsettings.{Environment}.json, user secrets (Development), environment variables and command-line args — later sources override earlier ones. Bind sections to classes with the options pattern. Secrets never go in source control: use user secrets locally and environment variables or a secret store elsewhere.', 'الإعدادات طبقات: appsettings.json ثم appsettings.{Environment}.json ثم User secrets (في التطوير) ثم متغيرات البيئة ثم معاملات سطر الأوامر، والمصادر اللاحقة تتغلب على السابقة. اربط الأقسام بأصناف عبر نمط Options. ولا توضع الأسرار في إدارة الإصدارات أبدًا: استخدم User secrets محليًا ومتغيرات البيئة أو مخزن أسرار في غير ذلك.', NULL, 'What is the difference between IOptions, IOptionsSnapshot and IOptionsMonitor?', 'ما الفرق بين IOptions وIOptionsSnapshot وIOptionsMonitor؟'),
  (11, 'iq-net-garbage-collection', 'DotNet', 28, 'Intermediate', 'How does garbage collection work in .NET, and what is IDisposable for?', 'كيف يعمل جمع القمامة في .NET، وما فائدة IDisposable؟', 'The GC automatically frees managed memory for objects that are no longer reachable, using generations (0, 1, 2) because most objects die young. It doesn''t release unmanaged resources promptly (connections, file handles), so those types implement IDisposable and you release them deterministically with ''using''.', 'يحرر جامع القمامة الذاكرة المُدارة تلقائيًا للكائنات التي لم يعد الوصول إليها ممكنًا، مستخدمًا الأجيال (0 و1 و2) لأن معظم الكائنات تموت مبكرًا. لكنه لا يحرر الموارد غير المُدارة فورًا (الاتصالات ومقابض الملفات)، لذا تنفذ هذه الأنواع IDisposable وتحررها بشكل حتمي باستخدام using.', NULL, 'What happens if you forget to dispose a SqlConnection?', 'ماذا يحدث إذا نسيت التخلص من SqlConnection؟'),
  (12, 'iq-net-dotnet-vs-framework', 'DotNet', 1, 'Beginner', 'What is the difference between .NET Framework and modern .NET?', 'ما الفرق بين .NET Framework و.NET الحديثة؟', '.NET Framework is the original Windows-only runtime (4.8 is the final version, maintained but not evolving). Modern .NET (Core → 5 → 6 … 10) is open source, cross-platform, faster, released yearly, and is where all new development happens, including ASP.NET Core and EF Core.', '.NET Framework هي بيئة التشغيل الأصلية التي تعمل على Windows فقط (والإصدار 4.8 هو الأخير، ويُصان دون تطوير). أما .NET الحديثة (Core ثم 5 ثم 6 … حتى 10) فمفتوحة المصدر ومتعددة المنصات وأسرع وتصدر سنويًا، وفيها يتم كل التطوير الجديد بما في ذلك ASP.NET Core وEF Core.', NULL, 'What is an LTS release?', 'ما هو إصدار LTS؟'),
  (13, 'iq-net-logging', 'DotNet', 41, 'Intermediate', 'Why use message templates instead of string interpolation in logs?', 'لماذا تُستخدم قوالب الرسائل بدلًا من String interpolation في السجلات؟', 'With logger.LogInformation("Order {OrderId} placed", id) the value is stored as a named property, so you can search and aggregate by OrderId in structured log tools; the message isn''t formatted at all if the level is disabled. Interpolation produces a flat string and always allocates.', 'مع logger.LogInformation("Order {OrderId} placed", id) تُخزَّن القيمة كخاصية مسماة، فيمكنك البحث والتجميع حسب OrderId في أدوات السجلات المنظمة، ولا تُنسَّق الرسالة أصلًا إذا كان المستوى معطلًا. أما الـ Interpolation فينتج نصًا مسطحًا ويخصص الذاكرة دائمًا.', NULL, NULL, NULL),
  (14, 'iq-asp-pipeline', 'AspNetCore', 40, 'Intermediate', 'What is middleware, and why does the order of middleware matter?', 'ما هو الـ Middleware، ولماذا يهم ترتيبه؟', 'Middleware components form the request pipeline; each can handle the request, call the next one and act on the response. Order matters because each only sees what earlier ones allowed: exception handling must wrap everything, CORS must run before endpoints, authentication before authorization.', 'تشكّل مكونات الـ Middleware مسار الطلب، ويستطيع كل منها معالجة الطلب واستدعاء التالي والتصرف في الاستجابة. والترتيب مهم لأن كل مكون يرى فقط ما سمحت به المكونات السابقة: يجب أن تغلف معالجة الاستثناءات كل شيء، ويجب أن يعمل CORS قبل نقاط النهاية، والمصادقة قبل التفويض.', NULL, 'How would you write a custom middleware that times requests?', 'كيف تكتب Middleware مخصصًا يقيس زمن الطلبات؟'),
  (15, 'iq-asp-di-why', 'AspNetCore', 33, 'Beginner', 'Why does ASP.NET Core use dependency injection?', 'لماذا تستخدم ASP.NET Core حقن الاعتماديات؟', 'It decouples classes from concrete implementations: a controller asks for IOrderService and the container provides it with the right lifetime. This makes code testable (inject fakes), configurable in one place (Program.cs) and avoids manual object creation chains.', 'يفصل الأصناف عن التطبيقات الفعلية: تطلب وحدة التحكم IOrderService فتوفرها الحاوية بالعمر الصحيح. وهذا يجعل الكود قابلًا للاختبار (بحقن البدائل)، وقابلًا للإعداد في مكان واحد (Program.cs)، ويتجنب سلاسل الإنشاء اليدوي للكائنات.', NULL, NULL, NULL),
  (16, 'iq-asp-validation', 'AspNetCore', 37, 'Intermediate', 'How do you validate requests in an ASP.NET Core API?', 'كيف تتحقق من الطلبات في ASP.NET Core API؟', 'Use data annotations on request DTOs ([Required], [Range], [MaxLength]); with [ApiController] invalid models automatically return 400 ValidationProblemDetails. Cross-field rules use IValidatableObject (or a library like FluentValidation). Rules that need the database (unique email, stock) are checked in the service and returned as field errors or 409.', 'استخدم Data annotations على DTOs الطلبات ([Required] و[Range] و[MaxLength])، ومع [ApiController] تُرجع النماذج غير الصالحة تلقائيًا 400 مع ValidationProblemDetails. وقواعد ما بين الحقول تستخدم IValidatableObject (أو مكتبة مثل FluentValidation)، والقواعد التي تحتاج إلى قاعدة البيانات (البريد الفريد والمخزون) تُفحص في الخدمة وتُرجع كأخطاء حقول أو 409.', NULL, 'Why isn''t client-side validation enough?', 'لماذا لا يكفي التحقق في جهة العميل؟'),
  (17, 'iq-asp-authn-authz', 'AspNetCore', 43, 'Intermediate', 'What is the difference between authentication and authorization? Which status codes do they produce?', 'ما الفرق بين المصادقة والتفويض؟ وما رموز الحالة التي ينتجانها؟', 'Authentication establishes who the caller is (e.g. validating a JWT) — failing it gives 401 Unauthorized. Authorization decides whether that identity may perform the action (roles, policies, resource ownership) — failing it gives 403 Forbidden (or 404 to avoid revealing a resource exists).', 'تحدد المصادقة هوية المستدعي (مثل التحقق من JWT)، وفشلها يعطي 401 Unauthorized. ويقرر التفويض ما إذا كان يُسمح لهذه الهوية بتنفيذ الإجراء (الأدوار والسياسات وملكية المورد)، وفشله يعطي 403 Forbidden (أو 404 لتجنب كشف وجود المورد).', NULL, 'Where should you check that a user owns the order they request?', 'أين يجب التحقق من أن المستخدم يملك الطلب الذي يطلبه؟'),
  (18, 'iq-asp-error-handling', 'AspNetCore', 39, 'Intermediate', 'How do you implement consistent error handling in an API?', 'كيف تنفذ معالجة أخطاء موحدة في الـ API؟', 'Centralise it: AddProblemDetails, a custom IExceptionHandler and UseExceptionHandler. Map known exceptions to status codes (not found → 404, business rule → 409), log unexpected ones with the exception, and return RFC 7807 ProblemDetails with a traceId — never stack traces.', 'اجعلها مركزية: AddProblemDetails مع IExceptionHandler مخصص وUseExceptionHandler. حوّل الاستثناءات المعروفة إلى رموز حالة (غير موجود ← 404، وقاعدة عمل ← 409)، وسجّل غير المتوقعة مع الاستثناء، وأرجع ProblemDetails وفق RFC 7807 مع traceId، ولا ترسل Stack traces أبدًا.', NULL, NULL, NULL),
  (19, 'iq-asp-minimal-vs-controllers', 'AspNetCore', 32, 'Beginner', 'What''s the difference between controllers and minimal APIs?', 'ما الفرق بين وحدات التحكم (Controllers) وMinimal APIs؟', 'Controllers group actions in classes with attribute routing, filters and conventions — familiar and well-structured for larger APIs. Minimal APIs map lambdas directly (app.MapGet) with less ceremony and slightly better performance. Both share the same routing, DI and middleware; teams pick based on size and style.', 'تجمع وحدات التحكم الإجراءات في أصناف مع التوجيه بالسمات والمرشحات والأعراف، وهي مألوفة ومنظمة للواجهات الكبيرة. أما Minimal APIs فتربط تعابير Lambda مباشرة (app.MapGet) بمراسم أقل وأداء أفضل قليلًا. ويتشارك الاثنان التوجيه وDI والـ Middleware نفسها، وتختار الفرق حسب الحجم والأسلوب.', NULL, NULL, NULL),
  (20, 'iq-ef-tracking', 'EfCore', 54, 'Beginner', 'What does AsNoTracking do and when should you use it?', 'ماذا تفعل AsNoTracking ومتى يجب استخدامها؟', 'It tells EF Core not to add the returned entities to the change tracker. Use it for read-only queries (most GET endpoints): less memory and CPU. Don''t use it when you will modify and save the entities — changes wouldn''t be detected.', 'تخبر EF Core بعدم إضافة الكيانات المُرجعة إلى متتبع التغييرات. استخدمها لاستعلامات القراءة فقط (معظم نقاط GET) لتقليل الذاكرة والمعالج، ولا تستخدمها عندما ستعدّل الكيانات وتحفظها لأن التغييرات لن تُكتشف.', NULL, 'Is a Select projection to a DTO tracked?', 'هل يتم تتبع التحويل بـ Select إلى DTO؟'),
  (21, 'iq-ef-n-plus-one', 'EfCore', 60, 'Intermediate', 'What is the N+1 problem and how do you fix it in EF Core?', 'ما هي مشكلة N+1 وكيف تصلحها في EF Core؟', 'One query loads N parent rows, then one more query runs per row for related data — N+1 round trips. Detect it in the SQL log. Fix it with a Select projection (JOIN in SQL), Include for eager loading, or by loading related rows in one batch query.', 'يحمّل استعلام واحد N صفًا أبًا، ثم يُنفَّذ استعلام إضافي لكل صف للبيانات المرتبطة، أي N+1 رحلة. اكتشفها في سجل SQL، وأصلحها بتحويل Select (ربط JOIN في SQL)، أو Include للتحميل المسبق، أو بتحميل الصفوف المرتبطة في استعلام مجمّع واحد.', '// N+1
foreach (var o in await db.Orders.ToListAsync())
    Console.WriteLine((await db.Customers.FindAsync(o.CustomerId))!.Name);

// 1 query
var rows = await db.Orders.Select(o => new { o.Id, o.Customer.Name }).ToListAsync();', 'What is a cartesian explosion and how does AsSplitQuery help?', 'ما هو الانفجار الديكارتي وكيف تساعد AsSplitQuery؟'),
  (22, 'iq-ef-iqueryable', 'EfCore', 56, 'Intermediate', 'What is the difference between IQueryable and IEnumerable when using EF Core?', 'ما الفرق بين IQueryable وIEnumerable عند استخدام EF Core؟', 'IQueryable holds an expression tree that EF Core translates to SQL, so Where/OrderBy/Take run in the database. IEnumerable operators run in memory on already-loaded objects. Switching to IEnumerable too early (AsEnumerable, ToList, returning IEnumerable) loads all rows and filters in C#.', 'يحمل IQueryable شجرة تعبير يترجمها EF Core إلى SQL، فتعمل Where/OrderBy/Take في قاعدة البيانات. أما عوامل IEnumerable فتعمل في الذاكرة على كائنات محمّلة مسبقًا. والتحول المبكر إلى IEnumerable (AsEnumerable أو ToList أو إرجاع IEnumerable) يحمّل كل الصفوف ويصفّيها في C#.', NULL, NULL, NULL),
  (23, 'iq-ef-migrations', 'EfCore', 51, 'Beginner', 'How do EF Core migrations work, and how do you deploy them safely?', 'كيف تعمل الـ Migrations في EF Core، وكيف تنشرها بأمان؟', '''migrations add'' compares the model with the last snapshot and generates Up/Down code; ''database update'' applies pending migrations and records them in __EFMigrationsHistory. For production, review the code, generate an idempotent SQL script (migrations script --idempotent), back up first, and split destructive changes into safe steps.', 'يقارن الأمر migrations add النموذج بآخر لقطة ويولّد كود Up/Down، ويطبّق database update الـ Migrations المعلقة ويسجلها في __EFMigrationsHistory. وللإنتاج: راجع الكود، وأنشئ سكربت SQL من نوع Idempotent (migrations script --idempotent)، وخذ نسخة احتياطية أولًا، وقسّم التغييرات المدمرة إلى خطوات آمنة.', NULL, 'How do you rename a column without losing data?', 'كيف تعيد تسمية عمود دون فقدان البيانات؟'),
  (24, 'iq-ef-concurrency', 'EfCore', 58, 'Advanced', 'How does optimistic concurrency work in EF Core?', 'كيف يعمل التزامن المتفائل في EF Core؟', 'Mark a property as a concurrency token, typically [Timestamp] byte[] RowVersion mapped to SQL Server rowversion. EF adds ''WHERE RowVersion = @original'' to UPDATE/DELETE; if 0 rows are affected it throws DbUpdateConcurrencyException. The API returns 409 and the client reloads or merges.', 'علّم خاصية كرمز تزامن، وعادةً [Timestamp] byte[] RowVersion المرتبطة بـ rowversion في SQL Server. يضيف EF الشرط WHERE RowVersion = @original إلى UPDATE/DELETE، وإذا تأثر 0 صفوف يرمي DbUpdateConcurrencyException، فيُرجع الـ API الرمز 409 ويعيد العميل التحميل أو الدمج.', 'public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
}

// UPDATE [Orders] SET [Status] = @p0
// WHERE [Id] = @p1 AND [RowVersion] = @p2;   ← 0 rows → DbUpdateConcurrencyException', 'When would you choose pessimistic locking instead?', 'متى تختار القفل المتشائم بدلًا من ذلك؟'),
  (25, 'iq-ef-transactions', 'EfCore', 57, 'Intermediate', 'Is SaveChanges transactional? When do you need an explicit transaction?', 'هل SaveChanges معاملاتية؟ ومتى تحتاج إلى معاملة صريحة؟', 'Yes — one SaveChanges call wraps all its INSERT/UPDATE/DELETE statements in a transaction. You need an explicit transaction (BeginTransactionAsync) when several SaveChanges calls or raw SQL must succeed or fail together; with a retrying execution strategy, run it inside CreateExecutionStrategy().ExecuteAsync.', 'نعم، يغلّف استدعاء SaveChanges الواحد كل جمل INSERT/UPDATE/DELETE الخاصة به في معاملة. وتحتاج إلى معاملة صريحة (BeginTransactionAsync) عندما يجب أن تنجح عدة استدعاءات SaveChanges أو SQL خام معًا أو تفشل معًا، ومع استراتيجية تنفيذ تعيد المحاولة نفّذها داخل CreateExecutionStrategy().ExecuteAsync.', NULL, NULL, NULL),
  (26, 'iq-sql-index-design', 'SqlServer', 63, 'Intermediate', 'How do you decide which indexes an application needs?', 'كيف تحدد الفهارس التي يحتاجها التطبيق؟', 'Start from real queries: the columns in WHERE, JOIN and ORDER BY of frequent or slow statements (from EF logs, Query Store or missing-index DMVs). Prefer composite indexes in the right column order, include covering columns for hot list screens, index foreign keys, and weigh the write cost of every index.', 'ابدأ من الاستعلامات الحقيقية: أعمدة WHERE وJOIN وORDER BY في الجمل المتكررة أو البطيئة (من سجلات EF أو Query Store أو DMVs الفهارس المفقودة). فضّل الفهارس المركبة بترتيب الأعمدة الصحيح، وأضف أعمدة تغطية لشاشات القوائم كثيرة الاستخدام، وفهرس المفاتيح الأجنبية، ووازن تكلفة الكتابة لكل فهرس.', NULL, 'Why might WHERE YEAR(OrderDate) = 2026 not use an index?', 'لماذا قد لا يستخدم الشرط WHERE YEAR(OrderDate) = 2026 الفهرس؟'),
  (27, 'iq-sql-isolation', 'SqlServer', 66, 'Advanced', 'Compare READ COMMITTED, READ COMMITTED SNAPSHOT and SERIALIZABLE.', 'قارن بين READ COMMITTED وREAD COMMITTED SNAPSHOT وSERIALIZABLE.', 'READ COMMITTED (locking) prevents dirty reads but readers and writers can block each other. RCSI reads the last committed version from tempdb, so readers don''t block writers — great for web apps. SERIALIZABLE prevents phantoms with range locks but greatly reduces concurrency and raises deadlock risk.', 'يمنع READ COMMITTED (القائم على الأقفال) القراءات القذرة لكن القرّاء والكتّاب قد يحجبون بعضهم. ويقرأ RCSI آخر إصدار معتمد من tempdb فلا يحجب القرّاء الكتّاب، وهو ممتاز لتطبيقات الويب. أما SERIALIZABLE فيمنع الصفوف الشبحية بأقفال النطاق لكنه يقلل التزامن كثيرًا ويرفع خطر الجمود.', NULL, NULL, NULL),
  (28, 'iq-sql-injection', 'SqlServer', 70, 'Beginner', 'How do you prevent SQL injection in a .NET application?', 'كيف تمنع حقن SQL في تطبيق .NET؟', 'Never build SQL by concatenating input. Use parameters: EF Core LINQ, FromSql/SqlQuery with interpolated strings, or SqlParameter in ADO.NET. Identifiers (sort columns) can''t be parameters, so map them from an allow-list. Also run the app with a least-privilege SQL login.', 'لا تبنِ SQL بدمج المدخلات أبدًا. استخدم المعاملات: LINQ في EF Core، أو FromSql/SqlQuery مع النصوص المُدمجة، أو SqlParameter في ADO.NET. والمعرّفات (أعمدة الترتيب) لا يمكن أن تكون معاملات، فحوّلها من قائمة مسموحة. وشغّل التطبيق بحساب SQL ذي صلاحيات دنيا.', '// ❌ string concatenation
db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = ''" + name + "''");

// ✅ parameters (the interpolated value becomes @p0)
db.Products.FromSql($"SELECT * FROM Products WHERE Name = {name}");', 'Is FromSqlRaw always unsafe?', 'هل FromSqlRaw غير آمنة دائمًا؟'),
  (29, 'iq-sql-deadlock', 'SqlServer', 67, 'Advanced', 'A deadlock happens in production. How do you investigate and prevent it?', 'حدثت حالة جمود في الإنتاج. كيف تحقق فيها وتمنعها؟', 'Get the deadlock graph (system_health Extended Events), identify the two statements and the resources they locked, then trace them to application code. Typical fixes: access tables in a consistent order, keep transactions short, add indexes so fewer rows are locked, consider RCSI, and retry deadlock victims (error 1205) via the execution strategy.', 'احصل على رسم الجمود (من Extended Events في جلسة system_health)، وحدد الجملتين والموارد التي أقفلتاها، ثم تتبعهما إلى كود التطبيق. والإصلاحات المعتادة: التعامل مع الجداول بترتيب ثابت، وجعل المعاملات قصيرة، وإضافة فهارس لتقليل الصفوف المقفلة، والنظر في RCSI، وإعادة محاولة ضحايا الجمود (الخطأ 1205) عبر استراتيجية التنفيذ.', NULL, NULL, NULL),
  (30, 'iq-sql-pagination', 'SqlServer', 74, 'Intermediate', 'OFFSET/FETCH or keyset pagination — when would you use each?', 'OFFSET/FETCH أم Keyset pagination: متى تستخدم كلًا منهما؟', 'OFFSET/FETCH supports jumping to page N and is simple, but SQL Server still reads the skipped rows, so deep pages get slower. Keyset pagination (WHERE Id > @lastId ORDER BY Id) stays fast for infinite scroll, exports and APIs over large tables, but can''t jump to an arbitrary page.', 'يدعم OFFSET/FETCH القفز إلى الصفحة N وهو بسيط، لكن SQL Server يقرأ الصفوف المتخطاة فتصبح الصفحات العميقة أبطأ. أما Keyset (WHERE Id > @lastId ORDER BY Id) فيبقى سريعًا للتمرير اللانهائي والتصدير والواجهات على الجداول الكبيرة، لكنه لا يستطيع القفز إلى صفحة عشوائية.', NULL, NULL, NULL),
  (31, 'iq-sql-ef-vs-sproc', 'SqlServer', 75, 'Intermediate', 'When would you use a stored procedure instead of EF Core?', 'متى تستخدم إجراءً مخزنًا بدلًا من EF Core؟', 'EF Core is best for CRUD and business operations where rules live in testable C#. Stored procedures (or raw SQL) fit heavy set-based reporting, bulk maintenance and cases where SQL is dramatically faster or a DBA team owns the logic. Either way, call them with parameters and cover them with integration tests.', 'يناسب EF Core عمليات CRUD وعمليات العمل حيث تعيش القواعد في C# القابلة للاختبار. وتناسب الإجراءات المخزنة (أو SQL الخام) التقارير الثقيلة القائمة على المجموعات، والصيانة الجماعية، والحالات التي يكون فيها SQL أسرع بكثير أو يملك فريق قواعد البيانات المنطق. وفي الحالتين: استدعها بمعاملات وغطّها باختبارات تكامل.', NULL, NULL, NULL),
  (32, 'iq-ts-interface-vs-type', 'TypeScript', 77, 'Beginner', 'What is the difference between an interface and a type alias?', 'ما الفرق بين interface وtype alias؟', 'Both describe object shapes. Interfaces can be extended and merged (declaration merging) and read well for object contracts. Type aliases can also express unions, intersections, tuples and mapped types. Many teams use interface for objects and type for unions.', 'كلاهما يصف أشكال الكائنات. يمكن توسيع الـ Interfaces ودمجها (Declaration merging) وتُقرأ جيدًا لعقود الكائنات، بينما تستطيع Type aliases أيضًا التعبير عن الاتحادات والتقاطعات والـ Tuples والأنواع المحوّلة. وتستخدم فرق كثيرة interface للكائنات وtype للاتحادات.', NULL, NULL, NULL),
  (33, 'iq-ts-any-unknown', 'TypeScript', 86, 'Intermediate', 'What is the difference between any and unknown?', 'ما الفرق بين any وunknown؟', 'any turns type checking off — you can do anything with it, so bugs slip through. unknown means ''could be anything'' but you must narrow it (typeof, instanceof, type guards) before using it, so it''s the safe choice for external data and caught errors.', 'تعطّل any التحقق من الأنواع فيمكنك فعل أي شيء بها، فتتسرب الأخطاء. أما unknown فتعني أنها قد تكون أي شيء لكن يجب تضييقها (typeof أو instanceof أو Type guards) قبل استخدامها، لذا فهي الخيار الآمن للبيانات الخارجية والأخطاء الملتقطة.', NULL, 'What is a type guard?', 'ما هو Type guard؟'),
  (34, 'iq-ts-structural', 'TypeScript', 76, 'Intermediate', 'TypeScript is ''structurally typed''. What does that mean?', 'توصف TypeScript بأنها بنيوية الأنواع. ماذا يعني ذلك؟', 'Compatibility is based on shape, not on declared names: any object with the required properties satisfies an interface without ''implements''. C# is nominal — a class must declare the interface. Also, TypeScript types are erased at runtime, so you can''t check ''is ProductDto'' at runtime.', 'يعتمد التوافق على الشكل لا على الأسماء المعلنة: أي كائن يملك الخصائص المطلوبة يحقق الـ Interface دون implements، بينما C# اسمية فيجب أن يعلن الصنف عن الـ Interface. كما تُمحى أنواع TypeScript وقت التشغيل، فلا يمكنك التحقق من is ProductDto وقت التشغيل.', NULL, 'So how do you validate data coming from an API at runtime?', 'إذن كيف تتحقق من البيانات القادمة من الـ API وقت التشغيل؟'),
  (35, 'iq-ts-promise-observable', 'TypeScript', 83, 'Intermediate', 'Compare a Promise and an Observable.', 'قارن بين Promise وObservable.', 'A Promise is eager, resolves once and can''t be cancelled. An Observable is lazy (nothing happens until subscribed), can emit many values over time, can be cancelled by unsubscribing, and has operators (map, switchMap, debounceTime). Angular''s HttpClient returns Observables; firstValueFrom converts one-shot Observables to Promises.', 'الـ Promise فورية التنفيذ وتُحل مرة واحدة ولا يمكن إلغاؤها. أما الـ Observable فكسول (لا يحدث شيء حتى الاشتراك)، ويمكنه إطلاق قيم كثيرة عبر الزمن، ويمكن إلغاؤه بإلغاء الاشتراك، وله عوامل (map وswitchMap وdebounceTime). ويُرجع HttpClient في Angular كائنات Observable، وتحوّل firstValueFrom الـ Observables أحادية القيمة إلى Promises.', NULL, NULL, NULL),
  (36, 'iq-ts-generics', 'TypeScript', 79, 'Beginner', 'Why use generics in TypeScript? Give an example from Angular.', 'لماذا تُستخدم Generics في TypeScript؟ أعطِ مثالًا من Angular.', 'Generics let one function or type work with many types while keeping type safety. Example: http.get<ProductDto[]>(url) returns Observable<ProductDto[]>, so every use of the response is type-checked; signal<number>(0) and input<string>() work the same way.', 'تتيح Generics لدالة أو نوع واحد العمل مع أنواع كثيرة مع الحفاظ على أمان الأنواع. مثال: http.get<ProductDto[]>(url) يُرجع Observable<ProductDto[]>، فيُتحقق من نوع كل استخدام للاستجابة، وتعمل signal<number>(0) وinput<string>() بالطريقة نفسها.', NULL, NULL, NULL),
  (37, 'iq-ng-signals', 'Angular', 97, 'Intermediate', 'What are signals, and how do signal, computed and effect differ?', 'ما هي الـ Signals، وما الفرق بين signal وcomputed وeffect؟', 'Signals are reactive values that notify Angular when they change, so only the dependent parts of the UI update. signal() holds writable state; computed() derives read-only values and recalculates lazily when its dependencies change; effect() runs side effects (logging, localStorage, DOM attributes) when the signals it reads change — not for deriving state.', 'الـ Signals قيم تفاعلية تُبلغ Angular عند تغيرها، فتتحدث فقط أجزاء الواجهة المعتمدة عليها. تحمل signal() حالة قابلة للكتابة، وتشتق computed() قيمًا للقراءة فقط وتعيد حسابها عند تغير اعتمادياتها، وتنفذ effect() تأثيرات جانبية (التسجيل وlocalStorage وسمات DOM) عند تغير الـ Signals التي تقرؤها، وليست لاشتقاق الحالة.', 'const price = signal(100);
const quantity = signal(2);
const total = computed(() => price() * quantity());   // derived, read-only

effect(() => console.log(`Total is now ${total()}`)); // side effect

quantity.set(3);   // total() becomes 300 and the effect logs it', 'When would you still use RxJS?', 'متى ستظل تستخدم RxJS؟'),
  (38, 'iq-ng-standalone', 'Angular', 88, 'Beginner', 'What is a standalone component?', 'ما هو المكون المستقل (Standalone component)؟', 'A component that declares its own dependencies in its ''imports'' array instead of belonging to an NgModule. It''s the default in modern Angular, makes dependencies explicit, and enables simple lazy loading with loadComponent.', 'مكون يعلن عن اعتمادياته في مصفوفة imports الخاصة به بدلًا من الانتماء إلى NgModule. وهو الافتراضي في Angular الحديثة، ويجعل الاعتماديات صريحة، ويتيح التحميل الكسول البسيط باستخدام loadComponent.', NULL, NULL, NULL),
  (39, 'iq-ng-reactive-template-forms', 'Angular', 94, 'Intermediate', 'Reactive forms vs template-driven forms — which do you prefer and why?', 'النماذج التفاعلية مقابل النماذج المعتمدة على القوالب: أيهما تفضّل ولماذا؟', 'Reactive forms define the model in TypeScript (FormGroup/FormControl), are strongly typed, synchronous, easy to unit-test and handle dynamic forms (FormArray) and complex validation well. Template-driven forms (ngModel) are quicker for very simple forms. For business apps, reactive forms are the usual choice.', 'تعرّف النماذج التفاعلية النموذج في TypeScript (FormGroup/FormControl)، وهي محددة الأنواع ومتزامنة وسهلة الاختبار، وتتعامل جيدًا مع النماذج الديناميكية (FormArray) والتحقق المعقد. أما النماذج المعتمدة على القوالب (ngModel) فأسرع للنماذج البسيطة جدًا. وفي تطبيقات الأعمال تكون النماذج التفاعلية الخيار المعتاد.', NULL, 'How do you write a custom validator?', 'كيف تكتب متحققًا مخصصًا؟'),
  (40, 'iq-ng-switchmap', 'Angular', 96, 'Advanced', 'Why is switchMap used for search-as-you-type?', 'لماذا تُستخدم switchMap للبحث أثناء الكتابة؟', 'switchMap cancels the previous inner Observable (the in-flight HTTP request) when a new search term arrives, so only the latest request''s result is shown and slow old responses can''t overwrite newer ones. Combine it with debounceTime and distinctUntilChanged to reduce requests.', 'تلغي switchMap الـ Observable الداخلي السابق (طلب HTTP الجاري) عند وصول نص بحث جديد، فتُعرض نتيجة أحدث طلب فقط ولا تستطيع الاستجابات القديمة البطيئة الكتابة فوق الأحدث. وادمجها مع debounceTime وdistinctUntilChanged لتقليل الطلبات.', 'this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.api.search(q)),   // previous request is cancelled
).subscribe(results => this.results.set(results));', 'When would mergeMap or concatMap be the right choice instead?', 'متى تكون mergeMap أو concatMap الخيار الصحيح بدلًا منها؟'),
  (41, 'iq-ng-change-detection', 'Angular', 89, 'Advanced', 'How does Angular know when to update the view?', 'كيف تعرف Angular متى تحدّث العرض؟', 'Change detection re-evaluates template bindings. Modern Angular is zoneless by default and relies on signals: when a signal read by a template changes, Angular schedules an update for that view. Events, async pipe emissions and markForCheck also trigger it. Avoid expensive function calls in templates; use computed signals.', 'يعيد اكتشاف التغييرات تقييم الروابط في القوالب. وAngular الحديثة تعمل دون Zone.js افتراضيًا وتعتمد على الـ Signals: عندما يتغير Signal يقرؤه القالب تجدول Angular تحديثًا لذلك العرض، كما تؤدي الأحداث وإطلاقات async pipe وmarkForCheck إلى ذلك. وتجنب استدعاء الدوال المكلفة في القوالب واستخدم computed.', NULL, NULL, NULL),
  (42, 'iq-ng-component-communication', 'Angular', 99, 'Intermediate', 'How can two Angular components communicate?', 'كيف يمكن لمكونين في Angular التواصل؟', 'Parent → child with input(); child → parent with output(); two-way with model(); siblings or distant components through a shared service holding signals; across pages through route parameters and query strings. Choose the simplest one that fits.', 'من الأب إلى الابن عبر input()، ومن الابن إلى الأب عبر output()، وفي الاتجاهين عبر model()، وبين المكونات الشقيقة أو البعيدة عبر خدمة مشتركة تحمل Signals، وبين الصفحات عبر معاملات المسار وQuery strings. واختر الأبسط الذي يناسب الحالة.', NULL, NULL, NULL),
  (43, 'iq-ng-lazy-loading', 'Angular', 93, 'Beginner', 'What is lazy loading in Angular and why use it?', 'ما هو التحميل الكسول في Angular ولماذا يُستخدم؟', 'Routes defined with loadComponent: () => import(''./page'') are bundled separately and downloaded only when the user navigates there, so the initial bundle is smaller and the first page loads faster.', 'المسارات المعرّفة بـ loadComponent: () => import(''./page'') تُحزم بشكل منفصل ولا تُنزَّل إلا عند انتقال المستخدم إليها، فتصغر الحزمة الأولية ويُحمَّل أول صفحة بشكل أسرع.', NULL, NULL, NULL),
  (44, 'iq-rest-put-patch', 'RestApi', 31, 'Beginner', 'What is the difference between PUT and PATCH? What does idempotent mean?', 'ما الفرق بين PUT وPATCH؟ وماذا تعني Idempotent؟', 'PUT replaces the whole resource with the request body; PATCH applies a partial update. Idempotent means repeating the same request has the same effect as sending it once: GET, PUT and DELETE are idempotent; POST is not (it may create duplicates).', 'تستبدل PUT المورد كاملًا بمحتوى الطلب، بينما تطبّق PATCH تحديثًا جزئيًا. وتعني Idempotent أن تكرار الطلب نفسه له الأثر نفسه كإرساله مرة واحدة: GET وPUT وDELETE طلبات Idempotent، أما POST فلا (قد تنشئ تكرارات).', '### PUT replaces the whole resource (idempotent)
PUT /api/products/42
Content-Type: application/json

{ "name": "Wireless Mouse", "price": 29.9, "categoryId": 3 }

### PATCH changes only what you send
PATCH /api/products/42
Content-Type: application/json

{ "price": 24.9 }', 'How can you make order creation safe to retry?', 'كيف تجعل إنشاء الطلب آمنًا عند إعادة المحاولة؟'),
  (45, 'iq-rest-status-codes', 'RestApi', 38, 'Beginner', 'Which status codes would you return for: created, validation error, not logged in, not allowed, not found, conflict?', 'ما رموز الحالة التي تُرجعها لـ: تم الإنشاء، وخطأ تحقق، وغير مسجل دخول، وغير مسموح، وغير موجود، وتعارض؟', '201 Created (with a Location header), 400 Bad Request (validation details), 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict (business rule or concurrency). Unexpected server failures are 500.', '201 Created (مع رأس Location)، و400 Bad Request (مع تفاصيل التحقق)، و401 Unauthorized، و403 Forbidden، و404 Not Found، و409 Conflict (لقاعدة عمل أو تعارض تزامن). وأعطال الخادم غير المتوقعة تُرجع 500.', NULL, NULL, NULL),
  (46, 'iq-rest-design', 'RestApi', 31, 'Intermediate', 'Design the endpoints for cancelling an order. Is POST /api/orders/42/cancel RESTful?', 'صمّم نقاط النهاية لإلغاء طلب. هل POST /api/orders/42/cancel متوافق مع REST؟', 'Options: PATCH /api/orders/42 with { status: ''Cancelled'' }, or an action resource POST /api/orders/42/cancellation (or /cancel). Pure REST prefers state changes on the resource, but explicit action endpoints are common and clearer when the action has its own rules, side effects (restocking) and permissions. Be consistent and return 409 for invalid transitions.', 'الخيارات: PATCH /api/orders/42 مع { status: ''Cancelled'' }، أو مورد إجراء POST /api/orders/42/cancellation (أو /cancel). يفضّل REST الصرف تغيير الحالة على المورد نفسه، لكن نقاط الإجراءات الصريحة شائعة وأوضح عندما يكون للإجراء قواعده وتأثيراته الجانبية (إعادة المخزون) وصلاحياته. وكن متسقًا وأرجع 409 للانتقالات غير الصالحة.', NULL, NULL, NULL),
  (47, 'iq-rest-versioning', 'RestApi', 44, 'Intermediate', 'How do you evolve an API without breaking clients?', 'كيف تطوّر واجهة API دون كسر العملاء؟', 'Prefer additive changes (new optional fields and endpoints). Avoid renaming, removing or changing field types. When a breaking change is necessary, introduce a new version (URL segment or header), keep the old one for a deprecation period, communicate the timeline and monitor usage.', 'فضّل التغييرات الإضافية (حقول ونقاط نهاية اختيارية جديدة)، وتجنب إعادة التسمية أو الحذف أو تغيير أنواع الحقول. وعندما يكون التغيير الكاسر ضروريًا، قدّم إصدارًا جديدًا (مقطع في العنوان أو رأس)، واحتفظ بالقديم لفترة إيقاف تدريجي، وأعلن الجدول الزمني، وراقب الاستخدام.', NULL, NULL, NULL),
  (48, 'iq-rest-pagination', 'RestApi', 45, 'Beginner', 'Why paginate API responses, and what should a paged response contain?', 'لماذا تُقسَّم استجابات الـ API إلى صفحات، وماذا يجب أن تحتوي الاستجابة المقسّمة؟', 'To bound response size, memory and database work and keep the UI fast. A paged response includes the items plus page, pageSize and totalCount (or a next cursor). The server enforces a maximum page size and a deterministic sort.', 'لتقييد حجم الاستجابة والذاكرة وعمل قاعدة البيانات والحفاظ على سرعة الواجهة. وتتضمن الاستجابة المقسّمة العناصر مع page وpageSize وtotalCount (أو مؤشر Cursor للصفحة التالية). ويفرض الخادم حدًا أقصى لحجم الصفحة وترتيبًا حتميًا.', NULL, NULL, NULL),
  (49, 'iq-test-unit-integration', 'Testing', 123, 'Beginner', 'What is the difference between unit and integration tests? How many of each would you write?', 'ما الفرق بين اختبارات الوحدة واختبارات التكامل؟ وكم ستكتب من كل منها؟', 'Unit tests check one piece of logic in isolation — fast, many, precise failures. Integration tests check real components together (API + EF Core + database) — slower, fewer, catch wiring and mapping bugs. A practical mix: many unit tests for business rules, fewer API/integration tests for key workflows, very few end-to-end tests.', 'تتحقق اختبارات الوحدة من جزء منطق واحد بمعزل عن غيره، وهي سريعة وكثيرة وفشلها دقيق. وتتحقق اختبارات التكامل من مكونات حقيقية معًا (الـ API وEF Core وقاعدة البيانات)، وهي أبطأ وأقل وتكتشف أخطاء الربط والتحويل. والمزيج العملي: اختبارات وحدة كثيرة لقواعد العمل، واختبارات API وتكامل أقل لسير العمل الأساسي، واختبارات قليلة جدًا من البداية للنهاية.', NULL, NULL, NULL),
  (50, 'iq-test-mocking', 'Testing', 122, 'Intermediate', 'What are mocks, stubs and fakes? When is mocking a bad idea?', 'ما هي Mocks وStubs وFakes؟ ومتى تكون المحاكاة فكرة سيئة؟', 'A stub returns canned answers; a fake is a lightweight working implementation (in-memory repository); a mock also verifies how it was called. Over-mocking is bad when tests just restate the implementation, break on refactoring, or mock types you don''t own (e.g. DbContext) — prefer a real test database or a wrapper.', 'يُرجع الـ Stub إجابات جاهزة، والـ Fake تطبيق خفيف عامل (مستودع في الذاكرة)، والـ Mock يتحقق أيضًا من طريقة استدعائه. والإفراط في المحاكاة سيئ عندما تعيد الاختبارات صياغة التطبيق فقط، أو تنكسر عند إعادة الهيكلة، أو تحاكي أنواعًا لا تملكها (مثل DbContext)، والأفضل قاعدة بيانات اختبار حقيقية أو غلاف.', NULL, NULL, NULL),
  (51, 'iq-test-good-test', 'Testing', 117, 'Beginner', 'What makes a good unit test?', 'ما الذي يجعل اختبار الوحدة جيدًا؟', 'It is fast, isolated, deterministic (no real time, network or randomness), tests one behaviour with a descriptive name, follows Arrange–Act–Assert, uses hard-coded expected values, and fails for exactly one reason. It tests behaviour, not implementation details.', 'أن يكون سريعًا ومعزولًا وحتميًا (دون وقت حقيقي أو شبكة أو عشوائية)، ويختبر سلوكًا واحدًا باسم وصفي، ويتبع Arrange–Act–Assert، ويستخدم قيمًا متوقعة ثابتة، ويفشل لسبب واحد فقط. وأن يختبر السلوك لا تفاصيل التطبيق.', NULL, NULL, NULL),
  (52, 'iq-test-api', 'Testing', 118, 'Intermediate', 'How would you test an ASP.NET Core endpoint end to end?', 'كيف تختبر نقطة نهاية في ASP.NET Core من البداية للنهاية؟', 'Use WebApplicationFactory<Program> to host the API in memory, replace the database with a test database (SQLite in-memory or a disposable SQL Server database), seed known data, send real HTTP requests with HttpClient and assert status codes, headers and JSON bodies.', 'استخدم WebApplicationFactory<Program> لاستضافة الـ API في الذاكرة، واستبدل قاعدة البيانات بقاعدة اختبار (SQLite في الذاكرة أو قاعدة SQL Server مؤقتة)، وأدخل بيانات معروفة، وأرسل طلبات HTTP حقيقية بـ HttpClient، وتحقق من رموز الحالة والرؤوس ومحتوى JSON.', NULL, NULL, NULL),
  (53, 'iq-git-merge-rebase', 'Git', 126, 'Intermediate', 'Merge or rebase — what''s the difference and when do you use each?', 'Merge أم Rebase: ما الفرق ومتى تستخدم كلًا منهما؟', 'Merge combines histories with a merge commit and preserves what actually happened. Rebase replays your commits on top of another branch for a linear history but rewrites commit hashes. Rebase your own unshared branch to update it; never rebase commits others have based work on. Follow the team''s convention.', 'يجمع Merge السجلات مع Commit دمج ويحافظ على ما حدث فعلًا. ويعيد Rebase تطبيق Commits الخاصة بك فوق فرع آخر لسجل خطي، لكنه يعيد كتابة قيم Hash. أعد قاعدة فرعك غير المشترك لتحديثه، ولا تُعد قاعدة Commits بنى عليها الآخرون عملهم أبدًا، واتبع أعراف الفريق.', NULL, NULL, NULL),
  (54, 'iq-git-conflict', 'Git', 127, 'Beginner', 'Walk me through resolving a merge conflict.', 'اشرح لي خطوات حل تعارض الدمج.', 'Run git status to see conflicted files, open each one, understand both changes (not just pick a side), edit to the correct combined result, remove the markers, build and run tests, then git add and continue the merge or rebase. If unsure, ask the author of the other change.', 'شغّل git status لرؤية الملفات المتعارضة، وافتح كل ملف، وافهم التغييرين (لا تختر جانبًا فقط)، وعدّل للحصول على النتيجة المدمجة الصحيحة، واحذف العلامات، وابنِ وشغّل الاختبارات، ثم git add وأكمل الدمج أو إعادة القاعدة. وإن لم تكن متأكدًا فاسأل صاحب التغيير الآخر.', NULL, NULL, NULL),
  (55, 'iq-git-good-pr', 'Git', 128, 'Beginner', 'What makes a good pull request?', 'ما الذي يجعل طلب الدمج جيدًا؟', 'Small and focused; a clear description of what, why and how to test; screenshots for UI changes; tests included and passing; no unrelated changes or debug leftovers; meaningful commits; and prompt, respectful responses to review comments.', 'أن يكون صغيرًا ومركّزًا، وبوصف واضح لما تغير ولماذا وكيف يُختبر، ومع لقطات شاشة لتغييرات الواجهة، وأن يتضمن اختبارات ناجحة، ودون تغييرات غير ذات صلة أو بقايا تصحيح، وبـ Commits ذات معنى، مع ردود سريعة ومحترمة على تعليقات المراجعة.', NULL, NULL, NULL),
  (56, 'iq-git-undo', 'Git', 124, 'Intermediate', 'How do you undo a commit that has already been pushed to a shared branch?', 'كيف تتراجع عن Commit تم رفعه بالفعل إلى فرع مشترك؟', 'Use git revert <sha>, which creates a new commit that undoes the changes and keeps history intact for everyone. Avoid git reset + force-push on shared branches because it rewrites history others already have.', 'استخدم git revert <sha> الذي ينشئ Commit جديدًا يلغي التغييرات ويحافظ على السجل سليمًا للجميع، وتجنب git reset مع Force-push على الفروع المشتركة لأنه يعيد كتابة سجل يملكه الآخرون بالفعل.', 'git log --oneline          # find the bad commit, e.g. a1b2c3d
git revert a1b2c3d         # new commit that undoes it — safe on shared branches
git push', NULL, NULL),
  (57, 'iq-fs-request-flow', 'FullStackDesign', 104, 'Intermediate', 'Describe what happens from clicking ''Save'' in Angular to the row being stored in SQL Server.', 'صِف ما يحدث من النقر على زر الحفظ في Angular حتى تخزين الصف في SQL Server.', 'The component validates the reactive form and calls a service; HttpClient sends a JSON request (interceptors may add headers); the browser applies CORS; ASP.NET Core middleware runs (errors, CORS, auth); routing selects the action; model binding and validation produce a DTO; the service applies business rules and EF Core tracks changes; SaveChanges sends parameterised SQL in a transaction; the API returns 201 with a DTO; the UI updates from the response and shows feedback.', 'يتحقق المكون من النموذج التفاعلي ويستدعي خدمة، ويرسل HttpClient طلب JSON (وقد تضيف الـ Interceptors رؤوسًا)، ويطبّق المتصفح CORS، ثم يعمل الـ Middleware في ASP.NET Core (الأخطاء وCORS والمصادقة)، ويختار التوجيه الإجراء، وينتج ربط النموذج والتحقق DTO، وتطبّق الخدمة قواعد العمل ويتتبع EF Core التغييرات، وترسل SaveChanges جمل SQL بمعاملات داخل معاملة، ويُرجع الـ API الرمز 201 مع DTO، وتتحدث الواجهة من الاستجابة وتعرض تغذية راجعة.', NULL, 'Where can this flow fail, and how does the user find out?', 'أين يمكن أن يفشل هذا التدفق، وكيف يعرف المستخدم بذلك؟'),
  (58, 'iq-fs-trust-client', 'FullStackDesign', 106, 'Intermediate', 'Why should the API never trust totals or prices sent by the browser?', 'لماذا يجب ألا يثق الـ API أبدًا بالإجماليات أو الأسعار التي يرسلها المتصفح؟', 'Anything from the client can be modified with DevTools or any HTTP tool. The server must look up prices, apply discounts and calculate totals itself, validate every reference (product ids, quantities) and authorise the action. The browser may show an estimate, but the saved values come from the server.', 'يمكن تعديل أي شيء يأتي من العميل بأدوات المطورين أو بأي أداة HTTP. لذا يجب أن يبحث الخادم عن الأسعار ويطبّق الخصومات ويحسب الإجماليات بنفسه، ويتحقق من كل مرجع (معرفات المنتجات والكميات)، ويفوّض الإجراء. ويمكن للمتصفح عرض تقدير، لكن القيم المحفوظة تأتي من الخادم.', NULL, NULL, NULL),
  (59, 'iq-fs-performance', 'FullStackDesign', 140, 'Advanced', 'A page is slow. How do you find out whether the problem is in Angular, the API or SQL Server?', 'صفحة بطيئة. كيف تعرف ما إذا كانت المشكلة في Angular أم الـ API أم SQL Server؟', 'Measure from the outside in: DevTools Network shows which request is slow and its size; if requests are fast, profile rendering in the Performance tab. For a slow request, use API timing logs, then EF Core SQL logs (query count, N+1), then the execution plan, waits and blocking in SQL Server. Fix the biggest cost and measure again.', 'قِس من الخارج إلى الداخل: يُظهر تبويب Network أي طلب بطيء وما حجمه، وإذا كانت الطلبات سريعة فحلّل العرض في تبويب Performance. وللطلب البطيء استخدم سجلات توقيت الـ API، ثم سجلات SQL في EF Core (عدد الاستعلامات وN+1)، ثم خطة التنفيذ والانتظار والحجب في SQL Server. وأصلح التكلفة الأكبر ثم قِس مجددًا.', NULL, NULL, NULL),
  (60, 'iq-fs-concurrency', 'FullStackDesign', 115, 'Advanced', 'How would you design an order system so two users can''t overwrite each other''s changes or oversell stock?', 'كيف تصمم نظام طلبات بحيث لا يكتب مستخدمان فوق تغييرات بعضهما ولا يُباع مخزون أكثر من المتاح؟', 'For edits: optimistic concurrency with a rowversion carried through the DTO and a 409 Conflict the UI handles (reload/merge). For stock: atomic conditional updates (Stock = Stock - @q WHERE Stock >= @q) inside the order transaction, a CHECK constraint as the last defence, retries for transient deadlocks, and tests that simulate parallel requests.', 'للتعديلات: تزامن متفائل باستخدام rowversion ينتقل عبر الـ DTO مع استجابة 409 Conflict تتعامل معها الواجهة (إعادة التحميل أو الدمج). وللمخزون: تحديثات شرطية ذرية (Stock = Stock - @q WHERE Stock >= @q) داخل معاملة الطلب، وقيد CHECK كخط دفاع أخير، وإعادة المحاولة عند حالات الجمود المؤقتة، واختبارات تحاكي الطلبات المتوازية.', NULL, NULL, NULL),
  (61, 'iq-fs-architecture', 'FullStackDesign', 133, 'Intermediate', 'How would you structure a small full-stack application, and what would you avoid adding at the start?', 'كيف تهيكل تطبيقًا متكاملًا صغيرًا، وما الذي ستتجنب إضافته في البداية؟', 'A modular monolith: Angular organised by feature (core/shared/features), an ASP.NET Core API with thin controllers, services for business logic, DTOs and EF Core with migrations, plus tests. Avoid premature microservices, extra layers (generic repositories, CQRS/MediatR) and infrastructure until a real need appears.', 'Monolith معياري: Angular منظمة حسب الميزة (core/shared/features)، وASP.NET Core API بوحدات تحكم رفيعة، وخدمات لمنطق العمل، وDTOs، وEF Core مع Migrations، إضافة إلى الاختبارات. وتجنب الخدمات المصغرة المبكرة، والطبقات الإضافية (المستودعات العامة وCQRS/MediatR)، والبنية التحتية حتى تظهر حاجة حقيقية.', NULL, NULL, NULL)
on conflict do nothing;

-- Advance identity sequences past the explicit ids above.
select setval(pg_get_serial_sequence('public.phases', 'id'), (select max(id) from public.phases));
select setval(pg_get_serial_sequence('public.topics', 'id'), (select max(id) from public.topics));
select setval(pg_get_serial_sequence('public.resources', 'id'), (select max(id) from public.resources));
select setval(pg_get_serial_sequence('public.projects', 'id'), (select max(id) from public.projects));
select setval(pg_get_serial_sequence('public.project_milestones', 'id'), (select max(id) from public.project_milestones));
select setval(pg_get_serial_sequence('public.project_tasks', 'id'), (select max(id) from public.project_tasks));
select setval(pg_get_serial_sequence('public.portfolio_checklist_items', 'id'), (select max(id) from public.portfolio_checklist_items));
select setval(pg_get_serial_sequence('public.practice_exercises', 'id'), (select max(id) from public.practice_exercises));
select setval(pg_get_serial_sequence('public.interview_questions', 'id'), (select max(id) from public.interview_questions));
