import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18nService } from '../core/i18n/i18n.service';
import { ProjectPlacesComponent, ProjectPlace } from './project-places.component';

function render(current: ProjectPlace, lang: 'en' | 'ar' = 'en'): HTMLElement {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(ProjectPlacesComponent);
  fixture.componentRef.setInput('current', current);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('ProjectPlacesComponent', () => {
  it('says what the current page is for and links to the other two places', () => {
    const el = render('library');
    expect(el.textContent).toContain('Project library:');
    const links = [...el.querySelectorAll('a')].map(a => a.getAttribute('href'));
    expect(links).toEqual(['/projects', '/practice']);
  });

  it('is translated', () => {
    const el = render('projects', 'ar');
    expect(el.textContent).toContain('المشاريع الرئيسية:');
    expect([...el.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['/project-library', '/practice']);
  });
});
