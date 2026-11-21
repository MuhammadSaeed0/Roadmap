import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { GuideNotesComponent } from './guide-notes.component';

describe('GuideNotesComponent', () => {
  it('saves a note about one step of the library project', async () => {
    const createNote = vi.fn(() => Promise.resolve({}));
    const notes = vi.fn(() => Promise.resolve([]));
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { notes, createNote } }] });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(GuideNotesComponent);
    fixture.componentRef.setInput('projectId', 7);
    fixture.componentRef.setInput('stepCount', 4);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(notes).toHaveBeenCalledWith({ guidedProjectId: 7 });

    fixture.componentInstance.openForm(3);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const step = el.querySelector<HTMLSelectElement>('#gn-step')!;
    expect(step.options.length).toBe(5);
    const title = el.querySelector<HTMLInputElement>('#gn-title')!;
    title.value = 'Use a list';
    title.dispatchEvent(new Event('input'));
    el.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(createNote).toHaveBeenCalledWith(expect.objectContaining({ title: 'Use a list', guidedProjectId: 7, guidedStepOrder: 3 }));
  });
});
