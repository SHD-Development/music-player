"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <SliderPrimitive.Range className="absolute h-full bg-zinc-900 dark:bg-zinc-50 rounded-full group-hover:bg-green-500 transition duration-200" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full  bg-white ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-50 dark:bg-white dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 opacity-0 group-hover:opacity-100" />
  </SliderPrimitive.Root>
));
//  className="block h-4 w-4 rounded-full  bg-white ring-offset-white transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-50 dark:bg-white dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 opacity-0 group-hover:opacity-100"
Slider.displayName = SliderPrimitive.Root.displayName;
export { Slider };
