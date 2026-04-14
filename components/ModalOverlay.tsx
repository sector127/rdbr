"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  titleId?: string;
  className?: string;
  zIndex?: number;
}

export function ModalOverlay({ 
  children, 
  onClose, 
  titleId,
  className = "p-8",
  zIndex = 9999
}: ModalOverlayProps) {
  const [mounted, setMounted] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 shadow-2xl"
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-zinc-950 rounded-2xl w-full max-w-[460px] max-h-[90vh] overflow-y-auto relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
