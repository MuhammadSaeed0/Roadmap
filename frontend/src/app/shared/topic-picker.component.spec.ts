import { TestBed } from '@angular/core/testing';
import { Phase, TopicSummary } from '../core/models';
import { TopicPickerComponent, normalize } from './topic-picker.component';

const topic = (id: number, titleEn: string, titleAr: string) => ({ id, titleEn, titleAr }) as TopicSummary;
const phases = [
  { id: 1, titleEn: 'C# Fundamentals', titleAr: 'أساسيات C#', topics: [topic(1, 'Loops', 'الحلقات التكرارية'), topic(2, 'Methods', 'الدوال')] },
  { id: 2, titleEn: 'Modern C#', titleAr: 'C# الحديثة', topics: [topic(3, 'Deferred execution', 'التنفيذ المؤجل')] },
] as Phase[];

async function render(value: number | null = null, allowAll = true) {
  const fixture = TestBed.createComponent(TopicPickerComponent);
  fixture.componentRef.setInput('phases', phases);
  fixture.componentRef.setInput('value', value);
  fixture.componentRef.setInput('allowAll', allowAll);
  fixture.componentRef.setInput('allLabel', 'All topics');
  const chosen: (number | null)[] = [];
  fixture.componentInstance.valueChange.subscribe(v => chosen.push(v));
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const input = el.querySelector('input')!;
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (k: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    await fixture.whenStable();
  };
  const options = () => [...el.querySelectorAll<HTMLElement>('[role="option"]')].map(o => o.textContent!.trim());
  return { fixture, el, input, type, key, options, chosen };
}

describe('normalize()', () => {
  it('ignores case, accents, Arabic diacritics and tatweel', () => {
    expect(normalize('Déferred')).toBe('deferred');
    expect(normalize('تَعَلّـم')).toBe('تعلم');
  });
});

describe('TopicPickerComponent', () => {
  it('shows the selected topic, or the "all" label when nothing is chosen', async () => {
    expect((await render(null)).input.value).toBe('All topics');
    expect((await render(3)).input.value).toBe('Deferred execution');
  });

  it('filters by English or Arabic title and drops empty phases', async () => {
    const p = await render();
    await p.type('deferred');
    expect(p.options()).toEqual(['Deferred execution']);
    expect(p.el.textContent).not.toContain('C# Fundamentals');

    await p.type('الحلقات');
    expect(p.options()).toEqual(['Loops']);
  });

  it('picks with the keyboard and closes', async () => {
    const p = await render();
    await p.type('e');
    expect(p.options()).toEqual(['Methods', 'Deferred execution']);
    await p.key('ArrowDown');
    await p.key('Enter');
    expect(p.chosen).toEqual([3]);
    expect(p.el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('closes with Escape without choosing', async () => {
    const p = await render(1);
    await p.type('loops');
    await p.key('Escape');
    expect(p.chosen).toEqual([]);
    expect(p.input.value).toBe('Loops');
  });
});
