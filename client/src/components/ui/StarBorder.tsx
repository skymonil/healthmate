import React from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties["animationDuration"];
    thickness?: number;
  };

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "#22d3ee", // cyan-400 for good contrast
  speed = "6s",
  thickness = 2,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-xl ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px`,
        ...(rest as any).style,
      }}
    >
      {/* Glow animations */}
      <div
        className="absolute w-[300%] h-[50%] opacity-50 bottom-[-11px] right-[-250%] animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-50 top-[-10px] left-[-250%] animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>

      {/* Content wrapper - theme friendly */}
      <div
        className="relative z-10 rounded-xl border border-gray-200 dark:border-gray-700 
                   bg-white/80 dark:bg-neutral-900/80 
                   backdrop-blur-sm"
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
