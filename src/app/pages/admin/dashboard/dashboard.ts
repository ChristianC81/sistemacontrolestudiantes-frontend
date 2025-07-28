import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../models/Usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Estudiante } from '../../../models/Estudiante';
import { EstudianteService } from '../../../service/estudiante.service';
import { UsuarioService } from '../../../service/usuario.service';
import { AuthService } from '../../../service/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class AdminDashboard implements OnInit {
  estudiantes: Estudiante[] = [];
  usuarios: Usuario[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal states
  showEstudianteModal = false;
  showUsuarioModal = false;
  isEditMode = false;
  currentEstudianteId = '';
  currentUsuarioId = '';
  
  // Forms
  estudianteForm!: FormGroup;
  usuarioForm!: FormGroup;
  
  // Stats
  totalEstudiantes = 0;
  totalUsuarios = 0;
  
  // Tab management
  activeTab = 'estudiantes';

  constructor(
    private fb: FormBuilder,
    private estudianteService: EstudianteService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms(): void {
    this.estudianteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: [''],
      telefono: [''],
      usuarioId: ['']
    });

    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ESTUDIANTE', Validators.required]
    });
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    // Cargar estudiantes
    this.estudianteService.getAll().subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.totalEstudiantes = data.length;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar estudiantes';
        console.error(error);
      }
    });

    // Cargar usuarios
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.totalUsuarios = data.length;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar usuarios';
        this.loading = false;
        console.error(error);
      }
    });
  }

  // Estudiante CRUD operations
  openEstudianteModal(estudiante?: Estudiante): void {
    this.isEditMode = !!estudiante;
    this.currentEstudianteId = estudiante?._id || '';
    
    if (estudiante) {
      this.estudianteForm.patchValue({
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fechaNacimiento: estudiante.fechaNacimiento.split('T')[0], // Format for date input
        email: estudiante.email,
        direccion: estudiante.direccion || '',
        telefono: estudiante.telefono || '',
        usuarioId: estudiante.usuarioId || ''
      });
    } else {
      this.estudianteForm.reset();
    }
    
    this.showEstudianteModal = true;
  }

  saveEstudiante(): void {
    if (this.estudianteForm.valid) {
      this.loading = true;
      const estudianteData = this.estudianteForm.value;

      const operation = this.isEditMode 
        ? this.estudianteService.update(this.currentEstudianteId, estudianteData)
        : this.estudianteService.create(estudianteData);

      operation.subscribe({
        next: () => {
          this.successMessage = `Estudiante ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`;
          this.closeEstudianteModal();
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al guardar estudiante';
          this.loading = false;
        }
      });
    }
  }

  deleteEstudiante(id: string): void {
    if (confirm('¿Está seguro de eliminar este estudiante?')) {
      this.loading = true;
      this.estudianteService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Estudiante eliminado exitosamente';
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar estudiante';
          this.loading = false;
        }
      });
    }
  }

  closeEstudianteModal(): void {
    this.showEstudianteModal = false;
    this.estudianteForm.reset();
    this.isEditMode = false;
    this.currentEstudianteId = '';
  }

  // Usuario CRUD operations
  openUsuarioModal(usuario?: Usuario): void {
    this.isEditMode = !!usuario;
    this.currentUsuarioId = usuario?._id || '';
    
    if (usuario) {
      this.usuarioForm.patchValue({
        username: usuario.username,
        email: usuario.email,
        role: usuario.role
      });
      // Remove password requirement for edit mode
      this.usuarioForm.get('password')?.clearValidators();
    } else {
      this.usuarioForm.reset();
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    
    this.usuarioForm.get('password')?.updateValueAndValidity();
    this.showUsuarioModal = true;
  }

  saveUsuario(): void {
    if (this.usuarioForm.valid) {
      this.loading = true;
      const usuarioData = this.usuarioForm.value;

      // Remove password if empty in edit mode
      if (this.isEditMode && !usuarioData.password) {
        delete usuarioData.password;
      }

      const operation = this.isEditMode 
        ? this.usuarioService.update(this.currentUsuarioId, usuarioData)
        : this.usuarioService.create(usuarioData);

      operation.subscribe({
        next: () => {
          this.successMessage = `Usuario ${this.isEditMode ? 'actualizado' : 'creado'} exitosamente`;
          this.closeUsuarioModal();
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al guardar usuario';
          this.loading = false;
        }
      });
    }
  }

  deleteUsuario(id: string): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.loading = true;
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Usuario eliminado exitosamente';
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar usuario';
          this.loading = false;
        }
      });
    }
  }

  closeUsuarioModal(): void {
    this.showUsuarioModal = false;
    this.usuarioForm.reset();
    this.isEditMode = false;
    this.currentUsuarioId = '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // TrackBy functions for performance
  trackByEstudianteId(index: number, estudiante: Estudiante): string {
    return estudiante._id || index.toString();
  }

  trackByUsuarioId(index: number, usuario: Usuario): string {
    return usuario._id || index.toString();
  }
}