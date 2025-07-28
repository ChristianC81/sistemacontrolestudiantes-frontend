import { Component, OnInit } from '@angular/core';
import { Estudiante } from '../../../models/Estudiante';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EstudianteService } from '../../../service/estudiante.service';
import { AuthService } from '../../../service/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  estudiante: Estudiante | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;

  // User info from token
  currentUser: any = null;

  // Form
  estudianteForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private estudianteService: EstudianteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getCurrentUser();
  }

  initForm(): void {
    this.estudianteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: [''],
      telefono: [''],
    });
  }

  getCurrentUser(): void {
    this.loading = true;
    this.authService.verify().subscribe({
      next: (response) => {
        this.currentUser = response.user;
        this.loadStudentProfile();
      },
      error: (error) => {
        this.errorMessage = 'Error al verificar usuario';
        this.loading = false;
        // Si hay error de autenticación, redirigir al login
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  loadStudentProfile(): void {
    if (!this.currentUser?._id) {
      this.errorMessage = 'No se pudo obtener información del usuario';
      this.loading = false;
      return;
    }

    this.estudianteService.getByUsuarioId(this.currentUser._id).subscribe({
      next: (estudiante) => {
        if (estudiante) {
          this.estudiante = estudiante;
          this.loadFormData();
        } else {
          this.errorMessage =
            'No se encontró perfil de estudiante asociado a su usuario';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar perfil del estudiante';
        this.loading = false;
        console.error(error);
      },
    });
  }

  loadFormData(): void {
    if (this.estudiante) {
      this.estudianteForm.patchValue({
        nombre: this.estudiante.nombre,
        apellido: this.estudiante.apellido,
        fechaNacimiento: this.estudiante.fechaNacimiento.split('T')[0], // Format for date input
        email: this.estudiante.email,
        direccion: this.estudiante.direccion || '',
        telefono: this.estudiante.telefono || '',
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.clearMessages();

    if (!this.isEditMode) {
      // Si cancelamos la edición, recargar los datos originales
      this.loadFormData();
    }
  }

  updateProfile(): void {
    if (this.estudianteForm.valid && this.estudiante?._id) {
      this.loading = true;
      this.clearMessages();

      const updatedData = this.estudianteForm.value;

      this.estudianteService
        .update(this.estudiante._id, updatedData)
        .subscribe({
          next: (response) => {
            this.successMessage = 'Perfil actualizado exitosamente';
            this.isEditMode = false;
            this.loading = false;

            // Actualizar los datos locales
            this.estudiante = { ...this.estudiante, ...updatedData };
          },
          error: (error) => {
            this.errorMessage =
              error.error?.message || 'Error al actualizar perfil';
            this.loading = false;
          },
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.estudianteForm.controls).forEach((key) => {
      this.estudianteForm.get(key)?.markAsTouched();
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Getters for form validation in template
  get nombre() {
    return this.estudianteForm.get('nombre');
  }
  get apellido() {
    return this.estudianteForm.get('apellido');
  }
  get fechaNacimiento() {
    return this.estudianteForm.get('fechaNacimiento');
  }
  get email() {
    return this.estudianteForm.get('email');
  }
  get direccion() {
    return this.estudianteForm.get('direccion');
  }
  get telefono() {
    return this.estudianteForm.get('telefono');
  }

  // Helper method to calculate age
  calculateAge(): number {
    if (!this.estudiante?.fechaNacimiento) return 0;

    const birthDate = new Date(this.estudiante.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
