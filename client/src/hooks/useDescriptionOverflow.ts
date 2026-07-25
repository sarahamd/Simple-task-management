import { useLayoutEffect, useRef, useState } from 'react';

export const useDescriptionOverflow = (text: string, isExpanded: boolean) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [hasMoreContent, setHasMoreContent] = useState(false);

  useLayoutEffect(() => {
    if (isExpanded) return;

    const measure = () => {
      const element = descriptionRef.current;
      if (!element) return;

      const measuredOverflow = element.scrollHeight > element.clientHeight + 1;
      // jsdom has no layout engine; this fallback also covers a measurement
      // before fonts/layout have settled in the browser.
      const unavailableLayoutFallback = element.clientHeight === 0 && text.length > 120;
      setHasMoreContent(measuredOverflow || unavailableLayoutFallback);
    };

    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (descriptionRef.current) observer?.observe(descriptionRef.current);
    window.addEventListener('resize', measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isExpanded, text]);

  return { descriptionRef, hasMoreContent };
};
