"use client";

import React from "react";

interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value"
  > {
  value: string | number;
  onChange: (value: string) => void;
}

function formatThousands(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function stripThousands(formatted: string): string {
  return formatted.replace(/\./g, "").replace(/\D/g, "");
}

export function NumericInput({ value, onChange, ...props }: NumericInputProps) {
  const rawStr = String(value ?? "");
  const displayValue = formatThousands(rawStr);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripThousands(e.target.value);
    onChange(raw);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
    />
  );
}
