import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/Usuario';


const BASE_URL = environment.apiUrl || 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${BASE_URL}/usuarios`;

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
  // Obtener todos los usuarios
  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // Obtener un usuario por ID
  getById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Crear un nuevo usuario
  create(usuario: Usuario): Observable<any> {
    return this.http.post(this.apiUrl, usuario, {
      headers: this.getAuthHeaders(),
    });
  }

  // Actualizar un usuario
  update(id: string, usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, {
      headers: this.getAuthHeaders(),
    });
  }

  // Eliminar un usuario
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
