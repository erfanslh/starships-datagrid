import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, IGetRowsParams } from 'ag-grid-community';
import { SwapiService } from './../../core/services/swapi.service';
import { STARSHIP_COLUMN_DEFS, STARSHIP_DEFAULT_COL_DEF} from './config/column-defs';
import { STARSHIP_GRID_THEME } from './config/grid-theme';
import { applySort } from './utils/sort.utils';
import { SearchBarComponent } from './components/search-bar/search-bar';

@Component({
  selector: 'app-starship-grid',
  standalone: true,
  imports: [AgGridAngular, SearchBarComponent],
  templateUrl: './starship-grid.html',
  styleUrl: './starship-grid.css',
})
export class StarshipGridComponent {
  private swapiService = inject(SwapiService);
  private gridApi!: GridApi;
  private cdr = inject(ChangeDetectorRef);

  reachedEnd = false;
  loading = true;

  searchTerm = '';
  totalRows = 0;
  error = '';
  theme = STARSHIP_GRID_THEME;
  colDefs = STARSHIP_COLUMN_DEFS;
  defaultColDef = STARSHIP_DEFAULT_COL_DEF;

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowBuffer', 0);
    this.loadData();
  }

  onModelUpdated() {
    if (!this.gridApi || this.loading) return;
    const loadedRows = this.swapiService.getCached().length;
    const total = this.swapiService.totalCount;
    if (total > 0 && loadedRows >= total) {
      this.reachedEnd = true;
      this.cdr.detectChanges();
    }
  }


  // handle rows while searching
  private handleSearchRows(params: IGetRowsParams) {
    const cached = this.swapiService.getCached();
    const filtered = cached.filter((r) =>
      r.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
    const sorted = applySort(filtered, params.sortModel);
    const pageRows = sorted.slice(params.startRow, params.startRow + 10);
    this.totalRows = filtered.length;
    params.successCallback(pageRows, filtered.length);
  }

  // handle rows when search is deactive
  private handlePageRows(params: IGetRowsParams, page: number) {
    this.swapiService.getPage(page).subscribe({
      next: (_rows) => {
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
          this.totalRows = this.swapiService.totalCount;
        });

        if (params.sortModel.length > 0) {
          const sorted = applySort(this.swapiService.getCached(), params.sortModel);
          const pageRows = sorted.slice(params.startRow, params.startRow + 10);
          const isLastPage = params.startRow + pageRows.length >= this.swapiService.totalCount;
          params.successCallback(pageRows, isLastPage ? this.swapiService.totalCount : -1);
        } else {
          const isLastPage = _rows.length < 10;
          params.successCallback(_rows, isLastPage ? this.swapiService.totalCount : -1);
        }
      },
      error: () => {
        this.error = 'Failed to load starships.';
        params.failCallback();
      },
    });
  }

  private loadData() {
    this.error = '';
    this.gridApi.setGridOption('datasource', {
      getRows: (params: IGetRowsParams) => {
        const page = Math.floor(params.startRow / 10) + 1;
        if (this.searchTerm) {
          this.handleSearchRows(params);
        } else {
          this.handlePageRows(params, page);
        }
      },
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.reachedEnd = false;
    this.gridApi.purgeInfiniteCache();
  }

  retry() {
    this.error = '';
    this.loadData();
  }
}
