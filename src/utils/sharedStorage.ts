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

export async function writeSharedValue(key: string, value: unknown): Promise<void> {
  // Always update local cache for instant offline responsiveness
  try {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (localErr) {
    console.error(`Failed to write local cache for ${key}`, localErr);
  }

  // Push directly to PostgreSQL database via API
  try {
    const response = await fetch(`/api/portal-store/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) throw new Error(`Failed to save shared data: ${key}`);
  } catch (apiErr) {
    console.warn(`PostgreSQL write deferred / offline for ${key}:`, apiErr);
  }
}

export async function submitEnquiryToDatabase(enquiry: any): Promise<boolean> {
  try {
    const response = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) throw new Error('API failed to save enquiry');
    const data = await response.json();
    return Boolean(data?.success);
  } catch (err) {
    console.warn('Direct enquiry submission fell back:', err);
    return false;
  }
}
