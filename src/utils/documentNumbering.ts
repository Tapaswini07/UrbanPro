export function getNextAvailableDocumentNumber<T>(records: T[], numberField: keyof T): string {
  const usedNumbers = new Set(
    records
      .map((record) => Number.parseInt(String(record[numberField] ?? '').replace(/\D/g, ''), 10))
      .filter((number) => Number.isFinite(number) && number > 0)
  );

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) nextNumber += 1;
  return String(nextNumber);
}
