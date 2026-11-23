import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  documentTextOutline,
  listOutline,
  notificationsOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class HomePage {
  residentName: string = 'Residente';
  unreadCount: number = 0;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      homeOutline,
      documentTextOutline,
      listOutline,
      notificationsOutline,
      personOutline,
    });
    this.refreshUserInfo();
  }

  ionViewWillEnter() {
    this.refreshUserInfo();
    this.cdr.detectChanges();
  }

  refreshUserInfo() {
    this.residentName =
      localStorage.getItem('username') ||
      localStorage.getItem('full_name') ||
      'Residente';
  }

  goToHome() { this.router.navigateByUrl('/home'); }
  goToComplaint() { this.router.navigateByUrl('/complaints'); }
  goToMyComplaints() { this.router.navigateByUrl('/my'); }
  goToNotifications() { this.router.navigateByUrl('/notifications'); }
  goToProfile() { this.router.navigateByUrl('/profile'); }
}