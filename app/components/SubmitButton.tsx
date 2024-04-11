import { ButtonHTMLAttributes, ClassAttributes, forwardRef } from "react";
import Spinner from "./Spinner";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ClassAttributes<HTMLButtonElement>;

interface SubmitButton extends ButtonProps {
  loading?: boolean;
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButton>(
  function SubmitButton(
    { children, disabled, className, loading, onClick, ...rest },
    ref
  ) {
    return (
      <button
        {...rest}
        className={`${className} h-6 flex justify-center items-center disabled:text-gray-400`}
        type='submit'
        disabled={disabled || loading}
        onClick={onClick}
        ref={ref}
      >
        {loading ? <Spinner /> : children ?? "Submit"}
      </button>
    );
  }
);
