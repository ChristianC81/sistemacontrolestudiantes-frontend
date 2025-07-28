import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Si ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.redirectToLogin();
    }
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['estudiante', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  // Custom validator for password confirmation
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword) {
      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { username, email, password, role } = this.registerForm.value;
      const userData = { username, email, password, role };

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
          
          // Esperar un momento antes de redirigir para mostrar el mensaje
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al registrar usuario';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Getters for validation in the template
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }

  // Helper method to check if passwords match
  get passwordsMatch(): boolean {
    return !this.registerForm.hasError('passwordMismatch');
  }
}