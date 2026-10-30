import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/pipes';
import { TreeNode } from '../../core/workspace/workspace-files';
import { IconComponent } from '../icon.component';

export type TreeAction = { kind: 'open' | 'toggle' | 'newFile' | 'newFolder' | 'rename' | 'delete'; path: string };

/** One level of the workspace explorer; folders render their children with the same component. */
@Component({
  selector: 'app-file-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe, FileTreeComponent],
  template: `
    <ul [attr.role]="depth() === 0 ? 'tree' : 'group'" class="ide-tree">
      @for (node of nodes(); track node.path) {
        <li role="treeitem" [attr.aria-expanded]="node.folder ? expanded().has(node.path) : null"
            [attr.aria-selected]="node.path === active()">
          <div class="ide-tree-row" [class.active]="node.path === active()" [style.padding-inline-start.px]="8 + depth() * 14">
            <button type="button" class="ide-tree-name" (click)="act.emit({ kind: node.folder ? 'toggle' : 'open', path: node.path })"
                    [title]="node.path">
              <app-icon [name]="node.folder ? 'folder' : 'file'" [size]="14" />
              <span>{{ node.name }}</span>
              @if (node.folder) { <app-icon [name]="expanded().has(node.path) ? 'chevron-down' : 'chevron-right'" [size]="12" /> }
            </button>
            @if (!readonly()) {
              <span class="ide-tree-actions">
                @if (node.folder) {
                  <button type="button" class="icon-btn" (click)="act.emit({ kind: 'newFile', path: node.path })" [attr.aria-label]="('ide.newFileIn' | t: { folder: node.path })" [title]="'ide.newFile' | t"><app-icon name="plus" [size]="13" /></button>
                }
                <button type="button" class="icon-btn" (click)="act.emit({ kind: 'rename', path: node.path })" [attr.aria-label]="('ide.renameItem' | t: { name: node.path })" [title]="'ide.rename' | t"><app-icon name="edit" [size]="13" /></button>
                <button type="button" class="icon-btn" (click)="act.emit({ kind: 'delete', path: node.path })" [attr.aria-label]="('ide.deleteItem' | t: { name: node.path })" [title]="'common.delete' | t"><app-icon name="trash" [size]="13" /></button>
              </span>
            }
          </div>
          @if (node.folder && expanded().has(node.path)) {
            <app-file-tree [nodes]="node.children" [depth]="depth() + 1" [active]="active()" [expanded]="expanded()" [readonly]="readonly()" (act)="act.emit($event)" />
          }
        </li>
      }
    </ul>
  `,
})
export class FileTreeComponent {
  readonly nodes = input.required<TreeNode[]>();
  readonly depth = input(0);
  readonly active = input<string | null>(null);
  readonly expanded = input.required<Set<string>>();
  readonly readonly = input(false);
  readonly act = output<TreeAction>();
}
