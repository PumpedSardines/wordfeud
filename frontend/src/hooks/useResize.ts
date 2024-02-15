import { RefObject, useEffect } from "react";

function useResize(ref: RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      cb();
    });

    if (ref.current) {
      cb();
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);
}

export default useResize;
