import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job } from '../models/job.model';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private jobsUrl = `${environment.apiUrl}/jobs`;
  private tasksUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  // --- Jobs ---

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.jobsUrl);
  }

  getJobsByWorkflow(workflowId: string): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.jobsUrl}/workflow/${workflowId}`);
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.jobsUrl, job);
  }

  updateStage(jobId: string, stageId: string): Observable<Job> {
    return this.http.patch<Job>(`${this.jobsUrl}/${jobId}/stage/${stageId}`, {});
  }

  // --- Tasks ---

  getTasksByJob(jobId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.tasksUrl}/job/${jobId}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, task);
  }

  updateTaskStatus(taskId: string, completed: boolean): Observable<Task> {
    return this.http.patch<Task>(`${this.tasksUrl}/${taskId}/status`, {}, {
      params: { completed: String(completed) }
    });
  }
}
