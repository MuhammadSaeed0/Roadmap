import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApiError } from '../../core/api-error';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { createLoader } from '../../core/loader';
import { GuidedProjectDetail, GuidedStep } from '../../core/models';
import { ToastService } from '../../core/ui-services';
import { isolateLatin } from '../../shared/bidi';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, ProgressBarComponent, SkeletonComponent } from '../../shared/ui.components';
import { lessonBlocks } from '../topics/topic-tutorial.component';

/** One guided project: the brief, the steps with hints revealed one at a time, and the learner's progress. */
@Component({
  selector: 'app-guide-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './guides.css',
  imports: [RouterLink, IconComponent, TranslatePipe, CodeBlockComponent, SkeletonComponent, ErrorStateComponent, ProgressBarComponent],
  template: `
    @if (data.initialLoading() || (data.loading() && !data.value())) {
      <div class="card"><app-skeleton [rows]="2" [height]="30" /></div>
      <div class="card"><app-skeleton [rows]="8" /></div>
    } @else if (data.error()) {
      <app-error-state [error]="data.error()" (retry)="data.reload()" />
    } @else if (data.value(); as p) {
      <nav class="breadcrumb" [attr.aria-label]="'common.breadcrumb' | t">
        <a routerLink="/project-library">{{ 'guides.back' | t }}</a>
        <app-icon name="chevron-right" [size]="13" />
        <a routerLink="/project-library" [queryParams]="{ skill: p.skill }">{{ 'skills.' + p.skill | t }}</a>
      </nav>

      <header class="guide-header">
        <div class="chips">
          <span class="level-badge" [attr.data-level]="p.level">{{ 'guides.levels.' + p.level | t }}</span>
          <span class="chip">{{ 'skills.' + p.skill | t }}</span>
          <span class="chip chip-ghost"><app-icon name="clock" [size]="13" /> {{ 'guides.hours' | t: { n: p.estimatedHours } }}</span>
          <span class="chip chip-ghost">{{ 'guides.steps' | t: { n: p.steps.length } }}</span>
        </div>
        <h1 id="page-title" tabindex="-1" [innerHTML]="text(p.titleEn, p.titleAr)"></h1>
        <p class="guide-lead" [innerHTML]="text(p.summaryEn, p.summaryAr)"></p>
        <p class="guide-card-stack" dir="ltr">{{ p.techStack }}</p>
      </header>

      <div class="guide-layout">
        <div class="guide-main">
          <section class="card" aria-labelledby="brief-h" data-tour="guide-overview">
            <h2 id="brief-h" class="sr-only">{{ 'guides.goals' | t }}</h2>
            <div class="brief">
              <div>
                <h3 class="sub-head"><app-icon name="target" [size]="16" /> {{ 'guides.goals' | t }}</h3>
                <ul class="check-list" role="list">
                  @for (g of list(p.goalsEn, p.goalsAr); track $index) { <li><app-icon name="check" [size]="15" /><span [innerHTML]="g"></span></li> }
                </ul>
              </div>
              <div>
                <h3 class="sub-head"><app-icon name="format" [size]="16" /> {{ 'guides.requirements' | t }}</h3>
                <ul class="dot-list" role="list">
                  @for (r of list(p.requirementsEn, p.requirementsAr); track $index) { <li [innerHTML]="r"></li> }
                </ul>
              </div>
            </div>
          </section>

          <section class="card" aria-labelledby="steps-h" data-tour="guide-steps">
            <div class="card-head">
              <h2 id="steps-h" class="section-title"><app-icon name="route" /> {{ 'guides.stepsTitle' | t }}</h2>
              <button type="button" class="btn btn-ghost btn-sm" (click)="toggleAll(p)">
                {{ (open().size === p.steps.length ? 'guides.collapseAll' : 'guides.expandAll') | t }}
              </button>
            </div>
            <ol class="steps" role="list">
              @for (s of p.steps; track s.id) {
                @let isOpen = open().has(s.id);
                <li class="step" [class.done]="s.done" [class.open]="isOpen" [id]="'step-' + s.order">
                  <div class="step-head">
                    <button type="button" class="step-check" [class.checked]="s.done" [disabled]="busy() === s.id"
                            [attr.aria-pressed]="s.done" [attr.aria-label]="((s.done ? 'guides.markUndone' : 'guides.markDone') | t) + ': ' + i18n.pick(s.titleEn, s.titleAr)"
                            (click)="setDone(p, s, !s.done)">
                      @if (s.done) { <app-icon name="check" [size]="15" /> } @else { <span>{{ s.order }}</span> }
                    </button>
                    <button type="button" class="step-toggle" [attr.aria-expanded]="isOpen" [attr.aria-controls]="'step-body-' + s.id" (click)="toggle(s.id)">
                      <span class="step-kicker">{{ 'guides.step' | t: { n: s.order } }}</span>
                      <span class="step-title" [innerHTML]="text(s.titleEn, s.titleAr)"></span>
                      <app-icon name="chevron-down" [size]="16" class="chev" />
                    </button>
                  </div>
                  @if (isOpen) {
                    <div class="step-body" [id]="'step-body-' + s.id">
                      @for (b of blocks(s); track $index) {
                        @if (b.kind === 'p') {
                          <p>@for (sp of b.lines[0]; track $index) {@if (sp.code) {<code class="inline">{{ sp.text }}</code>} @else {<span [innerHTML]="iso(sp.text)"></span>}}</p>
                        } @else {
                          <ul>
                            @for (line of b.lines; track $index) {
                              <li>@for (sp of line; track $index) {@if (sp.code) {<code class="inline">{{ sp.text }}</code>} @else {<span [innerHTML]="iso(sp.text)"></span>}}</li>
                            }
                          </ul>
                        }
                      }
                      @if (s.code) {
                        <p class="step-label">{{ 'guides.code' | t }}</p>
                        <app-code-block [code]="s.code" [language]="s.codeLanguage" />
                      }
                      @let hints = i18n.lang() === 'ar' ? s.hintsAr : s.hintsEn;
                      @let shown = revealed()[s.id] ?? 0;
                      @if (shown > 0) {
                        <ol class="hint-list" role="list">
                          @for (h of hints.slice(0, shown); track $index) {
                            <li><span class="hint-label"><app-icon name="bulb" [size]="14" /> {{ 'guides.hintLabel' | t: { n: $index + 1 } }}</span>
                              <span [innerHTML]="iso(h)"></span></li>
                          }
                        </ol>
                      }
                      <div class="step-foot">
                        @if (shown < hints.length) {
                          <button type="button" class="btn btn-ghost btn-sm" (click)="reveal(s.id)">
                            <app-icon name="bulb" [size]="14" /> {{ 'guides.hint' | t: { n: shown + 1, total: hints.length } }}
                          </button>
                        }
                        @if (!s.done) {
                          <button type="button" class="btn btn-primary btn-sm push-end" [disabled]="busy() === s.id" (click)="setDone(p, s, true)">
                            <app-icon name="check" [size]="14" /> {{ 'guides.markDone' | t }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </li>
              }
            </ol>
          </section>

          <section class="card" aria-labelledby="done-h">
            <h2 id="done-h" class="section-title"><app-icon name="check-circle" /> {{ 'guides.acceptance' | t }}</h2>
            <ul class="check-list" role="list">
              @for (a of list(p.acceptanceEn, p.acceptanceAr); track $index) { <li><app-icon name="check" [size]="15" /><span [innerHTML]="a"></span></li> }
            </ul>
            @if (p.stretchEn.length > 0) {
              <h3 class="sub-head stretch-head"><app-icon name="flame" [size]="16" /> {{ 'guides.stretch' | t }}</h3>
              <ul class="dot-list" role="list">
                @for (x of list(p.stretchEn, p.stretchAr); track $index) { <li [innerHTML]="x"></li> }
              </ul>
            }
          </section>
        </div>

        <aside class="guide-side">
          <section class="card" aria-labelledby="gp-h" data-tour="guide-progress">
            <h2 id="gp-h" class="side-title">{{ 'guides.yourProgress' | t }}</h2>
            <p class="small">{{ 'guides.progress' | t: { done: doneCount(), total: p.steps.length } }}</p>
            <app-progress-bar [value]="percent()" [tone]="percent() >= 100 ? 'success' : 'accent'" [label]="'guides.yourProgress' | t" />
            @if (nextStep(); as n) {
              <button type="button" class="btn btn-secondary btn-block" (click)="goTo(n)">
                {{ 'guides.nextStep' | t }}: {{ n.order }}
              </button>
            } @else {
              <p class="callout callout-success small"><app-icon name="award" [size]="15" /> {{ 'guides.allDone' | t }}</p>
            }
          </section>

          @if (p.sameSkill.length > 0) {
            <section class="card" aria-labelledby="same-h">
              <h2 id="same-h" class="side-title">{{ 'guides.sameSkill' | t }}</h2>
              <ul class="side-list" role="list">
                @for (o of p.sameSkill; track o.id) {
                  <li>
                    <a [routerLink]="['/project-library', o.id]">
                      <span class="level-badge" [attr.data-level]="o.level">{{ 'guides.levels.' + o.level | t }}</span>
                      <span [innerHTML]="text(o.titleEn, o.titleAr)"></span>
                    </a>
                  </li>
                }
              </ul>
            </section>
          }
        </aside>
      </div>
    }
  `,
})
export default class GuideDetailPage {
  private readonly api = inject(ApiService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  /** Route parameter :id, bound via withComponentInputBinding(). */
  readonly id = input.required<string>();
  private readonly projectId = computed(() => Number(this.id()));

  protected readonly data = createLoader(() => this.api.guidedProject(this.projectId()), { immediate: false });
  protected readonly open = signal<ReadonlySet<number>>(new Set());
  protected readonly revealed = signal<Record<number, number>>({});
  protected readonly busy = signal<number | null>(null);

  protected readonly doneCount = computed(() => this.data.value()?.steps.filter(s => s.done).length ?? 0);
  protected readonly percent = computed(() => {
    const total = this.data.value()?.steps.length ?? 0;
    return total ? (this.doneCount() / total) * 100 : 0;
  });
  protected readonly nextStep = computed(() => this.data.value()?.steps.find(s => !s.done) ?? null);

  constructor() {
    effect(() => {
      this.projectId();
      untracked(async () => {
        this.revealed.set({});
        await this.data.reload();
        // Open the first step that isn't done yet, so the learner continues where they stopped.
        const next = this.nextStep();
        this.open.set(new Set(next ? [next.id] : []));
      });
    });
  }

  protected text(en: string, ar: string): string { return isolateLatin(this.i18n.pick(en, ar), this.i18n.lang()); }
  protected iso(value: string): string { return isolateLatin(value, this.i18n.lang()); }

  protected list(en: string[], ar: string[]): string[] {
    return (this.i18n.lang() === 'ar' ? ar : en).map(item => this.iso(item));
  }

  protected blocks(s: GuidedStep) { return lessonBlocks(this.i18n.pick(s.bodyEn, s.bodyAr)); }

  protected toggle(id: number): void {
    const next = new Set(this.open());
    if (!next.delete(id)) next.add(id);
    this.open.set(next);
  }

  protected toggleAll(p: GuidedProjectDetail): void {
    this.open.set(this.open().size === p.steps.length ? new Set() : new Set(p.steps.map(s => s.id)));
  }

  protected reveal(stepId: number): void {
    this.revealed.update(r => ({ ...r, [stepId]: (r[stepId] ?? 0) + 1 }));
  }

  protected goTo(step: GuidedStep): void {
    this.open.update(o => new Set([...o, step.id]));
    setTimeout(() => document.getElementById('step-' + step.order)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
  }

  /** Ticks a step on or off. When a step is done, it closes and the next open step opens. */
  protected async setDone(p: GuidedProjectDetail, step: GuidedStep, done: boolean): Promise<void> {
    this.busy.set(step.id);
    try {
      await this.api.setGuidedStep(p.id, step.id, done);
      this.data.update(v => ({ ...v, steps: v.steps.map(s => s.id === step.id ? { ...s, done } : s) }));
      if (done) {
        const next = this.nextStep();
        this.open.update(o => {
          const set = new Set(o);
          set.delete(step.id);
          if (next) set.add(next.id);
          return set;
        });
      }
    } catch (e) {
      this.toast.error(this.i18n.errorMessage(ApiError.from(e)));
    } finally {
      this.busy.set(null);
    }
  }
}
