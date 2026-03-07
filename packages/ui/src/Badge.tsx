import "./badge.css";

type BadgeProps = {
  children: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`pulso-badge pulso-badge--${tone}`}>{children}</span>;
}
