import React from "react";

interface MaskedIconProps {
  src: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function MaskedIcon({ 
  src, 
  size = 20, 
  className = "bg-zinc-500",
  style
}: MaskedIconProps) {
  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        maskImage: `url(${src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        ...style,
      }}
    />
  );
}
