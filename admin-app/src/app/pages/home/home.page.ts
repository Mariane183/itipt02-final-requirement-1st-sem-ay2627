import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, documentText, shieldCheckmark, person, newspaper, moonOutline, sunnyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonIcon
  ]
})
export class HomePage implements OnInit {
  totalComplaints: number = 0;
  pendingCases: number = 0;
  resolvedCase: number = 0;
  cfaCount: number = 0;
  isDarkMode: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      'home': home,
      'document-text': documentText,
      'shield-checkmark': shieldCheckmark,
      'person': person,
      'newspaper': newspaper,
      'moon-outline': moonOutline,
      'sunny-outline': sunnyOutline
    });
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.toggle('dark', true);
    }
    this.loadDashboardStats();
  }

  ionViewWillEnter() {
    this.loadDashboardStats();
  }

  async loadDashboardStats() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/complaints');
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        const activeCases = data.filter((c: any) => !c.is_archived);
        this.totalComplaints = activeCases.length;

       
        this.cfaCount = activeCases.filter((c: any) => {
          const status = c.status ? c.status.toString().trim().toLowerCase() : '';
          return status === 'ready for cfa' || status === 'cfa';
        }).length;

        
        this.resolvedCase = activeCases.filter((c: any) => {
          const status = c.status ? c.status.toString().trim().toLowerCase() : '';
          return status.includes('resolve') || status.includes('closed');
        }).length;

   
        this.pendingCases = Math.max(0, this.totalComplaints - this.resolvedCase - this.cfaCount);

      
        this.cdr.detectChanges();

        console.log('Stats updated successfully:', {
          total: this.totalComplaints,
          pending: this.pendingCases,
          resolved: this.resolvedCase,
          cfa: this.cfaCount
        });
      }
    } catch (error) {
      console.error('Error in loading dashboard stats:', error);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}