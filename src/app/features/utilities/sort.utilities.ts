export interface SortRule {
  colId: string;
  sort: string;
}

export function applySort<T extends Record<string, any>>(
  rows: T[],
  sortModel: SortRule[],
): T[] {
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
