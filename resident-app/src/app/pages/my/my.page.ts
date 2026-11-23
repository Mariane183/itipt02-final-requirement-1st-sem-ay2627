import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonIcon, ToastController, 
  IonRefresher, IonRefresherContent, 
  IonFooter
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  homeOutline, documentTextOutline, listOutline, 
  notificationsOutline, personOutline, logOutOutline,
  timeOutline, alertCircleOutline, checkmarkCircleOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-my-complaints',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonIcon,
    IonRefresher,
    IonRefresherContent, 
    IonFooter
  ]
})
export class MyComplaintsPage {
  myComplaints: any[] = [];
  isLoading = true;
  residentName: string = localStorage.getItem('username') || 'Residente';
  unreadCount: number = 0;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ 
      homeOutline, documentTextOutline, listOutline, 
      notificationsOutline, personOutline, logOutOutline,
      timeOutline, alertCircleOutline, checkmarkCircleOutline 
    });
  }

  ionViewWillEnter() {
    this.fetchMyComplaints();
    this.checkUnreadNotifications();
  }

  async checkUnreadNotifications() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints');
      const data = await response.json();
      if (response.ok) {
        const currentUserId = parseInt(userId, 10);
        const userComplaints = (data || []).filter(
          (item: any) => Number(item.user_id) === currentUserId
        );
        const totalCount = userComplaints.length;
        const lastSeenCount = parseInt(
          localStorage.getItem(`last_seen_complaints_count_${currentUserId}`) ||
            localStorage.getItem('last_seen_complaints_count') ||
            '0',
          10
        );

        this.unreadCount = totalCount > lastSeenCount ? totalCount - lastSeenCount : 0;
        this.cdr.detectChanges();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async fetchMyComplaints() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Hindi nakuha ang mga reklamo.');
      }

      const currentUserId = parseInt(userId, 10);
      this.myComplaints = (data || []).filter(
        (item: any) => Number(item.user_id) === currentUserId
      );

    } catch (error) {
      console.error('Error:', error);
      this.presentToast('Hindi makakonekta sa server para makuha ang mga reklamo.', 'danger');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  doRefresh(event: any) {
    this.fetchMyComplaints().then(() => {
      event.target.complete();
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  goToHome() { this.router.navigateByUrl('/home'); }
  goToComplaint() { this.router.navigateByUrl('/complaints'); }
  goToMyComplaints() { this.router.navigateByUrl('/my'); }
  goToNotifications() { this.router.navigateByUrl('/notifications'); }
  goToProfile() { this.router.navigateByUrl('/profile'); }
}