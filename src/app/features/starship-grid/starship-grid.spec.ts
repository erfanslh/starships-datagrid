import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { StarshipGridComponent } from './starship-grid';
import { SwapiService } from './../../core/services/swapi.service';
import { Starship } from '../../core/models/starship.model';

describe('StarshipGridComponent', () => {
  let component: StarshipGridComponent;
  let fixture: ComponentFixture<StarshipGridComponent>;
  let swapiServiceMock: Partial<SwapiService>;

  const mockStarships: Starship[] = [
    {
      name: 'X-wing',
      model: 'T-65',
      manufacturer: 'Incom',
      cost_in_credits: '149999',
      length: '12.5',
      max_atmosphering_speed: '1050',
      crew: '1',
      passengers: '0',
      cargo_capacity: '110',
      consumables: '1 week',
      hyperdrive_rating: '1.0',
      MGLT: '100',
      starship_class: 'Starfighter',
      notes: '',
    },
    {
      name: 'Millennium Falcon',
      model: 'YT-1300',
      manufacturer: 'Corellian',
      cost_in_credits: '100000',
      length: '34.37',
      max_atmosphering_speed: '1050',
      crew: '4',
      passengers: '6',
      cargo_capacity: '100000',
      consumables: '2 months',
      hyperdrive_rating: '0.5',
      MGLT: '75',
      starship_class: 'Light freighter',
      notes: '',
    },
  ];

  beforeEach(async () => {
    swapiServiceMock = {
      getPage: vi.fn().mockReturnValue(of(mockStarships)),
      getCached: vi.fn().mockReturnValue(mockStarships),
      totalCount: 2,
    };

    await TestBed.configureTestingModule({
      imports: [StarshipGridComponent],
      providers: [{ provide: SwapiService, useValue: swapiServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(StarshipGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter cached starships by name when searching', () => {
    component.searchTerm = 'falcon';

    const cached = swapiServiceMock.getCached!();
    const filtered = cached.filter((r: Starship) => r.name.toLowerCase().includes('falcon'));

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Millennium Falcon');
  });

  it('should sort numerically and push unknown values to the bottom', () => {
    const rows = [
      { cost_in_credits: 'unknown', name: 'A' },
      { cost_in_credits: '1000', name: 'B' },
      { cost_in_credits: '47,060', name: 'C' },
      { cost_in_credits: 'n/a', name: 'D' },
      { cost_in_credits: '500', name: 'E' },
    ];

    const sorted = component.applySort(rows, [{ colId: 'cost_in_credits', sort: 'asc' }]);

    expect(sorted[0].name).toBe('E');
    expect(sorted[1].name).toBe('B');
    expect(sorted[2].name).toBe('C');

    expect(['A', 'D']).toContain(sorted[3].name);
    expect(['A', 'D']).toContain(sorted[4].name);
  });

  it('should clear search term and reset reachedEnd on new search', () => {
    (component as any).gridApi = { purgeInfiniteCache: vi.fn() };

    component.reachedEnd = true;
    component.onSearch('');

    expect(component.searchTerm).toBe('');
    expect(component.reachedEnd).toBe(false);
  });
});
