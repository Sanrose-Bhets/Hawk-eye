import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-transparent p-8",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-8 pb-4", className)} {...props} />
  )
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-8 pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardContent, CardFooter }
