import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import "./field.css";

type BaseFieldProps = {
  label: string;
  hint?: string;
  error?: string;
};

type SingleLineInputProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type MultiLineInputProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

type InputProps = SingleLineInputProps | MultiLineInputProps;

export function Input(props: InputProps) {
  const { label, hint, error, multiline = false, ...rest } = props;

  return (
    <label className="pulso-field">
      <span className="pulso-field__label">{label}</span>
      {multiline ? (
        <textarea
          className="pulso-field__control pulso-field__control--textarea"
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className="pulso-field__control"
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error ? <span className="pulso-field__error">{error}</span> : hint ? <span className="pulso-field__hint">{hint}</span> : null}
    </label>
  );
}
