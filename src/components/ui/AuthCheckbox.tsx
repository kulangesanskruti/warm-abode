import { Check } from "lucide-react";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  id?: string;
};

export default function Checkbox({ checked, onChange, label, id = "checkbox" }: Props) {
  return (
    <label htmlFor={id} className="group flex cursor-pointer items-center gap-2.5 select-none">
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
          checked
            ? "border-primary-600 bg-primary-600 text-white shadow-soft"
            : "border-ink-300 bg-white group-hover:border-primary-400"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <span className="text-sm text-ink-600">{label}</span>
    </label>
  );
}
