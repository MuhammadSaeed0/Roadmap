export interface Course { id: number; title: string; description: string; }

export const COURSES: Course[] = [
  { id: 1, title: 'C# Fundamentals', description: 'Types, control flow, methods and collections.' },
  { id: 2, title: 'ASP.NET Core', description: 'Build REST APIs with controllers and dependency injection.' },
  { id: 3, title: 'Angular', description: 'Components, signals, routing and forms.' },
];
