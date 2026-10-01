import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Robust html2canvas options that fix Tailwind v4 OKLCH issues and handle styles safely
 */
export async function renderElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Wait for all images in the element to load completely
  const images = Array.from(element.querySelectorAll('img'));
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

  return await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    scrollY: 0,
    scrollX: 0,
    windowWidth: 1200,
    windowHeight: 4000,
    onclone: (clonedDoc, clonedElement) => {
      // 1. Create a helper canvas 2D context to convert ANY modern CSS color to exact sRGB
      const dummyCanvas = clonedDoc.createElement('canvas');
      const ctx = dummyCanvas.getContext('2d');

      const resolveToRgb = (colorStr: string, fallback: string = '#000000'): string => {
        if (!colorStr || typeof colorStr !== 'string') return colorStr;
        if (!colorStr.includes('oklch') && !colorStr.includes('oklab') && !colorStr.includes('color-mix') && !colorStr.includes('light-dark')) {
          return colorStr;
        }
        if (!ctx) return colorStr.replace(/(?:oklch|oklab|color-mix)\([^)]+\)/gi, '#000000');

        return colorStr.replace(/(?:oklch|oklab|color-mix)\([^)]+\)/gi, (match) => {
          try {
            ctx.fillStyle = '#000000';
            ctx.fillStyle = match;
            return ctx.fillStyle || '#000000';
          } catch {
            return '#000000';
          }
        });
      };

      // 2. Intercept getComputedStyle in both the main window and the cloned iframe's window
      const win = clonedDoc.defaultView || window;
      const targetWindows = [window, win].filter(Boolean);

      targetWindows.forEach((w) => {
        try {
          const originalGCS = w.getComputedStyle;
          w.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
            const style = originalGCS.call(w, elt, pseudoElt);
            return new Proxy(style, {
              get(target, prop) {
                if (prop === 'getPropertyValue') {
                  return (property: string) => {
                    const raw = target.getPropertyValue(property);
                    return resolveToRgb(raw, raw);
                  };
                }
                const val = (target as any)[prop];
                if (typeof val === 'string') {
                  return resolveToRgb(val, val);
                }
                if (typeof val === 'function') {
                  return val.bind(target);
                }
                return val;
              },
            });
          };
        } catch (e) {
          console.warn('Proxy getComputedStyle wrap failed:', e);
        }
      });

      // 3. Convert all oklch, oklab, color-mix, and light-dark in all style tags to exact sRGB hex / rgba
      const styleElements = clonedDoc.querySelectorAll('style');
      styleElements.forEach((styleTag) => {
        if (styleTag.textContent) {
          let text = styleTag.textContent;

          // Convert oklch(...) to native sRGB
          text = text.replace(/oklch\([^)]+\)/gi, (match) => {
            return resolveToRgb(match, '#1e293b');
          });

          // Convert oklab(...) to native sRGB
          text = text.replace(/oklab\([^)]+\)/gi, (match) => {
            return resolveToRgb(match, '#1e293b');
          });

          // Convert color-mix(...) to native sRGB / rgba
          text = text.replace(/color-mix\([^)]+\)/gi, (match) => {
            return resolveToRgb(match, 'rgba(0,0,0,0)');
          });

          // Convert light-dark(...)
          text = text.replace(/light-dark\(([^,]+),[^)]+\)/gi, '$1');

          styleTag.textContent = text;
        }
      });

      // 4. Convert computed oklch styles directly on elements inside clonedElement
      if (clonedElement) {
        const allNodes = clonedElement.querySelectorAll('*');
        allNodes.forEach((node) => {
          const el = node as HTMLElement;
          if (!el.style) return;
          try {
            const computed = (clonedDoc.defaultView || window).getComputedStyle(el);
            const props = ['color', 'backgroundColor', 'borderColor', 'outlineColor'];
            props.forEach((p) => {
              const val = (computed as any)[p];
              if (val && typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))) {
                const rgb = resolveToRgb(val, p === 'color' ? '#000000' : 'transparent');
                el.style.setProperty(p, rgb, 'important');
              }
            });
          } catch {}
        });
      }

      // 4. Remove all clipping, overflow, and height limits on all parents
      let parent = clonedElement.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.overflow = 'visible';
        parent.style.maxHeight = 'none';
        parent.style.height = 'auto';
        parent.style.position = 'static';
        parent = parent.parentElement;
      }
      if (clonedDoc.body) {
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.maxHeight = 'none';
        clonedDoc.body.style.height = 'auto';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
      }

      // 5. Ensure target element is fixed at exact A4 width (794px), completely visible, no shadows or overflow clipping
      if (clonedElement) {
        clonedElement.style.position = 'relative';
        clonedElement.style.left = '0';
        clonedElement.style.top = '0';
        clonedElement.style.opacity = '1';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.display = 'flex';
        clonedElement.style.flexDirection = 'column';
        clonedElement.style.justifyContent = 'space-between';
        clonedElement.style.width = '794px';
        clonedElement.style.minWidth = '794px';
        clonedElement.style.maxWidth = '794px';
        clonedElement.style.minHeight = '1100px';
        clonedElement.style.height = 'auto';
        clonedElement.style.maxHeight = 'none';
        clonedElement.style.overflow = 'visible';
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.margin = '0';
        clonedElement.style.transform = 'none';
        clonedElement.style.boxShadow = 'none';

        // Ensure all children inside clonedElement are fully visible
        const allChildren = clonedElement.querySelectorAll('*');
        allChildren.forEach((child) => {
          const htmlChild = child as HTMLElement;
          if (htmlChild.style) {
            htmlChild.style.visibility = 'visible';
          }
        });
      }
    },
  });
}

/**
 * Multi-layer PDF download trigger that handles browser iframe sandbox limits cleanly
 */
export function triggerPdfDownload(pdf: jsPDF, filename: string): { success: boolean; blobUrl?: string } {
  let blobUrl: string | undefined = undefined;

  try {
    const blob = pdf.output('blob');
    blobUrl = URL.createObjectURL(blob);

    // Single clean download anchor
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) document.body.removeChild(link);
    }, 1500);

    return { success: true, blobUrl };
  } catch (e) {
    console.warn('Blob URL download failed, trying native pdf.save:', e);
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
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 4;
    const printableWidth = pdfWidth - margin * 2;
    const printableHeight = pdfHeight - margin * 2;

    const imgHeight = (canvas.height * printableWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // If within 130% of single page height, fit completely on 1st page in A4 paper format
    if (imgHeight <= printableHeight * 1.30) {
      let renderW = printableWidth;
      let renderH = imgHeight;

      if (renderH > printableHeight) {
        const scale = printableHeight / renderH;
        renderH = printableHeight;
        renderW = printableWidth * scale;
      }

      const xOffset = margin + (printableWidth - renderW) / 2;
      // Align directly to top margin to eliminate gap at the top
      const yOffset = margin;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderW, renderH, undefined, 'FAST');
    } else {
      // For truly long multi-page documents
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

