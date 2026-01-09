import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job } from '../models/job.model';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private jobsUrl = 'http://localhost:8080/api/v1/jobs';
  private tasksUrl = 'http://localhost:8080/api/v1/tasks';

  constructor(private http: HttpClient) { }

  // --- Jobs ---

  getAllJobs(): Observable<Job[]> {
    return this.http.get<{data: Job[]}>(this.jobsUrl).pipe(
      map(response => response.data)
    );
  }

  getJobsByWorkflow(workflowId: string): Observable<Job[]> {
    return this.http.get<{data: Job[]}>(`${this.jobsUrl}/workflow/${workflowId}`).pipe(
      map(response => response.data)
    );
  }

  createJob(job: Job): Observable<Job> {
    return this.http.post<{data: Job}>(this.jobsUrl, job).pipe(
      map(response => response.data)
    );
  }

  updateStage(jobId: string, stageId: string): Observable<Job> {
    return this.http.patch<{data: Job}>(`${this.jobsUrl}/${jobId}/stage/${stageId}`, {}).pipe(
      map(response => response.data)
    );
  }

  updateJob(jobId: string, job: Job): Observable<Job> {
    return this.http.put<{data: Job}>(`${this.jobsUrl}/${jobId}`, job).pipe(
      map(response => response.data)
    );
  }

  // --- Tasks ---

  getTasksByJob(jobId: string): Observable<Task[]> {
    return this.http.get<{data: Task[]}>(`${this.tasksUrl}/job/${jobId}`).pipe(
      map(response => response.data)
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<{data: Task}>(this.tasksUrl, task).pipe(
      map(response => response.data)
    );
  }

  updateTaskStatus(taskId: string, completed: boolean): Observable<Task> {
    return this.http.patch<{data: Task}>(`${this.tasksUrl}/${taskId}/status`, {}, {
      params: { completed: String(completed) }
    }).pipe(
      map(response => response.data)
    );
  }
}
