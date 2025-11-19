import { useEffect, useRef, useState } from "react";

export const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, ...options }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isIntersecting };
};

