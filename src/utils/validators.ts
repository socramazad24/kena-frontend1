export const validators = {
  // Solo letras y espacios (incluye tildes y ñ)
  onlyLetters: (value: string): boolean => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
  },

  // Solo letras y números (alfanumérico)
  alphanumeric: (value: string): boolean => {
    return /^[a-zA-Z0-9]*$/.test(value);
  },

  // Solo números enteros
  onlyNumbers: (value: string): boolean => {
    return /^[0-9]*$/.test(value);
  },

  // Solo números con decimales
  decimal: (value: string): boolean => {
    return /^[0-9]+(\.[0-9]{0,2})?$/.test(value);
  },

  // Email válido
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  // Username (solo letras, números, guión bajo, sin espacios)
  username: (value: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
  },

  // Teléfono (solo números, guiones y espacios)
  phone: (value: string): boolean => {
    return /^[0-9\s\-]*$/.test(value);
  },

  // Contraseña (mínimo 6 caracteres)
  password: (value: string): boolean => {
    return value.length >= 6;
  },
};

export const errorMessages = {
  required: 'Este campo es obligatorio',
  onlyLetters: 'Solo se permiten letras y espacios',
  onlyNumbers: 'Solo se permiten números',
  alphanumeric: 'Solo se permiten letras y números',
  decimal: 'Ingrese un número válido (máx. 2 decimales)',
  email: 'Ingrese un email válido',
  username:
    'Solo letras, números y guión bajo (3-20 caracteres, sin espacios)',
  phone: 'Solo números, guiones y espacios',
  passwordMin: 'La contraseña debe tener mínimo 6 caracteres',
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
};
