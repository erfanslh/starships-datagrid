import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IGetRowsParams,
  ModuleRegistry,
  InfiniteRowModelModule,
  ClientSideRowModelModule,
  ValidationModule,
  TextEditorModule,
  CellStyleModule,
  themeQuartz,
} from 'ag-grid-community';
import { SwapiService } from './../../core/services/swapi.service';


ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  ClientSideRowModelModule,
  ValidationModule,
  TextEditorModule,
  CellStyleModule,
]);

@Component({
  selector: 'app-starship-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './starship-grid.html',
  styleUrl: './starship-grid.css',
})
export class StarshipGridComponent {
  private swapiService = inject(SwapiService);
  private gridApi!: GridApi;
  private cdr = inject(ChangeDetectorRef);

  reachedEnd = false;
  loading = true;
  theme = themeQuartz;
  searchTerm = '';
  totalRows = 0;
  error = '';

  colDefs: ColDef[] = [
    {
      headerName: '#',
      valueGetter: 'node.rowIndex + 1',
      width: 60,
      resizable: false,
      sortable: false,
      pinned: 'left',
    },
    { field: 'name', headerName: 'Name', minWidth: 180, resizable: true },
    { field: 'model', headerName: 'Model', minWidth: 200, resizable: true },
    { field: 'manufacturer', headerName: 'Manufacturer', minWidth: 220, resizable: true },
    { field: 'starship_class', headerName: 'Class', minWidth: 150, resizable: true },
    { field: 'cost_in_credits', headerName: 'Cost (credits)', minWidth: 150, resizable: true },
    { field: 'length', headerName: 'Length (m)', minWidth: 130, resizable: true },
    { field: 'crew', headerName: 'Crew', minWidth: 100, resizable: true },
    { field: 'passengers', headerName: 'Passengers', minWidth: 120, resizable: true },
    { field: 'max_atmosphering_speed', headerName: 'Max Speed', minWidth: 130, resizable: true },
    { field: 'hyperdrive_rating', headerName: 'Hyperdrive Rating', minWidth: 150, resizable: true },
    { field: 'MGLT', headerName: 'MGLT', minWidth: 100, resizable: true },
    { field: 'cargo_capacity', headerName: 'Cargo Capacity', minWidth: 150, resizable: true },
    { field: 'consumables', headerName: 'Consumables', minWidth: 150, resizable: true },
    {
      field: 'notes',
      headerName: 'Notes',
      minWidth: 200,
      resizable: true,
      editable: true,
      cellStyle: { backgroundColor: '#fefce8' },
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
  };

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

  // sorting logic
  applySort(rows: any[], sortModel: { colId: string; sort: string }[]): any[] {
    if (sortModel.length === 0) return rows;
    const { colId, sort } = sortModel[0];

    return [...rows].sort((a, b) => {
      const valA = a[colId];
      const valB = b[colId];

      const isUnknownA = !valA || valA === 'unknown' || valA === 'n/a' || valA === '';
      const isUnknownB = !valB || valB === 'unknown' || valB === 'n/a' || valB === '';
      if (isUnknownA && isUnknownB) return 0;
      if (isUnknownA) return 1;
      if (isUnknownB) return -1;

      const numA = parseFloat(String(valA).replace(/,/g, ''));
      const numB = parseFloat(String(valB).replace(/,/g, ''));
      const isNumeric = !isNaN(numA) && !isNaN(numB);

      if (isNumeric) return sort === 'asc' ? numA - numB : numB - numA;
      return sort === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  // handle rows while searching
  private handleSearchRows(params: IGetRowsParams) {
    const cached = this.swapiService.getCached();
    const filtered = cached.filter((r) =>
      r.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
    const sorted = this.applySort(filtered, params.sortModel);
    const pageRows = sorted.slice(params.startRow, params.startRow + 10);
    this.totalRows = filtered.length;
    params.successCallback(pageRows, filtered.length);
  }

  // handle rows when search is deactive
  private handlePageRows(params: IGetRowsParams, page: number) {
    this.swapiService.getPage(page).subscribe({
      next: (_rows) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.totalRows = this.swapiService.totalCount;

        if (params.sortModel.length > 0) {
          const sorted = this.applySort(this.swapiService.getCached(), params.sortModel);
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

  loadData() {
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
