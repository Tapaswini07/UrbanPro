/**
 * Universal Share Utility for all PDF and Document Modules
 * Supports Web Share API, WhatsApp Web / Mobile direct link, and Clipboard copy fallback.
 */

export interface ShareDocumentOptions {
  title: string;
  text: string;
  phone?: string;
  url?: string;
  onSuccessToast?: (msg: string) => void;
}

export const shareDocument = async (options: ShareDocumentOptions): Promise<boolean> => {
  const { title, text, phone, url, onSuccessToast } = options;

  // Clean phone number for WhatsApp
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // 1. If phone number is specified, prioritize direct WhatsApp Message
  if (targetPhone) {
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (onSuccessToast) onSuccessToast(`Opening WhatsApp for +${targetPhone}...`);
    return true;
  }

  // 2. Try native Web Share API (mobile phones, tablets, modern browsers)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      if (onSuccessToast) onSuccessToast('Shared successfully!');
      return true;
    } catch (err: any) {
      // User cancelled share dialog - ignore error
      if (err?.name === 'AbortError') return false;
      console.warn('Navigator share failed, falling back to WhatsApp/Clipboard', err);
    }
  }

  // 3. WhatsApp general share link
  const generalWaUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${text}`)}`;
  window.open(generalWaUrl, '_blank', 'noopener,noreferrer');

  // Also copy text to clipboard as handy fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      if (onSuccessToast) onSuccessToast('Opening WhatsApp & copied details to clipboard!');
    } catch {
      if (onSuccessToast) onSuccessToast('Opening WhatsApp...');
    }
  } else if (onSuccessToast) {
    onSuccessToast('Opening WhatsApp...');
  }

  return true;
};
