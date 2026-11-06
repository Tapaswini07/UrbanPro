export function getNextAvailableDocumentNumber<T>(records: T[], numberField: keyof T): string {
  const highestNumber = records.reduce((highest, record) => {
    const number = Number.parseInt(String(record[numberField] ?? '').replace(/\D/g, ''), 10);
    return Number.isFinite(number) && number > highest ? number : highest;
  }, 0);

  return String(highestNumber + 1);
}
