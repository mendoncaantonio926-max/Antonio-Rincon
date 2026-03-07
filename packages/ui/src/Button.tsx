import "./button.css";

type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      className={`pulso-button pulso-button--${variant} ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
