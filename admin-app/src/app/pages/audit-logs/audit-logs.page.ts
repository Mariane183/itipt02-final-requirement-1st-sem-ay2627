import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButtons,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, documentText, shieldCheckmark, person, newspaper, arrowBack } from 'ionicons/icons';
import { AuditService } from '../../services/audit service';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.page.html',
  styleUrls: ['./audit-logs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonIcon,
    IonButtons,
  ]
})
export class AuditLogsPage implements OnInit {
  logs: any[] = [];
  private apiUrl = 'http://localhost:8000/api/audit-logs';

  constructor(
    private router: Router,
    private http: HttpClient,
    private auditService: AuditService
  ) {
    addIcons({
      home,
      documentText,
      shieldCheckmark,
      person,
      newspaper,
      arrowBack
    });
  }

  ngOnInit() {
    this.loadLogs();
  }

  ionViewWillEnter() {
    this.loadLogs();
  }

  loadLogs() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.logs = data.map((item) => ({
            ...item,
            action: item.action ?? item.event ?? 'Admin Action',
            details: item.details ?? item.description ?? '',
            created_at: item.created_at ?? item.timestamp ?? ''
          }));
        } else {
          this.logs = this.auditService.getLogs() || [];
        }
      },
      error: (err) => {
        console.error('Error loading audit logs from backend:', err);
        this.logs = this.auditService.getLogs() || [];
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route);
  }
}