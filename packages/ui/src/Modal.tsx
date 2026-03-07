import { PropsWithChildren } from "react";
import "./modal.css";

type ModalProps = PropsWithChildren<{
  open: boolean;
  title?: string;
  onClose?: () => void;
}>;

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="pulso-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="pulso-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pulso-modal__header">
          {title ? <h2>{title}</h2> : null}
          {onClose ? (
            <button className="pulso-modal__close" type="button" onClick={onClose}>
              Fechar
            </button>
          ) : null}
        </header>
        <div className="pulso-modal__body">{children}</div>
      </section>
    </div>
  );
}
