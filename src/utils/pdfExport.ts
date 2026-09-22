import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Robust html2canvas options that fix Tailwind v4 OKLCH issues and handle styles safely
 */
export async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Wait for all images in the element to load completely
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  return await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 10000,
    windowWidth: 1024,
    onclone: (clonedDoc) => {
      // Clean any stylesheets containing unsupported modern CSS color formats like oklch or oklab
      const styleElements = clonedDoc.querySelectorAll('style');
      styleElements.forEach((styleTag) => {
        if (styleTag.textContent && (styleTag.textContent.includes('oklch') || styleTag.textContent.includes('oklab'))) {
          styleTag.textContent = styleTag.textContent
            .replace(/oklch\([^)]+\)/g, '#0f172a')
            .replace(/oklab\([^)]+\)/g, '#0f172a');
        }
      });
    },
  });
}

/**
 * Multi-layer PDF download trigger that handles browser iframe sandbox limits
 */
export function triggerPdfDownload(pdf: jsPDF, filename: string): { success: boolean; blobUrl?: string } {
  let downloaded = false;
  let blobUrl: string | undefined = undefined;

  try {
    const blob = pdf.output('blob');
    blobUrl = URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Error creating blob output:', e);
  }

  // Strategy 1: jsPDF native save
  try {
    pdf.save(filename);
    downloaded = true;
  } catch (e) {
    console.warn('pdf.save direct call failed:', e);
  }

  // Strategy 2: Blob URL anchor download
  if (blobUrl) {
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) document.body.removeChild(link);
      }, 5000);
      downloaded = true;
    } catch (e) {
      console.warn('Blob anchor download failed:', e);
    }
  }

  // Strategy 3: Data URI download link
  try {
    const dataUri = pdf.output('datauristring');
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 3000);
    downloaded = true;
  } catch (e) {
    console.warn('Data URI download failed:', e);
  }

  // Strategy 4: If running inside an iframe or embedded environment, open in a new tab if suppressed
  if (blobUrl && window.self !== window.top) {
    try {
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.warn('Failed to open PDF in new tab:', e);
    }
  }

  return { success: downloaded, blobUrl };
}

/**
 * Downloads a DOM element as a high quality A4 PDF with multi-layer fallback
 */
export async function downloadPdfFromElement(
  element: HTMLElement, 
  filename: string = 'document.pdf'
): Promise<{ success: boolean; url?: string }> {
  try {
    const canvas = await renderElementToCanvas(element);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 4;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = pdfHeight - margin * 2;

    const imgHeight = (canvas.height * printableWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, Math.min(imgHeight, printableHeight));
    heightLeft -= printableHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, imgHeight);
      heightLeft -= printableHeight;
    }

    const { success, blobUrl } = triggerPdfDownload(pdf, filename);

    return { success: true, url: blobUrl };
  } catch (error) {
    console.error('PDF export failed:', error);
    openElementInPrintWindow(element, filename.replace('.pdf', ''));
    return { success: false };
  }
}

/**
 * Opens a DOM element in a clean printable new window (useful for iframe sandbox escapes)
 */
export function openElementInPrintWindow(element: HTMLElement, title: string = 'Document') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${styles}
        <style>
          body { margin: 0; padding: 20px; background: #f8fafc; display: flex; justify-content: center; }
          @media print {
            body { padding: 0; background: white; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 794px;">
          <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 12px; background: #0f172a; color: white; border-radius: 8px;">
            <strong>${title}</strong>
            <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
              Print / Save as PDF
            </button>
          </div>
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
}

