export function toIST(iso: string): Date {
  if (!iso) return new Date(0);
  const str = iso.includes('Z') || iso.includes('+') ? iso : iso + 'Z';
  return new Date(str);
}

export function formatISTDate(iso: string): string {
  if (!iso) return 'N/A';
  return toIST(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatISTShort(iso: string): string {
  if (!iso) return 'N/A';
  return toIST(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatISTDateOnly(iso: string): string {
  if (!iso) return 'N/A';
  return toIST(iso).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatISTTimeOnly(iso: string): string {
  if (!iso) return '';
  return toIST(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
