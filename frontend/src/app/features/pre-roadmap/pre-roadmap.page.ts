import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { VideoLanguageFilter, VideoLanguageService, provideVideoLanguage } from '../../core/video-language';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent, ProgressBarComponent } from '../../shared/ui.components';
import { FIELDS, FUNDAMENTALS, INTRO, JOURNEY, JourneyStep } from './pre-roadmap.content';
import { Bilingual, CareerField, FieldCategory, Fundamental, FundamentalGroup, PreLinks, SiteLink } from './pre-roadmap.models';
import { PreFieldDetailComponent } from './pre-field-detail.component';
import { PRE_VIDEOS } from './pre-roadmap.videos';
import { PreVideosComponent } from './pre-videos.component';

const CATEGORIES: readonly FieldCategory[] = ['web', 'apps', 'data', 'systems'];
const GROUPS: readonly FundamentalGroup[] = ['thinking', 'code', 'tools', 'work'];
const UNDERSTOOD_KEY = 'devpath.preRoadmap.understood';

function readUnderstood(): ReadonlySet<string> {
  try {
    const saved = JSON.parse(localStorage.getItem(UNDERSTOOD_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

/**
 * Pre-Roadmap: everything a complete beginner should know before choosing a roadmap — what programming is,
 * the main career fields (what to learn first, skills, videos, where they continue here) and the fundamentals.
 * The content ships with the page; only the roadmap and paths are loaded, to link to them by slug.
 */
@Component({
  selector: 'app-pre-roadmap-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./pre-shared.css', './pre-roadmap.css'],
  providers: [provideVideoLanguage('preRoadmap')],
  imports: [RouterLink, IconComponent, TranslatePipe, PageHeaderComponent, ProgressBarComponent, PreVideosComponent, PreFieldDetailComponent],
  templateUrl: './pre-roadmap.page.html',
})
export default class PreRoadmapPage {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly languages = inject(VideoLanguageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly intro = INTRO;
  protected readonly journey = JOURNEY;
  protected readonly categories = CATEGORIES;
  protected readonly groups = GROUPS;
  protected readonly videos = PRE_VIDEOS;
  protected readonly introVideos = [...PRE_VIDEOS['intro'] ?? [], ...PRE_VIDEOS['choose'] ?? []];
  protected readonly languageOptions: VideoLanguageFilter[] = ['all', 'Arabic', 'English'];

  /** Signed out: the page is public, so it ends with a sign-up invitation (links into the app lead to sign-in). */
  protected readonly signedOut = computed(() => !this.auth.account());
  // Only used to turn slugs into links (public, so it works without an account); if it fails, links are simply not shown.
  private readonly catalog = createLoader(() => this.api.catalog());

  // --- Introduction ---
  protected readonly openQuestions = signal<ReadonlySet<string>>(new Set([INTRO[0].id]));

  // --- Fields ---
  protected readonly fieldSearch = signal('');
  protected readonly category = signal<FieldCategory | ''>('');
  protected readonly selectedId = signal<string | null>(this.route.snapshot.queryParamMap.get('field'));
  protected readonly fields = computed(() => {
    const q = this.fieldSearch().trim().toLowerCase();
    const cat = this.category();
    return FIELDS.filter(f => (!cat || f.category === cat) && (!q || this.fieldText(f).includes(q)));
  });
  protected readonly selected = computed(() => FIELDS.find(f => f.id === this.selectedId()) ?? null);

  // --- Fundamentals ---
  protected readonly fundamentalSearch = signal('');
  protected readonly group = signal<FundamentalGroup | ''>('');
  protected readonly openFundamentals = signal<ReadonlySet<string>>(new Set());
  protected readonly understood = signal<ReadonlySet<string>>(readUnderstood());
  protected readonly totalFundamentals = FUNDAMENTALS.length;
  protected readonly understoodCount = computed(() => FUNDAMENTALS.filter(f => this.understood().has(f.id)).length);
  protected readonly fundamentals = computed(() => {
    const q = this.fundamentalSearch().trim().toLowerCase();
    const g = this.group();
    return FUNDAMENTALS.filter(f => (!g || f.group === g) && (!q || this.bothLanguages(f.title, f.summary, f.why).includes(q)));
  });
  protected readonly allOpen = computed(() => this.fundamentals().length > 0 && this.fundamentals().every(f => this.openFundamentals().has(f.id)));

  // --- Journey: the section in view is highlighted ---
  protected readonly activeStep = signal<JourneyStep>('intro');

  private readonly phaseBySlug = computed(() => new Map((this.catalog.value()?.phases ?? []).map(p => [p.slug, p])));
  private readonly topicBySlug = computed(() => new Map((this.catalog.value()?.phases ?? []).flatMap(p => p.topics).map(t => [t.slug, t])));
  private readonly pathBySlug = computed(() => new Map((this.catalog.value()?.paths ?? []).map(p => [p.slug, p])));

  constructor() {
    afterNextRender(() => {
      if (this.selectedId()) this.scrollTo('pre-field-detail');
      this.watchSections();
    });
  }

  // --- Shared helpers ---

  protected text(value: Bilingual): string {
    return this.i18n.pick(value.en, value.ar);
  }

  /** Links to this site for a field or fundamental; ones whose slug is unknown are left out. */
  protected siteLinks(links: PreLinks): SiteLink[] {
    const out: SiteLink[] = [];
    for (const slug of links.phases ?? []) {
      const phase = this.phaseBySlug().get(slug);
      if (phase) out.push({ kind: 'phase', label: this.i18n.pick(phase.titleEn, phase.titleAr), route: ['/roadmap'], fragment: `phase-${phase.id}` });
    }
    for (const slug of links.paths ?? []) {
      const path = this.pathBySlug().get(slug);
      if (path) out.push({ kind: 'path', label: this.i18n.pick(path.nameEn, path.nameAr), route: ['/paths', String(path.id)] });
    }
    for (const slug of links.topics ?? []) {
      const topic = this.topicBySlug().get(slug);
      if (topic) out.push({ kind: 'topic', label: this.i18n.pick(topic.titleEn, topic.titleAr), route: ['/topics', String(topic.id)] });
    }
    return out;
  }

  protected setLanguage(filter: VideoLanguageFilter): void {
    this.languages.set(filter);
  }

  protected goTo(step: JourneyStep): void {
    this.activeStep.set(step);
    this.scrollTo(`pre-${step}`, true);
  }

  // --- Introduction ---

  protected isQuestionOpen(id: string): boolean { return this.openQuestions().has(id); }

  protected toggleQuestion(id: string): void {
    this.openQuestions.update(s => toggled(s, id));
  }

  // --- Fields ---

  protected setCategory(category: FieldCategory | ''): void {
    this.category.set(category);
  }

  protected clearFieldFilters(): void {
    this.fieldSearch.set('');
    this.category.set('');
  }

  protected selectField(field: CareerField): void {
    const next = this.selectedId() === field.id ? null : field.id;
    this.selectedId.set(next);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { field: next }, queryParamsHandling: 'merge', replaceUrl: true });
    if (next) setTimeout(() => this.scrollTo('pre-field-detail', true), 0);
  }

  protected closeField(): void {
    const id = this.selectedId();
    this.selectedId.set(null);
    void this.router.navigate([], { relativeTo: this.route, queryParams: { field: null }, queryParamsHandling: 'merge', replaceUrl: true });
    // Give focus back to the card that opened the details.
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(`#field-card-${id}`)?.focus(), 0);
  }

  // --- Fundamentals ---

  protected isFundamentalOpen(id: string): boolean { return this.openFundamentals().has(id); }

  protected toggleFundamental(id: string): void {
    this.openFundamentals.update(s => toggled(s, id));
  }

  protected toggleAllFundamentals(): void {
    this.openFundamentals.set(this.allOpen() ? new Set() : new Set(this.fundamentals().map(f => f.id)));
  }

  protected toggleUnderstood(fundamental: Fundamental): void {
    this.understood.update(s => toggled(s, fundamental.id));
    try { localStorage.setItem(UNDERSTOOD_KEY, JSON.stringify([...this.understood()])); } catch { /* kept for this visit only */ }
  }

  protected understoodPercent(): number {
    return Math.round((this.understoodCount() / this.totalFundamentals) * 100);
  }

  // --- Internals ---

  private fieldText(f: CareerField): string {
    return `${this.bothLanguages(f.title, f.summary, ...f.examples)} ${f.technologies.join(' ')} ${f.startWith.map(s => s.name).join(' ')}`.toLowerCase();
  }

  /** Search matches in either language, so typing an English term on the Arabic page still works. */
  private bothLanguages(...values: Bilingual[]): string {
    return values.map(v => `${v.en} ${v.ar}`).join(' ').toLowerCase();
  }

  private scrollTo(id: string, focus = false): void {
    const el = this.host.nativeElement.querySelector<HTMLElement>(`#${id}`);
    if (!el) return;
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (focus) el.focus({ preventScroll: true });
  }

  /** Highlights the journey step whose section is on screen. */
  private watchSections(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      const step = visible?.target.id.replace('pre-', '') as JourneyStep | undefined;
      if (step && (JOURNEY as readonly string[]).includes(step)) this.activeStep.set(step);
    }, { rootMargin: '-20% 0px -60% 0px' });
    for (const step of JOURNEY) {
      const el = this.host.nativeElement.querySelector(`#pre-${step}`);
      if (el) observer.observe(el);
    }
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}

function toggled(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
}
