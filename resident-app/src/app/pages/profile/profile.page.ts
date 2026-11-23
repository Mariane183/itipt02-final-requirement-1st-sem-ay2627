import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  homeOutline, documentTextOutline, listOutline, 
  notificationsOutline, personOutline, logOutOutline,
  mailOutline, callOutline, shieldCheckmarkOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class ProfilePage {
  residentName: string = localStorage.getItem('username') || 'Residente';
  userEmail: string = 'N/A';
  userContact: string = 'N/A';
  userRole: string = 'resident';
  unreadCount: number = 0;

  constructor(private router: Router) {
    addIcons({ 
      homeOutline, documentTextOutline, listOutline, 
      notificationsOutline, personOutline, logOutOutline,
      mailOutline, callOutline, shieldCheckmarkOutline 
    });
  }

  ionViewWillEnter() {
    this.loadUserProfile();
    this.checkUnreadNotifications();
  }

  async loadUserProfile() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.router.navigateByUrl('/login');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`);
      const data = await response.json();

      if (response.ok) {
        this.residentName = data.username || localStorage.getItem('username') || 'Residente';
        this.userEmail = data.email || 'Walang Email';
        this.userContact = data.contact_number || 'Walang Contact Number';
        this.userRole = data.role || 'resident';
        localStorage.setItem('username', this.residentName);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async checkUnreadNotifications() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints');
      const data = await response.json();
      if (response.ok) {
        const userComplaints = data.filter((item: any) => item.user_id === parseInt(userId));
        const totalCount = userComplaints.length;
        const lastSeenCount = parseInt(localStorage.getItem('last_seen_complaints_count') || '0');
        
        this.unreadCount = totalCount > lastSeenCount ? totalCount - lastSeenCount : 0;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Navigation functions para sa footer
  goToHome() { this.router.navigateByUrl('/home'); }
  goToComplaint() { this.router.navigateByUrl('/complaints'); }
  goToMyComplaints() { this.router.navigateByUrl('/my'); }
  goToNotifications() { this.router.navigateByUrl('/notifications'); }
  goToProfile() { this.router.navigateByUrl('/profile'); }
  
  onLogout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}