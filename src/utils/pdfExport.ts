import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Robust html2canvas rendering that isolates the target document from any
 * viewport zoom/scale, parent transforms, or Tailwind v4 color issues.
 */
export async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const measuredHeight = Math.ceil(element.scrollHeight || element.offsetHeight || 1123);
  // Create an off-screen container to isolate the element from modal transforms, zoom, or parent flex/grid styling
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '794px';
  wrapper.style.zIndex = '999999';
  wrapper.style.background = '#ffffff';

  const clone = element.cloneNode(true) as HTMLElement;
  const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
    const computedStyle = window.getComputedStyle(source);
    for (let index = 0; index < computedStyle.length; index += 1) {
      const property = computedStyle[index];
      target.style.setProperty(property, computedStyle.getPropertyValue(property));
    }

    const sourceChildren = Array.from(source.children);
    const targetChildren = Array.from(target.children);
    sourceChildren.forEach((sourceChild, index) => {
      const targetChild = targetChildren[index];
      if (targetChild instanceof HTMLElement && sourceChild instanceof HTMLElement) {
        copyComputedStyles(sourceChild, targetChild);
      }
    });
  };

  copyComputedStyles(element, clone);
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.height = 'auto';
  clone.style.minHeight = `${Math.max(1123, measuredHeight)}px`;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxSizing = 'border-box';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  // Wait for all images in the clone to load completely
  const images = Array.from(clone.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve(true);
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 2000);
      });
    })
  );

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      windowWidth: 794,
      windowHeight: 1123,
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

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 2; // 2mm margin for clean edge-to-edge A4 layout
    const printableWidth = pdfWidth - margin * 2; // 206mm
    const printableHeight = pdfHeight - margin * 2; // 293mm

    const imgHeight = (canvas.height * printableWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    // If within 125% of single page height, fit completely on 1st page in A4 paper format without distortion
    if (imgHeight <= printableHeight * 1.25) {
      let renderW = printableWidth;
      let renderH = printableWidth * (canvas.height / canvas.width);

      if (renderH > printableHeight) {
        const ratio = printableHeight / renderH;
        renderH = printableHeight;
        renderW = printableWidth * ratio;
      }

      const xOffset = margin + (printableWidth - renderW) / 2;
      const yOffset = margin;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderW, renderH);
    } else {
      // Clean multi-page canvas slicing to avoid squashing or overlapping
      const pageHeightPx = Math.floor((printableHeight * canvas.width) / printableWidth);
      let yOffsetPx = 0;
      let pageNum = 0;

      while (yOffsetPx < canvas.height) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        const currentSliceHeightPx = Math.min(pageHeightPx, canvas.height - yOffsetPx);
        sliceCanvas.height = currentSliceHeightPx;

        const sliceCtx = sliceCanvas.getContext('2d');
        if (sliceCtx) {
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(
            canvas,
            0, yOffsetPx, canvas.width, currentSliceHeightPx,
            0, 0, canvas.width, currentSliceHeightPx
          );
          const sliceImgData = sliceCanvas.toDataURL('image/png');
          const sliceMmHeight = (currentSliceHeightPx * printableWidth) / canvas.width;
          pdf.addImage(sliceImgData, 'PNG', margin, margin, printableWidth, sliceMmHeight);
        }

        yOffsetPx += pageHeightPx;
        pageNum++;
      }
    }

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
