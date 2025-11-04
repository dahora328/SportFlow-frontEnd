import type React from 'react';

type ThemeContextProps = {
  children: React.ReactNode;
};

export function ThemeContext({ children }: ThemeContextProps) {
  return (
    <>
      <div className='relative text-center text-white bg-amber-950 w-full h-full min-h-screen'>
        {children}
      </div>
    </>
  );
}
