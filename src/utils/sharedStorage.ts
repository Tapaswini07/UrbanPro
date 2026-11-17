export async function readSharedValue(key: string): Promise<unknown> {
  try {
    const response = await fetch(`/api/portal-store/${encodeURIComponent(key)}`);
    if (response.ok) {
      const result = await response.json();
      return result.value;
    }
  } catch {
    // Network or server offline; use local cache without logging noisy errors
  }

  try {
    const localValue = localStorage.getItem(key);
    if (localValue === null) return null;
    try {
      return JSON.parse(localValue);
    } catch {
      // Safe fallback for raw strings (e.g. signature base64 or empty string)
      return localValue;
    }
  } catch {
    return null;
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
  } catch {
    // Ignore storage quota or local errors
  }

  // Push directly to PostgreSQL database via API
  try {
    await fetch(`/api/portal-store/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch {
    // Offline or server unavailable; local cache already saved
  }
}

export async function submitEnquiryToDatabase(enquiry: any): Promise<boolean> {
  try {
    const response = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    if (!response.ok) return false;
    const data = await response.json().catch(() => null);
    return Boolean(data?.success);
  } catch {
    return false;
  }
}
