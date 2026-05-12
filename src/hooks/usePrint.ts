import { RefObject } from 'react';
import { useReactToPrint } from 'react-to-print';

interface UsePrintProps {
  contentRef: RefObject<HTMLElement | null>;
  documentTitle?: string;
}

export function usePrint({
  contentRef,
  documentTitle = 'documento',
}: UsePrintProps) {
  return useReactToPrint({
    contentRef,
    documentTitle,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      @media print {
        body {
          background: white;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });
}
