"use client";

import { GripVerticalIcon } from "lucide-react";

import { cn } from "../../lib/utils";

// Comentar temporalmente para evitar errores
// Si resizable-panels no está siendo usado, podemos simplemente exportar componentes vacíos
const ResizablePanelGroup = ({ children, className, ...props }: any) => (
  <div className={cn("flex h-full w-full", className)} {...props}>
    {children}
  </div>
);

const ResizablePanel = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

const ResizableHandle = ({ withHandle, className, ...props }: any) => (
  <div
    className={cn(
      "relative flex w-px items-center justify-center bg-border",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVerticalIcon className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
