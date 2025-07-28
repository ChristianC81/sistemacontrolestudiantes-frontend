import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { AuthResponse, AuthVerifyResponse } from '../../models/Usuario';

const BASE_URL = environment.apiUrl || 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${BASE_URL}/auth`;

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

  // Iniciar sesión
  login(credentials: {
    username: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  // Registro de nuevo usuario
  register(data: {
    username: string;
    password: string;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Verificar token actual
  verify(): Observable<AuthVerifyResponse> {
    return this.http.get<AuthVerifyResponse>(`${this.apiUrl}/verify`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Guardar token en localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Eliminar token
  logout(): void {
    localStorage.removeItem('token');
  }

  // Verificar si hay token guardado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Guardar rol en localStorage
  saveRole(role: string): void {
    localStorage.setItem('rol', role);
  }
}
