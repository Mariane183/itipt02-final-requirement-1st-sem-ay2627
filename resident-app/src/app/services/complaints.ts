import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
class ComplaintService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor() {}

  async submitComplaint(complaintData: { user_id: number; complainant_name: string; respondent_name: string; complaint_details: string }) {
    const response = await fetch(`${this.apiUrl}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to submit complaint');
    return data;
  }

  async getComplaints() {
    const response = await fetch(`${this.apiUrl}/complaints`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to fetch complaints');
    return data;
  }
}

export { ComplaintService };