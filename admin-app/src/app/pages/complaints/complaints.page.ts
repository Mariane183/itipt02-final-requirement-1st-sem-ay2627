import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonIcon, IonCard, IonCardContent,
  IonItem, IonTextarea, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  home, documentText, shieldCheckmark, person, newspaper,
  archiveOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.page.html',
  styleUrls: ['./complaints.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonCard, IonCardContent,
    IonItem, IonTextarea
  ]
})
export class ComplaintsPage {
  cases: any[] = [];
  showArchived = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      home, documentText, shieldCheckmark, person, newspaper,
      archiveOutline
    });
  }

  ionViewWillEnter() {
    this.loadAllComplaints();
  }

  isLocked(c: any): boolean {
    const status = (c?.status || '').toString().trim().toLowerCase();
    return status === 'ready for cfa' || status === 'cfa' || status === 'resolved';
  }

  async loadAllComplaints() {
    try {
      const url = this.showArchived
        ? 'http://127.0.0.1:8000/api/complaints?include_archived=true'
        : 'http://127.0.0.1:8000/api/complaints';
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const filtered = this.showArchived
          ? data.filter((item: any) => Boolean(item.is_archived))
          : data.filter((item: any) => !item.is_archived);

        this.cases = filtered.map((item: any) => ({
          ...item,
          tempStatus: item.status || 'Pending',
          tempNotes: item.hearing_notes || ''
        }));

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error in loading complaints:', error);
    }
  }

  toggleArchivedView() {
    this.showArchived = !this.showArchived;
    this.loadAllComplaints();
  }

  async setArchiveState(c: any, archive: boolean) {
    const label = archive ? 'i-archive' : 'i-unarchive';
    const confirmed = confirm(`You sure you want to ${label} this case #${c.complaint_id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/complaints/${c.complaint_id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: archive })
      });

      if (response.ok) {
        this.cases = this.cases.filter((item: any) => item.complaint_id !== c.complaint_id);
        this.cdr.detectChanges();
        this.presentToast(
          archive ? 'Case archived.' : 'Case unarchived.',
          'success'
        );
      } else {
        this.presentToast(`Hindi na-${archive ? 'archive' : 'unarchive'} ang kaso.`, 'danger');
      }
    } catch (error) {
      console.error('Error in archiving:', error);
      this.presentToast('Cannot connect to server.', 'danger');
    }
  }

  async saveCaseUpdate(c: any) {
    if (this.isLocked(c)) {
      this.presentToast('Case locked .', 'danger');
      return;
    }

    const selectedStatus = (c.tempStatus || c.status || 'Pending').toString().trim();
    const notes = c.tempNotes || '';

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/complaints/${c.complaint_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          hearing_notes: notes
        })
      });

      if (response.ok) {
        c.status = selectedStatus;
        c.hearing_notes = notes;
        c.tempStatus = selectedStatus;

        const normalizedStatus = selectedStatus.toLowerCase();
        if (normalizedStatus === 'ready for cfa' || normalizedStatus === 'cfa') {
          await this.presentToast('Saved on CFA side!', 'success');
          await this.router.navigate(['/cfa-view'], {
            queryParams: { id: c.complaint_id }
          });
        } else {
          this.presentToast('Succes saving status!', 'success');
          await this.loadAllComplaints();
        }
      } else {
        this.presentToast('Update not saved.', 'danger');
      }
    } catch (error) {
      console.error('Error:', error);
      this.presentToast('Cannot connect to server.', 'danger');
    }
  }

  navigateToCfa(c: any) {
    this.router.navigate(['/cfa-view'], {
      queryParams: { id: c.complaint_id }
    });
  }

  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}