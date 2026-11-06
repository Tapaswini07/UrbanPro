export async function readSharedValue(key: string): Promise<unknown> {
  const response = await fetch(`/api/portal-store/${encodeURIComponent(key)}`);
  if (!response.ok) throw new Error(`Failed to read shared data: ${key}`);
  const result = await response.json();
  return result.value;
}

export function writeSharedValue(key: string, value: unknown): void {
  fetch(`/api/portal-store/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  }).catch(error => console.error(`Failed to save shared data: ${key}`, error));
}
