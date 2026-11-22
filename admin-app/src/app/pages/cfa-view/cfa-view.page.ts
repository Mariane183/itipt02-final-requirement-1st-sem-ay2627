import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonIcon, IonCard, IonCardContent, IonButton
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  home, documentText, shieldCheckmark,
  person, arrowBack, newspaper, printOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-cfa-view',
  templateUrl: './cfa-view.page.html',
  styleUrls: ['./cfa-view.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonIcon, IonCard, IonCardContent, IonButton
  ]
})
export class CfaViewPage implements OnDestroy {
  selectedCase: any = null;
  complaintsList: any[] = [];
  private querySub?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      home, documentText, shieldCheckmark, person,
      arrowBack, newspaper, printOutline
    });
  }

  ionViewWillEnter() {
    this.querySub?.unsubscribe();
    this.querySub = this.route.queryParams.subscribe(params => {
      const complaintId = params['id'];
      if (complaintId) {
        this.fetchCaseDetails(complaintId);
      } else {
        this.selectedCase = null;
        this.fetchReadyForCFACases();
      }
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  async fetchCaseDetails(id: any) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/complaints/${id}`);
      const data = await response.json();
      if (response.ok) {
        this.selectedCase = data;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async fetchReadyForCFACases() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints');
      const data = await response.json();

      let rawList: any[] = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data && Array.isArray(data.complaints)) {
        rawList = data.complaints;
      }

      
      this.complaintsList = rawList.filter((c: any) => {
        if (!c?.status) return false;
        const status = c.status.toString().trim().toLowerCase();
        return status.includes('cfa') || status.includes('ready');
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error in loading CFA list:', error);
    }
  }

  selectCaseFromList(c: any) {
    const id = c.complaint_id ?? c.id;
    this.router.navigate(['/cfa-view'], { queryParams: { id } });
  }

  navigateTo(path: string) {
    if (path === '/cfa-view') {
      this.selectedCase = null;
      this.router.navigate([path], { queryParams: {} }).then(() => {
        this.fetchReadyForCFACases();
      });
    } else {
      this.router.navigate([path]);
    }
  }

  downloadPDF() {
    const printContents = document.getElementById('certificate-to-download')?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '_blank', 'height=700,width=900');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>CFA - Case #${this.selectedCase?.complaint_id ?? this.selectedCase?.id ?? 'Certificate'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #000; background: #fff; }
              .cert-header { text-align: center; margin-bottom: 20px; }
              .cert-header p { margin: 2px 0; font-size: 14px; color: #333; }
              .cert-title { text-align: center; margin: 25px 0; }
              .cert-title h4 { font-size: 18px; font-weight: bold; text-decoration: underline; }
              .cert-body { font-size: 14px; line-height: 1.6; margin-bottom: 50px; }
              .cert-body p { margin-bottom: 12px; }
              .cert-footer { margin-top: 60px; display: flex; justify-content: flex-end; }
              .signature-box { text-align: center; }
              .signature-box p { margin: 2px 0; font-size: 14px; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }
}