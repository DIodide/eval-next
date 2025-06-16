"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      richColors
      style={
        {
          "--normal-bg": "hsl(var(--card))",
          "--normal-text": "hsl(var(--card-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "rgb(34 197 94 / 0.9)",
          "--success-border": "rgb(34 197 94 / 0.5)",
          "--success-text": "white",
          "--error-bg": "rgb(239 68 68 / 0.9)",
          "--error-border": "rgb(239 68 68 / 0.5)",
          "--error-text": "white",
          "--warning-bg": "rgb(245 158 11 / 0.9)",
          "--warning-border": "rgb(245 158 11 / 0.5)",
          "--warning-text": "white",
          "--info-bg": "rgb(59 130 246 / 0.9)",
          "--info-border": "rgb(59 130 246 / 0.5)",
          "--info-text": "white",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
