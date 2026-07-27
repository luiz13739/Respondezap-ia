import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
