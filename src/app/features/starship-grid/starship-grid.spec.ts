import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarshipGridComponent } from './starship-grid';

describe('StarshipGridComponent', () => {
  let component: StarshipGridComponent;
  let fixture: ComponentFixture<StarshipGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarshipGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StarshipGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
