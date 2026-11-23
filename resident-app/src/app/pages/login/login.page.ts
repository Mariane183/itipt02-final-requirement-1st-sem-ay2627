import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonGrid, IonRow, IonCol, 
  IonItem, IonInput, IonInputPasswordToggle,
  ToastController 
} from '@ionic/angular';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    IonItem, 
    IonInput, 
    IonInputPasswordToggle
  ]
})
export class LoginPage {
  username = '';
  password = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService
  ) {}

  async presentToast(message: string, color: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  async onLogin() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!this.username.trim() || !this.password.trim()) {
      this.presentToast('Mangyaring punan ang pangalan at password.', 'danger');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.presentToast(data.detail || 'Mali ang buong pangalan o password.', 'danger');
        return;
      }

      // 1. I-save muna ang ID at Role
      const savedId = data.id || data.user_id;
      if (savedId) {
        localStorage.setItem('user_id', savedId.toString());
      }
      if (data.role) {
        localStorage.setItem('role', data.role);
      }

      // 2. KAININ / KUNIN ANG TUNAY NA BUONG PANGALAN MULA SA DATABASE PROFILING ENDPOINT
      if (savedId) {
        try {
          const profileRes = await fetch(`http://127.0.0.1:8000/api/users/${savedId}`);
          const profileData = await profileRes.json();
          if (profileRes.ok && profileData.username) {
            // I-save ang totoong buong pangalan sa 'username' ng localStorage
            localStorage.setItem('username', profileData.username);
          } else {
            localStorage.setItem('username', data.username || this.username);
          }
        } catch (e) {
          localStorage.setItem('username', data.username || this.username);
        }
      } else {
        localStorage.setItem('username', data.username || this.username);
      }

      this.presentToast('Matagumpay ang pag-login!', 'success');
      
      setTimeout(() => {
        this.router.navigateByUrl('/home');
      }, 800);

    } catch (error) {
      console.error('Connection Error:', error);
      this.presentToast('Hindi makakonekta sa server.', 'danger');
    }
  }

  goToSignup() {
    this.router.navigateByUrl('/signup');
  }
}