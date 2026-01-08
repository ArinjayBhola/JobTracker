"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { type MotionProps, type HTMLMotionProps, motion } from "framer-motion";

const animationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as MotionProps;

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...animationProps}
        {...props}
        className={cn(
          "relative rounded-full px-6 py-2 font-medium backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow",
          // Use color-mix to handle transparency for hex variables
          "bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--primary),transparent_90%)_0%,transparent_60%)]",
          "hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary),transparent_90%)]",
          "dark:bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--primary),transparent_90%)_0%,transparent_60%)]",
          "dark:hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary),transparent_90%)]",
          className,
        )}
      >
        <span
          className="relative block h-full w-full text-sm uppercase tracking-wide text-[rgb(0,0,0,65%)] dark:text-[rgb(255,255,255,90%)]"
          style={{
            maskImage:
              "linear-gradient(-75deg,hsl(var(--primary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--primary)) calc(var(--x) + 100%))",
          }}
        >
          {children}
        </span>
        <span
          style={{
            mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
            maskComposite: "exclude",
          }}
          className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,color-mix(in_srgb,var(--primary),transparent_90%)_calc(var(--x)+20%),color-mix(in_srgb,var(--primary),transparent_50%)_calc(var(--x)+25%),color-mix(in_srgb,var(--primary),transparent_90%)_calc(var(--x)+100%))] p-px"
        />
      </motion.button>
    );
  },
);

ShinyButton.displayName = "ShinyButton";
