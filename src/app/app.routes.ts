import { Routes } from '@angular/router';
import { StarshipGridComponent } from './features/starship-grid/starship-grid';

export const routes: Routes = [
  {path:'', component: StarshipGridComponent},
  {path: '**', redirectTo:''},
];
