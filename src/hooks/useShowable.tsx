import { useRef, useState } from "react";
/**
 * hook do wyświetlania komponentu na określony czas
 * @category hooks
 * @export
 * @param {number} time czas wyświetlania komponentu
 * @return {*}  {[boolean, () => void]} zwraca tablicę z wartością logiczną określającą czy komponent jest widoczny oraz funkcją do wyświetlenia komponentu
 */
export function useShowable(time: number): [boolean, () => void] {
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
}
