import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NestedTreeControl } from '@angular/cdk/tree';
import { AccountService } from '../../../core/services/account.service';
import { AccountHierarchy } from '../../../core/models/account.model';

@Component({
  selector: 'app-account-hierarchy',
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Chart of Accounts Hierarchy</h2>

      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="bg-transparent">
        <!-- This is the tree node template for leaf nodes -->
        <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
          <div class="flex items-center gap-2 py-1">
            <span class="font-mono text-sm text-gray-500">{{node.code}}</span>
            <span>{{node.name}}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{{node.type}}</span>
          </div>
        </mat-tree-node>

        <!-- This is the tree node template for expandable nodes -->
        <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
          <li>
            <div class="mat-tree-node">
              <button mat-icon-button matTreeNodeToggle
                      [attr.aria-label]="'Toggle ' + node.name">
                <mat-icon class="mat-icon-rtl-mirror">
                  {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
                </mat-icon>
              </button>
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm text-gray-500">{{node.code}}</span>
                <span class="font-medium">{{node.name}}</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{{node.type}}</span>
              </div>
            </div>
            <ul [class.example-tree-invisible]="!treeControl.isExpanded(node)">
              <ng-container matTreeNodeOutlet></ng-container>
            </ul>
          </li>
        </mat-nested-tree-node>
      </mat-tree>
    </div>
  `,
  styles: [`
    .example-tree-invisible {
      display: none;
    }
    .mat-tree-node {
        min-height: 2.5rem;
    }
  `]
})
export class AccountHierarchyComponent implements OnInit {
  treeControl = new NestedTreeControl<AccountHierarchy>(node => node.children);
  dataSource = new MatTreeNestedDataSource<AccountHierarchy>();

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadHierarchy();
  }

  loadHierarchy() {
    this.accountService.getAccountHierarchy().subscribe(response => {
      this.dataSource.data = response.data;
    });
  }

  hasChild = (_: number, node: AccountHierarchy) => !!node.children && node.children.length > 0;
}
