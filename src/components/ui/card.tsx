// src/components/ui/card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Card: basic wrapper with white bg, rounded corners, shadow, and padding.
 */
export const Card: React.FC<CardProps> = ({ children, className = "", style }) => (
  <div className={`bg-white rounded-xl shadow p-4 ${className}`} style={style}>
    {children}
  </div>
);

/**
 * CardContent: simple inner wrapper (in case you need extra padding or flex-centering).
 */
export const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`p-2 ${className}`}>{children}</div>
);