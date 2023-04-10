import { useState } from "react";
/**
 * Hook do wymuszenia odświeżenia komponentu
 * @category hooks
 * @returns funkcja wymuszająca odświeżenie komponentu
 */
export function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}
