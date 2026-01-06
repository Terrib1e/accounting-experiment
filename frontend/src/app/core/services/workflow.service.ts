import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workflow } from '../models/workflow.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = `${environment.apiUrl}/workflows`;

  constructor(private http: HttpClient) { }

  getAllWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.apiUrl);
  }

  getWorkflow(id: string): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.apiUrl}/${id}`);
  }

  createWorkflow(workflow: Workflow): Observable<Workflow> {
    return this.http.post<Workflow>(this.apiUrl, workflow);
  }

  updateWorkflow(id: string, workflow: Workflow): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.apiUrl}/${id}`, workflow);
  }

  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
