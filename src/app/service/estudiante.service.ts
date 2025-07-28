import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Estudiante } from '../models/Estudiante';
import { environment } from '../../environments/environment.development';

const BASE_URL = environment.apiUrl || 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class EstudianteService {
  private apiUrl = `${BASE_URL}/estudiantes`;

  constructor(private http: HttpClient) {}

  // Headers con token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Headers para FormData con token (sin Content-Type)
  private getAuthHeadersForFormData(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener todos los estudiantes
  getAll(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // Obtener un estudiante por su ID
  getById(id: string): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
  // Obtener un estudiante por su ID de usuario
  getByUsuarioId(usuarioId: string) {
    return this.http.get<Estudiante>(`${this.apiUrl}/usuario/${usuarioId}`,{
      headers: this.getAuthHeaders(),
    });
  }

  // Crear un nuevo estudiante
  create(estudiante: Estudiante): Observable<any> {
    return this.http.post(this.apiUrl, estudiante, {
      headers: this.getAuthHeaders(),
    });
  }

  // Actualizar un estudiante existente
  update(id: string, estudiante: Estudiante): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, estudiante, {
      headers: this.getAuthHeaders(),
    });
  }

  // Eliminar un estudiante
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
