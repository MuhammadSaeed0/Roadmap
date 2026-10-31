import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/pipes';
import { SqlResultSet } from '../../core/runners/runner-host.service';

/** Query results as accessible tables, one per result set. */
@Component({
  selector: 'app-sql-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @for (set of results(); track $index; let i = $index) {
      <div class="sql-result">
        <p class="small muted">{{ 'ide.resultSet' | t: { n: i + 1, rows: set.rows.length } }}@if (set.truncated) { · {{ 'ide.truncatedRows' | t }} }</p>
        <div class="sql-table-wrap" tabindex="0" [attr.aria-label]="'ide.resultSet' | t: { n: i + 1, rows: set.rows.length }">
          <table class="sql-table">
            <thead><tr><th scope="col" class="sql-rownum">#</th>@for (c of set.columns; track $index; let c2 = $index) { <th scope="col" [class.sql-num]="numeric()[i][c2]">{{ c }}</th> }</tr></thead>
            <tbody>
              @for (row of set.rows; track $index; let r = $index) {
                <tr>
                  <td class="sql-rownum">{{ r + 1 }}</td>
                  @for (cell of row; track $index; let c2 = $index) {
                    <td [class.sql-null]="cell === null" [class.sql-num]="numeric()[i][c2]">{{ cell === null ? 'NULL' : cell }}</td>
                  }
                </tr>
              } @empty {
                <tr><td [attr.colspan]="set.columns.length + 1" class="muted">{{ 'ide.noRows' | t }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class SqlResultsComponent {
  readonly results = input.required<SqlResultSet[]>();

  /**
   * Alignment is decided per column, so a header lines up with its values: a column whose values are all numbers
   * (NULLs aside) is right-aligned, header included; any other column is left-aligned throughout.
   */
  protected readonly numeric = computed(() => this.results().map(set => set.columns.map((_, c) =>
    set.rows.some(row => typeof row[c] === 'number') && set.rows.every(row => row[c] === null || typeof row[c] === 'number'))));
}
