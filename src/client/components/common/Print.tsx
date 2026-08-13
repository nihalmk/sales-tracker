import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import Icon from './Icon';

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
      <Button
        type="button"
        className={`${className || ''} hide-in-print`}
        colorPalette="brand"
        loading={isPrinting}
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
        <Icon name="print" light />
        Print
      </Button>
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
