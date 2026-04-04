import React from 'react';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className = '',
  variant = 'solid',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-400 disabled:border-transparent disabled:pointer-events-none";
  
  const variants = {
    solid: "bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700",
    outline: "border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100",
    ghost: "text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100 dark:hover:bg-indigo-950 dark:text-indigo-400"
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} px-4 py-2 ${className}`;

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
