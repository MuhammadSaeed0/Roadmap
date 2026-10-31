import { WorkspaceFile, WorkspaceKind } from '../models';

export interface WorkspaceTemplate {
  key: string;
  kind: WorkspaceKind;
  nameEn: string; nameAr: string;
  descriptionEn: string; descriptionAr: string;
  files: WorkspaceFile[];
  /** SQL: the sample database it opens with ('' = an empty database). */
  dataset?: string;
  /** The file opened first. */
  entry: string;
}

const f = (path: string, content: string): WorkspaceFile => ({ path, content: content.replace(/^\n/, '') });

// ---------- C# ----------

const csConsole: WorkspaceTemplate = {
  key: 'csharp-console', kind: 'CSharp', entry: 'Program.cs',
  nameEn: 'Console app', nameAr: 'تطبيق Console',
  descriptionEn: 'Top-level statements: write code and run it.', descriptionAr: 'تعليمات من المستوى الأعلى: اكتب الكود وشغّله مباشرة.',
  files: [f('Program.cs', `
// Write C# here and press Run (Ctrl+Enter). Console.ReadLine() reads from the "Input" box.
Console.WriteLine("Hello, DevPath!");

var name = Console.ReadLine() ?? "friend";
Console.WriteLine($"Nice to meet you, {name}.");

int[] scores = [72, 95, 88, 64];
Console.WriteLine($"Average: {scores.Average():0.0}");
`)],
};

const csOop: WorkspaceTemplate = {
  key: 'csharp-oop', kind: 'CSharp', entry: 'Program.cs',
  nameEn: 'Object-oriented project', nameAr: 'مشروع برمجة كائنية',
  descriptionEn: 'Classes in separate files: an abstract base class, inheritance and an interface.',
  descriptionAr: 'أصناف في ملفات منفصلة: صنف أساسي مجرد، ووراثة، وواجهة.',
  files: [
    f('Program.cs', `
using Shop.Models;
using Shop.Services;

var cart = new Cart();
cart.Add(new Product("Keyboard", 49.99m), 1);
cart.Add(new Product("Mouse", 15.99m), 2);

IDiscount discount = new PercentageDiscount(10);
Console.WriteLine($"Items: {cart.Count}");
Console.WriteLine($"Subtotal: {cart.Subtotal:0.00}");
Console.WriteLine($"Total after {discount.Description}: {discount.Apply(cart.Subtotal):0.00}");
`),
    f('Models/Product.cs', `
namespace Shop.Models;

public record Product(string Name, decimal Price);
`),
    f('Models/Cart.cs', `
namespace Shop.Models;

public class Cart
{
    private readonly List<(Product Product, int Quantity)> _lines = [];

    public int Count => _lines.Sum(l => l.Quantity);
    public decimal Subtotal => _lines.Sum(l => l.Product.Price * l.Quantity);

    public void Add(Product product, int quantity)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be positive.");
        _lines.Add((product, quantity));
    }
}
`),
    f('Services/IDiscount.cs', `
namespace Shop.Services;

public interface IDiscount
{
    string Description { get; }
    decimal Apply(decimal amount);
}

public class PercentageDiscount(int percent) : IDiscount
{
    public string Description => $"{percent}% off";
    public decimal Apply(decimal amount) => amount * (100 - percent) / 100m;
}
`),
  ],
};

const csLinq: WorkspaceTemplate = {
  key: 'csharp-linq', kind: 'CSharp', entry: 'Program.cs',
  nameEn: 'LINQ practice', nameAr: 'تدريب LINQ',
  descriptionEn: 'An in-memory list of employees to filter, sort, group and summarise.',
  descriptionAr: 'قائمة موظفين في الذاكرة لتصفيتها وترتيبها وتجميعها وتلخيصها.',
  files: [
    f('Program.cs', `
var employees = Data.Employees();

// 1. Filter and sort
var engineers = employees.Where(e => e.Department == "Engineering").OrderByDescending(e => e.Salary);
foreach (var e in engineers) Console.WriteLine($"{e.Name,-15} {e.Salary,8:N0}");

// 2. Group and summarise
Console.WriteLine();
foreach (var group in employees.GroupBy(e => e.Department).OrderBy(g => g.Key))
    Console.WriteLine($"{group.Key,-12} {group.Count()} people, average {group.Average(e => e.Salary):N0}");

// Try: who joined after 2022? What is the highest salary in each department?
`),
    f('Data.cs', `
public record Employee(string Name, string Department, decimal Salary, DateOnly HireDate);

public static class Data
{
    public static List<Employee> Employees() =>
    [
        new("Salma Fouad", "Engineering", 41000, new DateOnly(2019, 6, 15)),
        new("Mahmoud Zaki", "Engineering", 30000, new DateOnly(2021, 9, 1)),
        new("Khaled Osman", "Engineering", 21000, new DateOnly(2024, 3, 4)),
        new("Aya Mahmoud", "Sales", 29000, new DateOnly(2020, 5, 5)),
        new("Mostafa Ibrahim", "Sales", 18500, new DateOnly(2023, 2, 27)),
        new("Ola Wagdy", "Marketing", 39000, new DateOnly(2019, 1, 21)),
        new("Marwa Lotfy", "Marketing", 24000, new DateOnly(2021, 3, 29)),
        new("Heba Sobhy", "Finance", 23000, new DateOnly(2022, 5, 16)),
    ];
}
`),
  ],
};

const csAsync: WorkspaceTemplate = {
  key: 'csharp-async', kind: 'CSharp', entry: 'Program.cs',
  nameEn: 'Async and tests', nameAr: 'البرمجة غير المتزامنة والاختبارات',
  descriptionEn: 'async/await with Task.WhenAll, plus a class with [Test] methods you can run.',
  descriptionAr: 'استخدام async/await مع Task.WhenAll، وصنف فيه دوال [Test] يمكنك تشغيلها.',
  files: [
    f('Program.cs', `
var watch = System.Diagnostics.Stopwatch.StartNew();
var prices = await Task.WhenAll(PriceService.GetPriceAsync("keyboard"), PriceService.GetPriceAsync("mouse"));
Console.WriteLine($"Prices: {string.Join(", ", prices)} in about {watch.ElapsedMilliseconds} ms (in parallel)");
`),
    f('PriceService.cs', `
public static class PriceService
{
    private static readonly Dictionary<string, decimal> Prices = new() { ["keyboard"] = 49.99m, ["mouse"] = 15.99m };

    public static async Task<decimal> GetPriceAsync(string product)
    {
        await Task.Delay(300); // pretend this is a web request
        return Prices.TryGetValue(product, out var price) ? price : throw new KeyNotFoundException(product);
    }
}
`),
  ],
};

// ---------- SQL ----------

const sqlTemplate = (dataset: 'shop' | 'hr' | 'school', nameEn: string, nameAr: string, descEn: string, descAr: string, query: string): WorkspaceTemplate => ({
  key: `sql-${dataset}`, kind: 'Sql', dataset, entry: 'query.sql', nameEn, nameAr, descriptionEn: descEn, descriptionAr: descAr,
  files: [f('query.sql', query)],
});

const sqlShop = sqlTemplate('shop', 'Online shop', 'متجر إلكتروني',
  'Categories, products, customers, orders and order lines.', 'التصنيفات والمنتجات والعملاء والطلبات وأسطر الطلبات.', `
-- Run the whole file with Ctrl+Enter, or select a statement and run just that.
-- The tables are listed in the Database panel; Reset brings the sample data back.

SELECT TOP 5 Name, Price, Stock
FROM Products
WHERE IsActive = 1
ORDER BY Price DESC;

SELECT c.Name AS Category, COUNT(p.Id) AS Products, ROUND(AVG(p.Price), 2) AS AveragePrice
FROM Categories c
LEFT JOIN Products p ON p.CategoryId = c.Id
GROUP BY c.Name
ORDER BY Products DESC;
`);

const sqlHr = sqlTemplate('hr', 'Company HR', 'الموارد البشرية لشركة',
  'Departments, employees with managers, projects and assignments.', 'الأقسام، والموظفون ومديروهم، والمشروعات والتكليفات.', `
-- Who works for whom? A self-join on Employees.
SELECT e.FirstName + ' ' + e.LastName AS Employee, m.FirstName AS Manager
FROM Employees e
LEFT JOIN Employees m ON m.Id = e.ManagerId;
-- Note: SQL Server joins text with +, SQLite (this engine) uses ||. Try: e.FirstName || ' ' || e.LastName

SELECT d.Name, COUNT(*) AS People, MAX(e.Salary) AS TopSalary
FROM Departments d
JOIN Employees e ON e.DepartmentId = d.Id
GROUP BY d.Name;
`);

const sqlSchool = sqlTemplate('school', 'School', 'مدرسة',
  'Students, teachers, courses and enrollments with grades.', 'الطلاب والمعلمون والمقررات والتسجيلات مع الدرجات.', `
SELECT s.Name, c.Title, en.Grade
FROM Enrollments en
JOIN Students s ON s.Id = en.StudentId
JOIN Courses c ON c.Id = en.CourseId
WHERE en.Grade IS NOT NULL
ORDER BY en.Grade DESC;
`);

const sqlEmpty: WorkspaceTemplate = {
  key: 'sql-empty', kind: 'Sql', dataset: '', entry: 'schema.sql',
  nameEn: 'Empty database', nameAr: 'قاعدة بيانات فارغة',
  descriptionEn: 'Design your own tables from scratch.', descriptionAr: 'صمّم جداولك بنفسك من البداية.',
  files: [f('schema.sql', `
CREATE TABLE Books (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Author NVARCHAR(100) NOT NULL,
    Year INT CHECK (Year > 1400)
);

INSERT INTO Books (Title, Author, Year) VALUES
    (N'Clean Code', N'Robert C. Martin', 2008),
    (N'The Pragmatic Programmer', N'Andrew Hunt', 1999);

SELECT * FROM Books;
`)],
};

// ---------- JavaScript / TypeScript / Web ----------

const js: WorkspaceTemplate = {
  key: 'javascript', kind: 'JavaScript', entry: 'main.js',
  nameEn: 'JavaScript', nameAr: 'JavaScript',
  descriptionEn: 'Plain JavaScript with console output.', descriptionAr: 'JavaScript عادي مع مخرجات في الـ Console.',
  files: [f('main.js', `
const products = [
  { name: 'Keyboard', price: 49.99, stock: 25 },
  { name: 'Mouse', price: 15.99, stock: 0 },
  { name: 'Monitor', price: 249, stock: 12 },
];

const inStock = products.filter(p => p.stock > 0).map(p => p.name);
console.log('In stock:', inStock);

const total = products.reduce((sum, p) => sum + p.price, 0);
console.log(\`Total of all prices: \${total.toFixed(2)}\`);
`)],
};

const ts: WorkspaceTemplate = {
  key: 'typescript', kind: 'TypeScript', entry: 'main.ts',
  nameEn: 'TypeScript', nameAr: 'TypeScript',
  descriptionEn: 'Types, interfaces and generics, with live type checking.', descriptionAr: 'الأنواع والواجهات والأنواع العامة، مع فحص فوري للأنواع.',
  files: [f('main.ts', `
interface Product {
  name: string;
  price: number;
  tags?: string[];
}

function cheapest<T extends { price: number }>(items: T[]): T | undefined {
  return [...items].sort((a, b) => a.price - b.price)[0];
}

const products: Product[] = [
  { name: 'Keyboard', price: 49.99, tags: ['input'] },
  { name: 'Mouse', price: 15.99 },
];

console.log('Cheapest:', cheapest(products)?.name);
// Try: add { name: 'Cable' } without a price and read the error the editor shows.
`)],
};

const web: WorkspaceTemplate = {
  key: 'web', kind: 'Web', entry: 'index.html',
  nameEn: 'HTML, CSS and JavaScript', nameAr: 'HTML وCSS وJavaScript',
  descriptionEn: 'A web page with a live preview.', descriptionAr: 'صفحة ويب مع معاينة مباشرة.',
  files: [
    f('index.html', `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main>
    <h1>Counter</h1>
    <p>You clicked <strong id="count">0</strong> times.</p>
    <button id="add">Click me</button>
  </main>
  <script src="script.js"></script>
</body>
</html>
`),
    f('styles.css', `
body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #f4f6fb; }
main { background: white; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 4px 16px rgb(0 0 0 / 0.08); text-align: center; }
button { font: inherit; padding: 0.5rem 1.25rem; border-radius: 8px; border: 0; background: #4f46e5; color: white; cursor: pointer; }
`),
    f('script.js', `
let count = 0;
document.getElementById('add').addEventListener('click', () => {
  count++;
  document.getElementById('count').textContent = count;
  console.log('Clicked', count);
});
`),
  ],
};

// ---------- Angular ----------

const angular: WorkspaceTemplate = {
  key: 'angular', kind: 'Angular', entry: 'src/app/app.component.ts',
  nameEn: 'Angular app', nameAr: 'تطبيق Angular',
  descriptionEn: 'A standalone Angular app: components, a service, routing and signals.',
  descriptionAr: 'تطبيق Angular مستقل: مكونات وخدمة وتوجيه وSignals.',
  files: [
    f('src/index.html', `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Tasks</title></head>
<body>
  <app-root></app-root>
</body>
</html>
`),
    f('src/main.ts', `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
`),
    f('src/styles.css', `
body { font-family: system-ui, sans-serif; margin: 0; background: #f6f7fb; color: #1f2937; }
`),
    f('src/environments/environment.ts', `
export const environment = {
  production: false,
  appName: 'Task board',
};
`),
    f('src/assets/.keep', ''),
    f('src/app/app.config.ts', `
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  // Hash URLs (#/about) keep navigation inside the preview.
  providers: [provideRouter(routes, withHashLocation())],
};
`),
    f('src/app/app.routes.ts', `
import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'about', component: AboutComponent },
];
`),
    f('src/app/app.component.ts', `
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = environment.appName;
}
`),
    f('src/app/app.component.html', `
<header>
  <h1>{{ title }}</h1>
  <nav><a routerLink="/">Tasks</a> · <a routerLink="/about">About</a></nav>
</header>
<router-outlet />
`),
    f('src/app/app.component.css', `
header { display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; background: #4f46e5; color: white; }
header a { color: white; }
`),
    f('src/app/models/task.ts', `
export interface Task {
  id: number;
  title: string;
  done: boolean;
}
`),
    f('src/app/services/task.service.ts', `
import { Injectable, computed, signal } from '@angular/core';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly items = signal<Task[]>([
    { id: 1, title: 'Read about signals', done: true },
    { id: 2, title: 'Build a component', done: false },
  ]);

  readonly tasks = this.items.asReadonly();
  readonly remaining = computed(() => this.items().filter(t => !t.done).length);

  add(title: string): void {
    const id = Math.max(0, ...this.items().map(t => t.id)) + 1;
    this.items.update(list => [...list, { id, title, done: false }]);
  }

  toggle(id: number): void {
    this.items.update(list => list.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }
}
`),
    f('src/app/components/task-list/task-list.component.ts', `
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TaskListComponent {
  readonly tasks = inject(TaskService);
  newTitle = '';

  add(): void {
    const title = this.newTitle.trim();
    if (!title) return;
    this.tasks.add(title);
    this.newTitle = '';
  }
}
`),
    f('src/app/components/task-list/task-list.component.html', `
<section>
  <p>{{ tasks.remaining() }} task(s) left</p>
  <form (ngSubmit)="add()">
    <input name="title" [(ngModel)]="newTitle" placeholder="New task">
    <button type="submit">Add</button>
  </form>
  <ul>
    @for (task of tasks.tasks(); track task.id) {
      <li [class.done]="task.done" (click)="tasks.toggle(task.id)">{{ task.title }}</li>
    } @empty {
      <li>No tasks yet.</li>
    }
  </ul>
</section>
`),
    f('src/app/components/task-list/task-list.component.css', `
section { padding: 1.5rem; }
li { cursor: pointer; padding: 0.25rem 0; }
.done { text-decoration: line-through; color: #9ca3af; }
`),
    f('src/app/components/about/about.component.ts', `
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: '<section style="padding: 1.5rem">A small Angular app running in your browser.</section>',
})
export class AboutComponent {}
`),
  ],
};

export const TEMPLATES: WorkspaceTemplate[] = [csConsole, csOop, csLinq, csAsync, sqlShop, sqlHr, sqlSchool, sqlEmpty, js, ts, web, angular];

export function templatesFor(kind: WorkspaceKind): WorkspaceTemplate[] {
  return TEMPLATES.filter(t => t.kind === kind);
}

export function templateByKey(key: string | null | undefined): WorkspaceTemplate | undefined {
  return TEMPLATES.find(t => t.key === key);
}
