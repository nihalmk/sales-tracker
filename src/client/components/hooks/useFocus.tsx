import { useRef } from 'react';

export const useFocus = () => {
  const htmlElRef = useRef<HTMLElement>(null);
  const setFocus = () => {
    console.log(htmlElRef.current)
    htmlElRef.current && htmlElRef.current.focus();
  };

  return [htmlElRef, setFocus] as const;
};
