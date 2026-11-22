import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonItem, IonInput, IonButton, 
  IonInputPasswordToggle,
  IonCol,
  IonGrid,
  ToastController
} from '@ionic/angular';
import { AuditService } from '../../services/audit service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    IonContent, IonItem, IonInput, IonButton, 
    IonInputPasswordToggle, IonCol, IonGrid
  ]
})
export class LoginPage {
  credentials = signal({
    username: '',
    password: ''
  });

  constructor(
    private router: Router,
    private auditService: AuditService,
    private toastController: ToastController
  ) {}

  async onLogin() {
    const { username, password } = this.credentials();

    if (!username || !password) {
      this.presentToast('PLease Fill All Fields.', 'danger');
      return;
    }

   
    try {
      /* 
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        this.presentToast('Mali ang username o password.', 'danger');
        return;
      }
      */

  
      this.auditService.addLog(
        'Admin Login', 
        `Admin Login Success (${username}) in system.`
      );

      this.presentToast('Login Success!', 'success');

      
      this.router.navigateByUrl('/home');

    } catch (error) {
      console.error('Login error:', error);
      this.presentToast('Not connected to server.', 'danger');
    }
  }


  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}