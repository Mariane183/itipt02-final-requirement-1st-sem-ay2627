import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonButton } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  documentTextOutline, 
  listOutline, 
  notificationsOutline, 
  personOutline, 
  logOutOutline,
  notificationsCircleOutline,
  alertCircleOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton]
})
export class NotificationsPage {
  notifications: any[] = [];
  residentName: string = localStorage.getItem('username') || 'Residente';
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
      logOutOutline,
      notificationsCircleOutline,
      alertCircleOutline 
    });
  }

  ionViewWillEnter() {
    this.loadNotifications();
  }

  async loadNotifications() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.router.navigateByUrl('/login');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints');
      const data = await response.json();

      if (response.ok) {
        const numericUserId = parseInt(userId, 10);
        const userComplaints = (data || []).filter(
          (item: any) => Number(item.user_id) === numericUserId
        );

        const seenKey = `seen_case_updates_${numericUserId}`;
        const seenMap: Record<string, { status: string; hearing_notes: string }> =
          JSON.parse(localStorage.getItem(seenKey) || '{}');

        let newlyUpdatedCount = 0;
        const nextSeenMap: Record<string, { status: string; hearing_notes: string }> = { ...seenMap };

        this.notifications = userComplaints.map((complaint: any) => {
          const caseId = complaint.complaint_id || complaint.id;
          const currentStatus = complaint.status || 'Pending';
          const currentNotes = complaint.hearing_notes || '';
          const prev = seenMap[String(caseId)];

          const hasAdminUpdate =
            Boolean(prev) &&
            (prev.status !== currentStatus || prev.hearing_notes !== currentNotes);

          if (hasAdminUpdate) {
            newlyUpdatedCount++;
          }

          let statusMessage = `Ang iyong reklamo kay ${complaint.respondent_name} ay kasalukuyang nasa status na: ${currentStatus}.`;
          if (currentNotes) {
            statusMessage += ` Notes: ${currentNotes}`;
          }

          nextSeenMap[String(caseId)] = {
            status: currentStatus,
            hearing_notes: currentNotes,
          };

          return {
            id: caseId,
            title: hasAdminUpdate
              ? `Bagong Update sa Kaso #${caseId}`
              : `Update sa Kaso #${caseId}`,
            message: statusMessage,
            status: currentStatus,
            hearing_notes: currentNotes,
            isUpdated: hasAdminUpdate,
            read: !hasAdminUpdate,
          };
        });

        const totalCount = this.notifications.length;
        const lastSeenCount = parseInt(
          localStorage.getItem(`last_seen_complaints_count_${numericUserId}`) || '0',
          10
        );
        const newComplaintCount = totalCount > lastSeenCount ? totalCount - lastSeenCount : 0;

        this.unreadCount = newlyUpdatedCount + newComplaintCount;

        localStorage.setItem(seenKey, JSON.stringify(nextSeenMap));
        localStorage.setItem(
          `last_seen_complaints_count_${numericUserId}`,
          totalCount.toString()
        );

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error:', error);
      this.cdr.detectChanges();
    }
  }

  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({
      ...n,
      isUpdated: false,
      read: true,
    }));
    this.unreadCount = 0;
    this.cdr.detectChanges();
  }

  // Navigation functions
  goToHome() { this.router.navigateByUrl('/home'); }
  goToComplaint() { this.router.navigateByUrl('/complaints'); }
  goToMyComplaints() { this.router.navigateByUrl('/my'); }
  goToNotifications() { this.router.navigateByUrl('/notifications'); }
  goToProfile() { this.router.navigateByUrl('/profile'); }
}