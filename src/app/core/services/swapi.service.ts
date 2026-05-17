import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Starship, SwapiPage } from '../models/starship.model';

@Injectable({ providedIn: 'root' })
export class SwapiService {
  private http = inject(HttpClient);

  // due to ssl certificate in swapi.dev i've used an official mirror instead
  // to use swapi.dev just replace this in baseUrl 'https://swapi.dev/api'
  private baseUrl = 'https://swapi.py4e.com/api';

  private cache = new Map<number, Starship[]>();
  totalCount = 0;

  // return starships for the given page number
  getPage(page: number): Observable<Starship[]> {
    if (this.cache.has(page)) {
      return of(this.cache.get(page)!);
    }
    return this.http.get<SwapiPage>(`${this.baseUrl}/starships/?page=${page}`).pipe(
      map((response) => {
        this.totalCount = response.count;
        const starships = response.results.map((s) => ({ ...s, notes: '' }));
        this.cache.set(page, starships);
        return starships;
      }),
    );
  }
  // returns a list of all starships currently stored in cache.
  getCached(): Starship[] {
    return Array.from(this.cache.values()).flat();
  }
}
