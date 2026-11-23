import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, ToastController, IonItem, IonInput, IonTextarea
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  homeOutline, documentTextOutline, listOutline,
  notificationsOutline, personOutline, logOutOutline,
  sendOutline, cameraOutline, trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.page.html',
  styleUrls: ['./complaints.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent,
    IonIcon, IonItem, IonInput, IonTextarea
  ]
})
export class ComplaintsPage {
  respondentName = '';
  complaintDetails = '';
  evidenceImage: string | null = null;
  unreadCount: number = 0;
  isSubmitting: boolean = false;

  private readonly apiBaseUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({
      homeOutline, documentTextOutline, listOutline,
      notificationsOutline, personOutline, logOutOutline,
      sendOutline, cameraOutline, trashOutline
    });
  }

  ionViewWillEnter() {
    this.checkUnreadNotifications();
  }

  async checkUnreadNotifications() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/complaints`, { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        const targetId = Number(userId);
        const userComplaints = data.filter((item: any) => Number(item.user_id) === targetId);
        const totalCount = userComplaints.length;
        const lastSeenCount = parseInt(localStorage.getItem('last_seen_complaints_count') || '0', 10);

        this.unreadCount = totalCount > lastSeenCount ? totalCount - lastSeenCount : 0;
      }
    } catch (e) {
      console.error('Error checking unread complaints:', e);
    }
  }

  async takeSnapshot() {
    try {
      const image = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image && image.dataUrl) {
        this.evidenceImage = image.dataUrl;
      }
    } catch (error) {
      console.error('Error sa pagkuha ng litrato:', error);
    }
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.evidenceImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.evidenceImage = null;
  }

  async onSubmitComplaint() {
    if (this.isSubmitting) return;

    const rawUserId = localStorage.getItem('user_id');
    const parsedUserId = rawUserId && !Number.isNaN(Number(rawUserId)) && Number(rawUserId) > 0
      ? Number(rawUserId)
      : null;

    const complainantName =
      localStorage.getItem('username') ||
      localStorage.getItem('full_name') ||
      localStorage.getItem('email') ||
      'Residente';

    if (!this.respondentName.trim() || !this.complaintDetails.trim()) {
      this.presentToast('Mangyaring punan ang pangalan ng isinakdal at detalye ng reklamo.', 'danger');
      return;
    }

    const detailsText = this.complaintDetails.trim();
    const respondentText = this.respondentName.trim();

    this.isSubmitting = true;
    try {
      const payload = {
        user_id: parsedUserId,
        complainant_name: complainantName,
        respondent_name: respondentText,
        title: `Reklamo laban kay ${respondentText}`,
        category: 'Barangay Complaint',
        complaint_details: detailsText,
        description: detailsText,
        evidence_image: this.evidenceImage
      };

      const response = await fetch(`${this.apiBaseUrl}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        this.presentToast(data.detail || 'Hindi naisumite ang reklamo.', 'danger');
        return;
      }

      if (data?.user_id && !localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', String(data.user_id));
      }

      this.presentToast('Matagumpay na naisumite ang iyong reklamo!', 'success');
      this.respondentName = '';
      this.complaintDetails = '';
      this.evidenceImage = null;

      await this.checkUnreadNotifications();

      setTimeout(() => {
        this.router.navigateByUrl('/my-complaints');
      }, 1000);
    } catch (error) {
      console.error('Connection Error:', error);
      this.presentToast('Hindi makakonekta sa server (127.0.0.1:8000).', 'danger');
    } finally {
      this.isSubmitting = false;
    }
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
  goToMyComplaints() { this.router.navigateByUrl('/my-complaints'); }
  goToNotifications() { this.router.navigateByUrl('/notifications'); }
  goToProfile() { this.router.navigateByUrl('/profile'); }
  onLogout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}