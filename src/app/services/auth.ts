import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor() {}

  async signup(userData: { full_name: string; phone_number: string; email: string; password: string }) {
    const response = await fetch(`${this.apiUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Signup failed');
    return data;
  }

  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Login failed');
    
    // I-save agad sa localStorage ang session
    if (data.id) localStorage.setItem('user_id', data.id.toString());
    if (data.role) localStorage.setItem('role', data.role);
    if (data.username) localStorage.setItem('username', data.username);

    return data;
  }

  async getUserProfile(userId: string) {
    const response = await fetch(`${this.apiUrl}/users/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch user');
    return data;
  }

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }
}

export { AuthService };