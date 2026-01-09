import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Workflow } from '../models/workflow.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = 'http://localhost:8080/api/v1/workflows';

  constructor(private http: HttpClient) { }

  getAllWorkflows(): Observable<Workflow[]> {
    return this.http.get<{data: Workflow[]}>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getWorkflow(id: string): Observable<Workflow> {
    return this.http.get<{data: Workflow}>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createWorkflow(workflow: Workflow): Observable<Workflow> {
    return this.http.post<{data: Workflow}>(this.apiUrl, workflow).pipe(
      map(response => response.data)
    );
  }

  updateWorkflow(id: string, workflow: Workflow): Observable<Workflow> {
    return this.http.put<{data: Workflow}>(`${this.apiUrl}/${id}`, workflow).pipe(
      map(response => response.data)
    );
  }

  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
