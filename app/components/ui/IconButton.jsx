"use client";

import React from "react";
import { cn } from "@/app/lib/cn";

const IconButton = React.forwardRef(({ className, badge, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors",
        className
      )}
      {...props}
    >
      {props.children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
});
IconButton.displayName = "IconButton";

export default IconButton;
