import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonGrid, IonRow, IonCol, 
  IonItem, IonInput, IonInputPasswordToggle,
  ToastController 
} from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
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
export class SignupPage {
  fullName = '';
  phoneNumber = '';
  email = '';
  password = '';

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  async presentToast(message: string, color: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  async onRegister() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!this.fullName.trim() || !this.phoneNumber.trim() || !this.email.trim() || !this.password.trim()) {
      this.presentToast('Mangyaring punan ang lahat ng field.', 'danger');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: this.fullName,
          phone_number: this.phoneNumber,
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'May nangyaring error sa pag-rehistro.';
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }

        this.presentToast(errorMessage, 'danger');
        return;
      }

      this.presentToast('Matagumpay na nakapag-register! Pumunta na sa login.', 'success');
      
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 1500);

    } catch (error) {
      console.error('Connection Error:', error);
      this.presentToast('Hindi makakonekta sa server.', 'danger');
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}