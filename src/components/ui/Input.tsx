import { C } from "@/lib/theme";

interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
  explain?: string;
  large?: boolean;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
  explain,
  large,
}: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: C.sub }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-transparent transition-all ${
            large ? "px-4 py-3.5 text-lg font-semibold" : "px-3.5 py-2.5 text-sm"
          }`}
          style={{
            borderColor: C.border,
            color: C.text,
          }}
        />
        {suffix && (
          <span
            className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm"
            style={{ color: C.dim }}
          >
            {suffix}
          </span>
        )}
      </div>
      {explain && (
        <p className="text-xs leading-relaxed" style={{ color: C.dim }}>
          {explain}
        </p>
      )}
    </div>
  );
}
