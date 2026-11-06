export async function readSharedValue(key: string): Promise<unknown> {
  try {
    const response = await fetch(`/api/portal-store/${encodeURIComponent(key)}`);
    if (!response.ok) throw new Error(`Failed to read shared data: ${key}`);
    const result = await response.json();
    return result.value;
  } catch (error) {
    try {
      const localValue = localStorage.getItem(key);
      return localValue === null ? null : JSON.parse(localValue);
    } catch (fallbackError) {
      console.error(`Failed to read shared data: ${key}`, error);
      console.error(`Failed to read local fallback data: ${key}`, fallbackError);
      return null;
    }
  }
}

export function writeSharedValue(key: string, value: unknown): void {
  fetch(`/api/portal-store/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  }).then(response => {
    if (!response.ok) throw new Error(`Failed to save shared data: ${key}`);
  }).catch(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save local fallback data: ${key}`, error);
    }
  });
}
