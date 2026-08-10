export const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.MODE === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (import.meta.env.MODE === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(...args);
    }
  },
};
