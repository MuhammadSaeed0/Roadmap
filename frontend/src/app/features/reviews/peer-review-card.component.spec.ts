import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { PeerReviewCardComponent } from './peer-review-card.component';

describe('PeerReviewCardComponent', () => {
  it('asks for a review of a library project through the library endpoints', async () => {
    const api = {
      guidedReviewRequest: vi.fn(() => Promise.resolve(null)),
      projectReviewRequest: vi.fn(() => Promise.resolve(null)),
      reviewRequests: vi.fn(() => Promise.resolve({ criteria: [], open: [], requested: [], reviewing: [] })),
      requestGuidedReview: vi.fn(() => Promise.resolve({ id: 5, status: 'Open' })),
      requestReview: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: api }] });
    TestBed.inject(I18nService).lang.set('en');
    const fixture = TestBed.createComponent(PeerReviewCardComponent);
    fixture.componentRef.setInput('projectId', 12);
    fixture.componentRef.setInput('kind', 'library');
    fixture.componentRef.setInput('finished', true);
    fixture.componentRef.setInput('hasRepository', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.guidedReviewRequest).toHaveBeenCalledWith(12);
    expect(api.projectReviewRequest).not.toHaveBeenCalled();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.btn-secondary')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.requestGuidedReview).toHaveBeenCalledWith(12);
    expect(api.requestReview).not.toHaveBeenCalled();
  });
});
