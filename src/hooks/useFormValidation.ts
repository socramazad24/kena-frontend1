import { useState, type ChangeEvent } from 'react';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message?: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

// Solución: cambiar la firma del hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof T, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof T, boolean>>
  >({});

  function validateField<K extends keyof T>(
    name: K,
    value: any,
  ): string | null {
    const rule = rules[name];
    if (!rule) return null;

    const stringValue = String(value || '');

    if (rule.required && !stringValue.trim()) {
      return rule.message || 'Este campo es obligatorio';
    }

    if (stringValue && rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `Mínimo ${rule.minLength} caracteres`;
    }

    if (stringValue && rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `Máximo ${rule.maxLength} caracteres`;
    }

    if (stringValue && rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || 'Formato inválido';
    }

    if (stringValue && rule.custom && !rule.custom(stringValue)) {
      return rule.message || 'Valor inválido';
    }

    return null;
  }

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    const key = name as keyof T;

    setValues((prev) => ({ ...prev, [key]: value as T[keyof T] }));

    if (touched[key]) {
      const error = validateField(key, value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    }
  }

  function handleBlur<K extends keyof T>(name: K) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  function validateAll(): boolean {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    let isValid = true;

    (Object.keys(rules) as Array<keyof T>).forEach((key) => {
      newTouched[key] = true;
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  }

  function resetForm() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
  };
}
