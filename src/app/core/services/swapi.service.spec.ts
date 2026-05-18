import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SwapiService } from './../../core/services/swapi.service';

describe('SwapiService', () => {
  let service: SwapiService;
  let httpGetSpy: ReturnType<typeof vi.fn>;

  const mockPage1 = {
    count: 20,
    next: 'https://swapi.py4e.com/api/starships/?page=2',
    previous: null,
    results: Array.from({ length: 10 }, (_, i) => ({
      name: `Starship ${i + 1}`,
      model: `Model ${i + 1}`,
      manufacturer: 'Test Corp',
      cost_in_credits: '1000',
      length: '100',
      max_atmosphering_speed: '1000',
      crew: '5',
      passengers: '10',
      cargo_capacity: '5000',
      consumables: '1 month',
      hyperdrive_rating: '1.0',
      MGLT: '50',
      starship_class: 'Starfighter',
    })),
  };

  const mockPage2 = {
    count: 20,
    next: null,
    previous: 'https://swapi.py4e.com/api/starships/?page=1',
    results: Array.from({ length: 10 }, (_, i) => ({
      name: `Starship ${i + 11}`,
      model: `Model ${i + 11}`,
      manufacturer: 'Test Corp',
      cost_in_credits: '2000',
      length: '200',
      max_atmosphering_speed: '2000',
      crew: '10',
      passengers: '20',
      cargo_capacity: '10000',
      consumables: '2 months',
      hyperdrive_rating: '2.0',
      MGLT: '100',
      starship_class: 'Cruiser',
    })),
  };

  beforeEach(() => {
    httpGetSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        SwapiService,
        { provide: HttpClient, useValue: { get: httpGetSpy } },
      ],
    });

    service = TestBed.inject(SwapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch page 1 from API and cache the result', () => {
    httpGetSpy.mockReturnValue(of(mockPage1));

    service.getPage(1).subscribe(starships => {
      expect(starships.length).toBe(10);
      expect(starships[0].name).toBe('Starship 1');
      expect(starships[0].notes).toBe('');
      expect(service.totalCount).toBe(20);
    });

    expect(httpGetSpy).toHaveBeenCalledTimes(1);
  });

  it('should return cached page without making a second HTTP request', () => {
    httpGetSpy.mockReturnValue(of(mockPage1));

    service.getPage(1).subscribe();
    service.getPage(1).subscribe();

    expect(httpGetSpy).toHaveBeenCalledTimes(1);
  });

  it('should combine pages correctly in getCached()', () => {
    httpGetSpy
      .mockReturnValueOnce(of(mockPage1))
      .mockReturnValueOnce(of(mockPage2));

    service.getPage(1).subscribe();
    service.getPage(2).subscribe();

    const cached = service.getCached();
    expect(cached.length).toBe(20);
    expect(cached[0].name).toBe('Starship 1');
    expect(cached[10].name).toBe('Starship 11');
  });
});
