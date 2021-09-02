import React, { useState } from 'react';

interface Props {
  selectedPrintId?: string;
  className?: string;
  setPrintStatus: (selectedPrintId: string) => void;
}
const Print: React.FC<Props> = ({
  selectedPrintId,
  setPrintStatus,
  className,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  return (
    <React.Fragment>
      <button
        type="button"
        className={`${className} hide-in-print btn btn-primary ' ${
          isPrinting ? 'btn-loading' : ''
        }
        `}
        onClick={() => {
          setPrintStatus(selectedPrintId);
          setTimeout(() => {
            setIsPrinting(true);
            window && window.print();
            setIsPrinting(false);
            setPrintStatus(undefined);
          }, 0);
        }}
      >
        Print
      </button>
      <style jsx global>
        {`
          @media print {
            .hide-in-print,
            .container-overlay {
              display: none !important;
            }
            .show-in-print {
              display: block !important;
            }
            .card-header {
              display: flex;
            }
            .card {
              border: 1px solid rgba(0, 40, 100, 0.12);
            }
            .col-md-12,
            .form-group,
            .selectgroup,
            .form-label {
              page-break-inside: avoid !important;
            }
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default Print;
