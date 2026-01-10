import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 transition-all duration-500 hover:-translate-y-1 ' + hoverShadowClass">
       <!-- Shimmer Effect on Hover -->
       <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20"></div>

       <!-- Gradient Accent Line -->
       <div [class]="'absolute top-0 left-0 right-0 h-1 ' + gradientBarClass"></div>

       <div class="relative z-10">
          <!-- Header Row -->
          <div class="flex items-start justify-between mb-3">
             <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{{ title }}</p>
             <div [class]="'h-11 w-11 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ' + iconBgClass">
                <span class="material-icons text-white text-xl">{{ icon }}</span>
             </div>
          </div>

          <!-- Value with Animation -->
          <div class="mb-4">
             <h3 class="text-3xl font-extrabold text-slate-900 tracking-tight animate-count-up">{{ value }}</h3>
          </div>

          <!-- Sparkline Mini Chart -->
          <div class="flex items-end gap-[3px] h-8 mb-4">
            <div *ngFor="let bar of sparklineBars; let i = index"
                 [class]="'rounded-t-sm transition-all duration-300 ' + sparklineBarClass"
                 [style.height.%]="bar"
                 [style.animation-delay]="(i * 0.08) + 's'"
                 class="animate-sparkline-grow origin-bottom w-[6px] opacity-60 group-hover:opacity-100">
            </div>
          </div>

          <!-- Trend & Progress -->
          <div class="flex items-center justify-between">
             <div *ngIf="trend" [class]="'flex items-center space-x-1.5 ' + trendTextClass">
               <div [class]="'rounded-full p-0.5 ' + trendBgClass">
                   <span class="material-icons text-[10px] font-bold">{{ trendIcon }}</span>
               </div>
               <span class="text-xs font-bold">{{ trend }}</span>
               <span class="text-[10px] text-slate-400 font-medium">{{ trendLabel }}</span>
             </div>
          </div>

          <!-- Animated Progress Line -->
          <div class="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
               <div [class]="'h-full rounded-full transition-all duration-1000 group-hover:w-full ' + progressColorClass"
                    [style.width]="progressWidth + '%'"
                    style="transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
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

  // Fake sparkline data for visual effect
  sparklineBars = [35, 55, 40, 70, 45, 85, 60, 90, 75, 95, 80, 100];
  progressWidth = 70;

  get iconBgClass(): string {
    switch(this.type) {
        case 'success': return 'bg-gradient-to-br from-accent-400 to-accent-600 shadow-accent-500/30';
        case 'warning': return 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30';
        case 'danger': return 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30';
        case 'info': return 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/30';
        default: return 'bg-gradient-to-br from-slate-400 to-slate-600';
    }
  }

  get hoverShadowClass(): string {
    switch(this.type) {
        case 'success': return 'hover:shadow-stat-glow-success hover:border-accent-200/50';
        case 'warning': return 'hover:shadow-stat-glow-warning hover:border-amber-200/50';
        case 'danger': return 'hover:shadow-stat-glow-danger hover:border-red-200/50';
        case 'info': return 'hover:shadow-stat-glow-info hover:border-primary-200/50';
        default: return 'hover:shadow-card-hover';
    }
  }

  get gradientBarClass(): string {
    switch(this.type) {
        case 'success': return 'bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600';
        case 'warning': return 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600';
        case 'danger': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
        case 'info': return 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600';
        default: return 'bg-gradient-to-r from-slate-400 to-slate-600';
    }
  }

  get sparklineBarClass(): string {
    switch(this.type) {
        case 'success': return 'bg-accent-400';
        case 'warning': return 'bg-amber-400';
        case 'danger': return 'bg-red-400';
        case 'info': return 'bg-primary-400';
        default: return 'bg-slate-400';
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
        case 'success': return 'bg-gradient-to-r from-accent-400 to-accent-600';
        case 'warning': return 'bg-gradient-to-r from-amber-400 to-amber-600';
        case 'danger': return 'bg-gradient-to-r from-red-400 to-red-600';
        case 'info': return 'bg-gradient-to-r from-primary-400 to-primary-600';
        default: return 'bg-slate-500';
    }
  }
}
