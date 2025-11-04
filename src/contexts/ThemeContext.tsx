import type React from 'react';

type ThemeContextProps = {
  children: React.ReactNode;
};

export function ThemeContext({ children }: ThemeContextProps) {
  return (
    <>
      <div>{children}</div>
    </>
  );
}
