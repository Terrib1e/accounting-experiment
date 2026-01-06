import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group premium-card p-6 animate-scale-in relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
       <!-- Glossy Effect -->
       <div class="absolute -inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

       <div class="relative z-10">
           <div class="flex items-start justify-between mb-4">
              <div class="flex flex-col space-y-1">
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ title }}</p>
                 <div class="flex items-baseline space-x-2">
                    <h3 class="text-2xl font-bold text-slate-900 tracking-tight">{{ value }}</h3>
                 </div>
              </div>
              <div [class]="'h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ' + iconBgClass">
                 <span class="material-icons text-white text-lg">{{ icon }}</span>
              </div>
           </div>

           <div class="flex items-center justify-between">
              <div *ngIf="trend" [class]="'flex items-center space-x-1 ' + trendTextClass">
                <div [class]="'rounded-full p-0.5 ' + trendBgClass">
                    <span class="material-icons text-[10px] font-bold">{{ trendIcon }}</span>
                </div>
                <span class="text-xs font-bold">{{ trend }}</span>
                <span class="text-[10px] text-slate-400 font-medium ml-1">{{ trendLabel }}</span>
              </div>
           </div>

           <!-- Progress Line -->
           <div class="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div [class]="'h-full rounded-full transition-all duration-1000 ' + progressColorClass" style="width: 70%"></div>
           </div>
       </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title!: string;
  @Input() value!: string;
  @Input() icon!: string;
  @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';

  @Input() trend?: string;
  @Input() trendDirection?: 'up' | 'down';
  @Input() trendLabel: string = 'vs last period';

  get iconBgClass(): string {
    switch(this.type) {
        case 'success': return 'bg-gradient-to-br from-accent-400 to-accent-600 shadow-accent-500/20';
        case 'warning': return 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20';
        case 'danger': return 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/20';
        case 'info': return 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/20';
        default: return 'bg-gradient-to-br from-slate-400 to-slate-600';
    }
  }

  get trendTextClass(): string {
      return this.trendDirection === 'up' ? 'text-accent-600' : 'text-red-600';
  }

  get trendBgClass(): string {
    return this.trendDirection === 'up'
      ? 'bg-accent-100'
      : 'bg-red-100';
  }

  get trendIcon(): string {
      return this.trendDirection === 'up' ? 'arrow_upward' : 'arrow_downward';
  }

  get progressColorClass(): string {
    switch(this.type) {
        case 'success': return 'bg-accent-500';
        case 'warning': return 'bg-amber-500';
        case 'danger': return 'bg-red-500';
        case 'info': return 'bg-primary-500';
        default: return 'bg-slate-500';
    }
  }
}
