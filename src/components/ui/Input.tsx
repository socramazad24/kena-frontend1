import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  type ChangeEvent,
} from 'react';
import { errorMessages } from '../../utils/validators';

type RestrictionType = 'letters' | 'numbers' | 'alphanumeric' | 'none';
type TransformType = 'uppercase' | 'lowercase' | 'none';

interface BaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  restriction?: RestrictionType;
  transform?: TransformType;
  required?: boolean;
}

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    as?: 'input';
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      restriction = 'none',
      transform = 'none',
      className = '',
      onBlur,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    function filterValue(val: string): string {
      let filtered = val;

      switch (restriction) {
        case 'letters':
          filtered = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
          break;
        case 'numbers':
          filtered = val.replace(/[^0-9]/g, '');
          break;
        case 'alphanumeric':
          filtered = val.replace(/[^a-zA-Z0-9]/g, '');
          break;
        case 'none':
        default:
          break;
      }

      switch (transform) {
        case 'uppercase':
          filtered = filtered.toUpperCase();
          break;
        case 'lowercase':
          filtered = filtered.toLowerCase();
          break;
        case 'none':
        default:
          break;
      }

      return filtered;
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const filtered = filterValue(e.target.value);
      e.target.value = filtered;
      onChange?.(e);
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
            error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// Textarea con las mismas mejoras
interface TextareaProps
  extends BaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      restriction = 'none',
      transform = 'none',
      className = '',
      onBlur,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    function filterValue(val: string): string {
      let filtered = val;

      switch (restriction) {
        case 'letters':
          filtered = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
          break;
        case 'alphanumeric':
          filtered = val.replace(/[^a-zA-Z0-9\s]/g, '');
          break;
        default:
          break;
      }

      switch (transform) {
        case 'uppercase':
          filtered = filtered.toUpperCase();
          break;
        case 'lowercase':
          filtered = filtered.toLowerCase();
          break;
        default:
          break;
      }

      return filtered;
    }

    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
      const filtered = filterValue(e.target.value);
      e.target.value = filtered;
      onChange?.(e);
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
            error
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Input;
