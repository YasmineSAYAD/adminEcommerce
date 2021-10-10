import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Response } from '../models/response';
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = `${environment.api+'category'+'?API_KEY='+environment.api_key}`;

  constructor(private httpClient: HttpClient) { }

  getCategory(): Observable<Response>{
    return this.httpClient.get<Response>(this.baseUrl);
  }
}
