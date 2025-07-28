import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
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
    
    // Si ya está logueado, redirigir según el rol
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Inicio de sesión exitoso';
          
          // Guardar token
          this.authService.saveToken(response.token);
          this.authService.saveRole(response.user.role);
          
          // Redirigir según el rol
          console.log('Response:', response);
          console.log('Usuario:', response.user);
          this.redirectByRole(response.user.role);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  redirectByRole(role?: string): void {
    // Si no viene el rol, verificar token para obtenerlo
    if (!role) {
      this.authService.verify().subscribe({
        next: (response) => {
          const userRole = response.decoded.role;
          console.log('Rol del usuario Verificado:', userRole);
          this.navigateByRole(userRole);
        },
        error: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    
    this.navigateByRole(role);
  }

  private navigateByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'estudiante':
        this.router.navigate(['/estudiante/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  navigateToRegister(): void {
    this.authService.logout(); // Elimina el token y el rol
    console.log('Redirigiendo al registro');
    this.router.navigate(['/register']);
  }

  // Getters para validación en el template
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}
