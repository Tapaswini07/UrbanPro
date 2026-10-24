export function findCustomerProfileByMobile<T extends { mobileNo?: string | number }>(
  profiles: T[],
  mobileNo: string
): T | undefined {
  const digits = mobileNo.replace(/\D/g, '');
  if (digits.length < 10) return undefined;

  const normalized = digits.slice(-10);
  return profiles.find((profile) => {
    const savedDigits = String(profile.mobileNo || '').replace(/\D/g, '');
    return savedDigits.length >= 10 && savedDigits.slice(-10) === normalized;
  });
}
