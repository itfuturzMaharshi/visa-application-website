import { forwardRef } from "react";
import { useInView } from "../hooks/useInView";

const animationStyles = {
  "fade-up": "translate-y-6",
  "fade-in": "",
  "slide-left": "-translate-x-6",
};

const Reveal = forwardRef(({ as, animation = "fade-up", delay = 0, className = "", children }, passedRef) => {
    const ComponentTag = as || "div";
    const { ref, isIntersecting } = useInView();
    const resolvedRef = passedRef || ref;

    const hiddenClass = animationStyles[animation] ?? animationStyles["fade-up"];

    const hiddenState = isIntersecting ? "" : hiddenClass;
    const visibleState = isIntersecting
      ? "translate-x-0 translate-y-0 opacity-100"
      : "";

    return (
      <ComponentTag
        ref={resolvedRef}
        style={{ transitionDelay: `${delay}ms` }}
        className={`opacity-0 transition-all duration-700 ease-out ${hiddenState} ${visibleState} ${className}`}
      >
        {children}
      </ComponentTag>
    );
  }
);

Reveal.displayName = "Reveal";

export default Reveal;

