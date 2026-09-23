import React, { useRef, useState, useEffect } from 'react';

interface IframePreviewProps {
  srcDoc: string;
}

export const IframePreview = React.forwardRef<HTMLIFrameElement, IframePreviewProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const width = containerRef.current?.offsetWidth || 0;
      if (width > 0 && width < 800) {
        setScale(width / 800);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [props.srcDoc]);

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <iframe
        ref={ref}
        srcDoc={props.srcDoc}
        title="Document Preview"
        style={{
          width: '800px',
          height: `${1131 * scale}px`,
          border: 'none',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease-out'
        }}
      />
    </div>
  );
});

IframePreview.displayName = 'IframePreview';
