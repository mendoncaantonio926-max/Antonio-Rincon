import { PropsWithChildren } from "react";
import "./card.css";

type CardProps = PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  className?: string;
}>;

export function Card({ title, eyebrow, className = "", children }: CardProps) {
  return (
    <section className={`pulso-card ${className}`.trim()}>
      {eyebrow || title ? (
        <header className="pulso-card__header">
          {eyebrow ? <p className="pulso-card__eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="pulso-card__title">{title}</h2> : null}
        </header>
      ) : null}
      <div className="pulso-card__body">{children}</div>
    </section>
  );
}
