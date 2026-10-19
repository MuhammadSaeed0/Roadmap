let productName: string = 'Keyboard';
const price = 49.99;               // inferred: number (there is only ONE number type)
const inStock = true;              // inferred: boolean
const tags: string[] = ['new', 'sale'];

type TopicStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Skipped';   // literal union
let status: TopicStatus = 'InProgress';
// status = 'Done';   ❌ compile error

let middleName: string | null = null;

function parse(input: unknown): number {
  if (typeof input === 'number') return input;       // narrowed
  if (typeof input === 'string') return Number(input);
  throw new Error('Unsupported value');
}
