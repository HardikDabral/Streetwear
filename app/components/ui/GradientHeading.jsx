import React from "react";
import { cn } from "@/app/lib/cn";

const sizeMap = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl",
  lg: "text-5xl md:text-6xl",
  xl: "text-6xl md:text-7xl",
};

const GradientHeading = ({
  as: Comp = "h2",
  size = "lg",
  className,
  children,
  ...props
}) => {
  return (
    <Comp
      className={cn(
        "font-extrabold text-white",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};

export default GradientHeading;
