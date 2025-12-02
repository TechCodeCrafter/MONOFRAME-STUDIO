"use client";

import * as React from "react";

export function useCardSpotlight() {
  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      target.style.setProperty("--spotlight-x", `${x}px`);
      target.style.setProperty("--spotlight-y", `${y}px`);
    },
    []
  );

  return { handleMouseMove };
}
