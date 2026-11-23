import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { PublicCertificate } from '../../core/models';
import { linkedInAddUrl } from './certificate-links';
import CertificatePage from './certificate.page';

const certificate: PublicCertificate = {
  code: 'K7QX2MNP4RTA', name: 'Sara Ali', phaseOrder: 3, phaseTitleEn: 'Modern C#', phaseTitleAr: 'C# الحديثة',
  topicCount: 10, issuedAt: '2026-11-23T10:00:00Z',
};

async function render(lang: 'en' | 'ar', result: Promise<PublicCertificate>): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ApiService, useValue: { certificate: (code: string) => (code === 'K7QX2MNP4RTA' ? result : Promise.reject(new Error('wrong code'))) } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ code: 'K7QX2MNP4RTA' }) } } },
    ],
  });
  TestBed.inject(I18nService).lang.set(lang);
  const fixture = TestBed.createComponent(CertificatePage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('CertificatePage', () => {
  it('shows the name, the phase and the date with the self-paced wording and no accreditation claim', async () => {
    const el = await render('en', Promise.resolve(certificate));
    const text = el.querySelector('.certificate')!.textContent!;
    expect(el.querySelector('h1')?.textContent).toBe('Sara Ali');
    expect(text).toContain('completed phase 3 of the DevPath self-paced roadmap');
    expect(text).toContain('Modern C#');
    expect(text).toContain('K7QX2MNP4RTA');
    expect(text).toContain('/c/K7QX2MNP4RTA');
    expect(text).toContain('not an accredited qualification');
    expect(text).toContain('2026');
  });

  it('has Download PDF (print), Copy link and Add to LinkedIn', async () => {
    const el = await render('en', Promise.resolve(certificate));
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('.cert-actions button')];
    buttons.find(b => b.textContent?.includes('Download PDF'))!.click();
    expect(print).toHaveBeenCalled();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    buttons.find(b => b.textContent?.includes('Copy link'))!.click();
    expect(writeText).toHaveBeenCalledWith(`${location.origin}/c/K7QX2MNP4RTA`);

    const linkedIn = el.querySelector<HTMLAnchorElement>('.cert-actions a')!;
    expect(linkedIn.textContent).toContain('Add to LinkedIn');
    expect(linkedIn.target).toBe('_blank');
    const url = new URL(linkedIn.href);
    expect(url.origin + url.pathname).toBe('https://www.linkedin.com/profile/add');
    expect(url.searchParams.get('certUrl')).toBe(`${location.origin}/c/K7QX2MNP4RTA`);
    expect(url.searchParams.get('certId')).toBe('K7QX2MNP4RTA');
  });

  it('is translated, keeping the code and link left-to-right', async () => {
    const el = await render('ar', Promise.resolve(certificate));
    const text = el.querySelector('.certificate')!.textContent!;
    expect(text).toContain('لإتمام المرحلة 3 من خارطة طريق DevPath للتعلّم الذاتي');
    expect(text).toContain('C#‎ الحديثة');   // the mark keeps "#" from flipping in Arabic
    expect(text).toContain('وليست مؤهلًا معتمدًا');
    expect(el.querySelector('.cert-meta strong[dir="ltr"]')?.textContent).toBe('K7QX2MNP4RTA');
    expect(el.querySelector('.cert-note bdi')?.getAttribute('dir')).toBe('ltr');
  });

  it('says so when the code is unknown or revoked', async () => {
    const el = await render('en', Promise.reject(new ApiError(404, 'not_found', 'Not found')));
    expect(el.querySelector('.certificate')).toBeNull();
    expect(el.textContent).toContain('Certificate not found');
  });

  it('builds the LinkedIn add-to-profile link from the certificate', () => {
    const url = new URL(linkedInAddUrl(certificate, 'DevPath roadmap — Phase 3: Modern C#', 'https://example.com/c/K7QX2MNP4RTA'));
    expect(Object.fromEntries(url.searchParams)).toEqual({
      startTask: 'CERTIFICATION_NAME', name: 'DevPath roadmap — Phase 3: Modern C#', organizationName: 'DevPath',
      issueYear: '2026', issueMonth: '11', certUrl: 'https://example.com/c/K7QX2MNP4RTA', certId: 'K7QX2MNP4RTA',
    });
  });
});
