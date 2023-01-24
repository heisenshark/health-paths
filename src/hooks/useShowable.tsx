import { useRef, useState } from "react";

export const useShowable = (time: number): [boolean, () => void] => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  function showComponent() {
    setIsVisible(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, time);
  }

  return [isVisible, showComponent];
};
