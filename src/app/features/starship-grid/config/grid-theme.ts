import { themeQuartz } from 'ag-grid-community';

export const STARSHIP_GRID_THEME = themeQuartz.withParams({
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    dataFontSize: 14,
    headerFontSize: 12,
    headerFontWeight: 500,
    headerTextColor: '#60646c',
    foregroundColor: '#1c2024',
    borderColor: '#e0e1e6',
    headerBackgroundColor: '#ffffff',
    backgroundColor: '#ffffff',
    rowHoverColor: '#00005506',
    selectedRowBackgroundColor: '#00005506',
    rowHeight: 36,
    headerHeight: 32,
    cellHorizontalPaddingScale: 0.8,
    columnBorder: { style: 'solid', width: 1, color: '#e0e1e6' },
    headerColumnBorder: { style: 'solid', width: 1, color: '#e0e1e6' },
    pinnedColumnBorder: false,
  });
