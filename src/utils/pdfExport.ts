import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Robust html2canvas rendering that isolates the target document from any
 * viewport zoom/scale, parent transforms, or Tailwind v4 color issues.
 */
export async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  // Create an off-screen container to isolate the element from modal transforms, zoom, or parent flex/grid styling
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = `${A4_WIDTH_PX}px`;
  wrapper.style.height = 'auto';
  wrapper.style.zIndex = '999999';
  wrapper.style.background = '#ffffff';
  wrapper.style.visibility = 'visible';
  wrapper.style.opacity = '1';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.minWidth = `${A4_WIDTH_PX}px`;
  clone.style.maxWidth = `${A4_WIDTH_PX}px`;
  clone.style.height = 'auto';
  clone.style.minHeight = `${A4_HEIGHT_PX}px`;
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxSizing = 'border-box';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const sourceImages = Array.from(element.querySelectorAll('img'));
    const clonedImages = Array.from(clone.querySelectorAll('img'));
    sourceImages.forEach((sourceImage, index) => {
      const clonedImage = clonedImages[index];
      if (!clonedImage) return;

      const computedStyle = window.getComputedStyle(sourceImage);
      for (const property of ['width', 'height', 'max-width', 'max-height', 'object-fit', 'object-position']) {
        clonedImage.style.setProperty(property, computedStyle.getPropertyValue(property));
      }
    });

    // Wait for fonts and images so hosted deployments do not capture a partially
    // rendered document.
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await Promise.all(clonedImages.map(async (img) => {
      img.loading = 'eager';
      if (!img.complete) {
        await new Promise<void>((resolve, reject) => {
          const timeoutId = window.setTimeout(() => {
            cleanup();
            reject(new Error(`Timed out loading PDF image: ${img.currentSrc || img.src}`));
          }, 15000);
          const cleanup = () => {
            window.clearTimeout(timeoutId);
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
          };
          const handleLoad = () => {
            cleanup();
            resolve();
          };
          const handleError = () => {
            cleanup();
            reject(new Error(`Failed to load PDF image: ${img.currentSrc || img.src}`));
          };
          img.addEventListener('load', handleLoad, { once: true });
          img.addEventListener('error', handleError, { once: true });
        });
      }
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        throw new Error(`PDF image is unavailable: ${img.currentSrc || img.src}`);
      }
      if (typeof img.decode === 'function') {
        await img.decode();
      }
    }));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
      onclone: (clonedDoc) => {
        const dummyCanvas = clonedDoc.createElement('canvas');
        const ctx = dummyCanvas.getContext('2d');

        const resolveToRgb = (colorStr: string): string => {
          if (!colorStr || typeof colorStr !== 'string') return colorStr;
          if (!colorStr.includes('oklch') && !colorStr.includes('oklab') && !colorStr.includes('color-mix') && !colorStr.includes('light-dark')) {
            return colorStr;
          }
          if (!ctx) return '#1e3a8a';
          try {
            ctx.fillStyle = '#1e3a8a';
            ctx.fillStyle = colorStr;
            return ctx.fillStyle || '#1e3a8a';
          } catch {
            return '#1e3a8a';
          }
        };

        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((styleTag) => {
          if (styleTag.textContent) {
            let text = styleTag.textContent;
            text = text.replace(/oklch\([^)]+\)/gi, (match) => resolveToRgb(match));
            text = text.replace(/oklab\([^)]+\)/gi, (match) => resolveToRgb(match));
            text = text.replace(/color-mix\([^)]+\)/gi, 'rgba(0,0,0,0)');
            text = text.replace(/light-dark\(([^,]+),[^)]+\)/gi, '$1');
            styleTag.textContent = text;
          }
        });

        const printHiddenElements = clonedDoc.querySelectorAll('.print\\:hidden, .no-print');
        printHiddenElements.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      },
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('PDF rendering produced an empty page');
    }
    return canvas;
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * Multi-layer PDF download trigger that handles browser iframe sandbox limits cleanly
 */
export function triggerPdfDownload(pdf: jsPDF, filename: string): { success: boolean; blobUrl?: string } {
  let blobUrl: string | undefined = undefined;

  try {
    const blob = pdf.output('blob');
    blobUrl = URL.createObjectURL(blob);

    let savedNatively = false;
    try {
      pdf.save(filename);
      savedNatively = true;
    } catch (saveErr) {
      console.warn('pdf.save failed, using fallback anchor:', saveErr);
    }

    if (!savedNatively) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) document.body.removeChild(link);
      }, 1500);
    }

    return { success: true, blobUrl };
  } catch (e) {
    console.warn('Download error, trying direct save:', e);
    try {
      pdf.save(filename);
      return { success: true };
    } catch (saveErr) {
      console.error('pdf.save direct call failed:', saveErr);
      return { success: false };
    }
  }
}

export function addCanvasToA4Pdf(pdf: jsPDF, canvas: HTMLCanvasElement, margin = 2): number {
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Cannot add an empty PDF page');
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const pageHeightPx = Math.floor((printableHeight * canvas.width) / printableWidth);
  const pageCount = Math.ceil(canvas.height / pageHeightPx);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const yOffsetPx = pageIndex * pageHeightPx;
    const currentSliceHeightPx = Math.min(pageHeightPx, canvas.height - yOffsetPx);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = currentSliceHeightPx;
    const context = sliceCanvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to prepare a PDF page image');
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    context.drawImage(
      canvas,
      0, yOffsetPx, canvas.width, currentSliceHeightPx,
      0, 0, canvas.width, currentSliceHeightPx
    );

    const sliceMmHeight = (currentSliceHeightPx * printableWidth) / canvas.width;
    pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, printableWidth, sliceMmHeight, undefined, 'FAST');
  }

  return pageCount;
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
      compress: true,
    });

    const margin = 2; // 2mm margin for clean edge-to-edge A4 layout
    addCanvasToA4Pdf(pdf, canvas, margin);

    const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    let savedNatively = false;
    try {
      pdf.save(filename);
      savedNatively = true;
    } catch (saveErr) {
      console.warn('pdf.save failed, using fallback anchor:', saveErr);
    }

    if (!savedNatively) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) document.body.removeChild(link);
      }, 1500);
    }

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
    .map((el) => {
      if (el instanceof HTMLLinkElement) {
        const stylesheet = el.cloneNode(true) as HTMLLinkElement;
        stylesheet.href = el.href;
        return stylesheet.outerHTML;
      }
      return el.outerHTML;
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <base href="${document.baseURI}" />
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
            font-family: Arial, sans-serif;
          }

          body {
            display: flex;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
          }

          #print-root {
            width: 210mm;
            min-height: 297mm;
            background: #fff;
            box-sizing: border-box;
            padding: 0;
          }

          @media print {
            html, body {
              background: white;
              padding: 0;
            }

            body {
              display: block;
              padding: 0;
            }

            #print-root {
              width: 100%;
              min-height: auto;
              box-shadow: none;
            }

            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div id="print-root">
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
