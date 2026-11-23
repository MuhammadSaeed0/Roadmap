import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { MyCertificate } from '../../core/models';
import { MyCertificatesComponent } from './my-certificates.component';

const row = (phaseOrder: number, code: string | null): MyCertificate => ({
  phaseId: phaseOrder * 10, phaseOrder, phaseTitleEn: 'Phase ' + phaseOrder, phaseTitleAr: 'المرحلة ' + phaseOrder, topicCount: 8,
  code, issuedAt: code ? '2026-11-23T10:00:00Z' : null,
});

async function render(lang: 'en' | 'ar', list: MyCertificate[], api: Partial<ApiService> = {}): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ApiService, useValue: { myCertificates: () => Promise.resolve(list), ...api } }],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(MyCertificatesComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('MyCertificatesComponent', () => {
  it('lists issued certificates with open, copy and LinkedIn, and a get button for the rest', async () => {
    const issued: number[] = [];
    const el = await render('en', [row(1, 'K7QX2MNP4RTA'), row(2, null)], {
      issueCertificate: (phaseId: number) => { issued.push(phaseId); return Promise.resolve({ code: 'NEWCODE23456', phaseId, issuedAt: '' }); },
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const [first, second] = [...el.querySelectorAll('.cert-row')];

    expect(first.textContent).toContain('Phase 1');
    expect(first.textContent).toContain('K7QX2MNP4RTA');
    expect(first.querySelector('a[href="/c/K7QX2MNP4RTA"]')?.textContent).toContain('Open');
    const linkedIn = new URL(first.querySelector<HTMLAnchorElement>('a[target="_blank"]')!.href);
    expect(linkedIn.searchParams.get('certUrl')).toBe(`${location.origin}/c/K7QX2MNP4RTA`);

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    [...first.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.includes('Copy link'))!.click();
    expect(writeText).toHaveBeenCalledWith(`${location.origin}/c/K7QX2MNP4RTA`);

    expect(second.textContent).toContain('hasn’t been issued yet');
    second.querySelector<HTMLButtonElement>('button')!.click();
    await new Promise(r => setTimeout(r, 0));
    expect(issued).toEqual([20]);
    expect(navigate).toHaveBeenCalledWith(['/c', 'NEWCODE23456']);
  });

  it('explains how to earn one when there are none, in Arabic too', async () => {
    const el = await render('ar', []);
    expect(el.textContent).toContain('لا توجد شهادات بعد');
    expect(el.querySelector('a[href="/roadmap"]')).not.toBeNull();
  });
});
