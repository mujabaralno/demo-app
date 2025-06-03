"use client"

import { useState } from 'react';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateField = (fieldName, value, rules = {}) => {
    const fieldErrors = [];

    if (rules.required && (!value || value === '')) {
      fieldErrors.push(`${fieldName} is required`);
    }

    if (rules.min && value < rules.min) {
      fieldErrors.push(`${fieldName} must be at least ${rules.min}`);
    }

    if (rules.max && value > rules.max) {
      fieldErrors.push(`${fieldName} must be no more than ${rules.max}`);
    }

    if (rules.type === 'number' && isNaN(value)) {
      fieldErrors.push(`${fieldName} must be a valid number`);
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));

    return fieldErrors.length === 0;
  };

  const validateForm = (formData, validationRules) => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const fieldValue = formData[fieldName];
      const rules = validationRules[fieldName];
      const fieldErrors = [];

      if (rules.required && (!fieldValue || fieldValue === '')) {
        fieldErrors.push(`${fieldName} is required`);
        isValid = false;
      }

      if (rules.min && fieldValue < rules.min) {
        fieldErrors.push(`${fieldName} must be at least ${rules.min}`);
        isValid = false;
      }

      if (rules.max && fieldValue > rules.max) {
        fieldErrors.push(`${fieldName} must be no more than ${rules.max}`);
        isValid = false;
      }

      if (rules.type === 'number' && isNaN(fieldValue)) {
        fieldErrors.push(`${fieldName} must be a valid number`);
        isValid = false;
      }

      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  };
};