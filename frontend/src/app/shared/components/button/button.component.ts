import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="classes"
      (click)="handleOnClick($event)">

      <span *ngIf="loading" class="material-icons animate-spin text-lg mr-2">refresh</span>
      <span *ngIf="icon && !loading" class="material-icons text-lg mr-2">{{ icon }}</span>
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'glass' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;

  @Output() onClick = new EventEmitter<Event>();

  handleOnClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }

  get classes(): string {
    const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 uppercase tracking-widest';

    const sizes: { [key: string]: string } = {
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-6 py-3 text-[11px]',
      lg: 'px-8 py-4 text-xs',
    };

    const variants: { [key: string]: string } = {
      primary: 'bg-primary-600 text-white shadow-primary-glow hover:bg-primary-500 hover:shadow-primary-glow/60',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm',
      danger: 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600',
      outline: 'border-2 border-slate-200 text-slate-700 bg-transparent hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50/10',
      ghost: 'text-slate-500 hover:text-primary-600 hover:bg-primary-50/50',
      glass: 'glass-button text-white',
    };

    return `${base} ${sizes[this.size]} ${variants[this.variant]}`;
  }
}
