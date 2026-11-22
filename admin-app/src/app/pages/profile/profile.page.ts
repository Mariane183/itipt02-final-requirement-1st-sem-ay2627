import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  ToastController,
  IonButtons
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { person, mail, shield, logOut, home, documentText, shieldCheckmark, newspaper, moonOutline, sunnyOutline } from 'ionicons/icons';
import { CaseService } from '../../services/case';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonButtons
  ]
})
export class ProfilePage implements OnInit {
  adminEmail: string = '';
  adminName: string = '';

  totalCases: number = 0;
  cfaReadyCount: number = 0;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private caseService: CaseService
  ) {
    addIcons({
      person,
      mail,
      shield,
      logOut,
      home,
      documentText,
      shieldCheckmark,
      newspaper, moonOutline, sunnyOutline
    });
  }

  ngOnInit() {
   
    this.totalCases = this.caseService.getTotalCasesCount();
    this.cfaReadyCount = this.caseService.getCfaCount();
  
    this.adminEmail = localStorage.getItem('user_email') || 'admin@barangay.com';
    this.adminName = localStorage.getItem('user_name') || 'Admin Officer';
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route);
  }

  logout() {
    localStorage.clear();
    this.presentToast('Matagumpay na nag-log out.', 'success');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}