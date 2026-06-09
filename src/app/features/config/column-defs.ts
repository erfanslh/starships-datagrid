import { ColDef } from 'ag-grid-community';

export const STARSHIP_COLUMN_DEFS: ColDef[] = [
   {
      headerName: '',
      valueGetter: 'node.rowIndex + 1',
      width: 54,
      resizable: false,
      sortable: false,
      pinned: 'left',
      suppressMovable: true,
      cellStyle: {
        color: '#60646c',
        fontSize: '12px',
        fontWeight: '400',
        textAlign: 'right',
        paddingRight: '16px',
        paddingLeft: '6px',
      },
      headerClass: 'no-border-header',
    },
    { field: 'name', headerName: 'Name', minWidth: 150, resizable: true },
    { field: 'model', headerName: 'Model', minWidth: 150, resizable: true },
    { field: 'manufacturer', headerName: 'Manufacturer', minWidth: 150, resizable: true },
    { field: 'starship_class', headerName: 'Class', minWidth: 150, resizable: true },
    { field: 'cost_in_credits', headerName: 'Cost (credits)', minWidth: 150, resizable: true },
    { field: 'length', headerName: 'Length (m)', minWidth: 150, resizable: true },
    { field: 'crew', headerName: 'Crew', minWidth: 150, resizable: true },
    { field: 'passengers', headerName: 'Passengers', minWidth: 150, resizable: true },
    { field: 'max_atmosphering_speed', headerName: 'Max Speed', minWidth: 150, resizable: true },
    { field: 'hyperdrive_rating', headerName: 'Hyperdrive Rating', minWidth: 150, resizable: true },
    { field: 'MGLT', headerName: 'MGLT', minWidth: 150, resizable: true },
    { field: 'cargo_capacity', headerName: 'Cargo Capacity', minWidth: 150, resizable: true },
    { field: 'consumables', headerName: 'Consumables', minWidth: 150, resizable: true },
    {
      field: 'notes',
      headerName: 'Notes',
      minWidth: 150,
      resizable: true,
      editable: true,
      cellStyle: { backgroundColor: '#fefce8' },
    },
  ];

export const STARSHIP_DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  filter: false,
  resizable: true,
};
