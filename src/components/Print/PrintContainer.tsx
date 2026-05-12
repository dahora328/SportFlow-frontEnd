import React from 'react';

interface PrintContainerProps {
  innerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export function PrintContainer({ innerRef, children }: PrintContainerProps) {
  return (
    <div className='hidden print:block'>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
