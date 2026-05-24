import React from "react";
import { cn } from "@/app/lib/cn";

const Section = ({ className, children, container = true, ...props }) => {
  return (
    <section
      className={cn("bg-black text-white py-16 md:py-24 px-4", className)}
      {...props}
    >
      {container ? (
        <div className="container mx-auto max-w-7xl">{children}</div>
      ) : (
        children
      )}
    </section>
  );
};

export default Section;
