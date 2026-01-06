import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <div *ngIf="error" class="bg-red-50 text-red-700 p-3 rounded text-sm">
        {{ error }}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-slate-700">First Name</label>
          <div class="mt-1">
            <input id="firstName" type="text" formControlName="firstName" required
                   class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          </div>
        </div>
        <div>
          <label for="lastName" class="block text-sm font-medium text-slate-700">Last Name</label>
          <div class="mt-1">
            <input id="lastName" type="text" formControlName="lastName" required
                   class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
          </div>
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-slate-700">Email address</label>
        <div class="mt-1">
          <input id="email" type="email" formControlName="email" required
                 class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
        <div class="mt-1">
          <input id="password" type="password" formControlName="password" required
                 class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
        </div>
      </div>

      <div>
        <button type="submit" [disabled]="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
          {{ isLoading ? 'Creating account...' : 'Create account' }}
        </button>
      </div>

      <div class="text-center text-sm">
        <span class="text-slate-600">Already have an account? </span>
        <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">Sign in</a>
      </div>
    </form>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
          // Optional: Show success message/toast
          // alert('Registration successful! Please sign in.');
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.message || 'Registration failed';
          console.error(err);
        }
      });
    }
  }
}
