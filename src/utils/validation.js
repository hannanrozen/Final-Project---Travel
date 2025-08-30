// Email validation pattern
export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Please enter a valid email address",
};

// Password validation patterns
export const passwordPatterns = {
  required: "Password is required",
  minLength: {
    value: 6,
    message: "Password must be at least 6 characters long",
  },
  strong: {
    value:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message:
      "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character",
  },
};

// Name validation pattern
export const namePattern = {
  required: "Name is required",
  minLength: {
    value: 2,
    message: "Name must be at least 2 characters long",
  },
  pattern: {
    value: /^[a-zA-Z\s]+$/,
    message: "Name can only contain letters and spaces",
  },
};

// Phone validation pattern
export const phonePattern = {
  pattern: {
    value: /^[+]?[1-9][\d]{0,15}$/,
    message: "Please enter a valid phone number",
  },
};

// Common validation rules
export const validationRules = {
  email: {
    required: "Email is required",
    pattern: emailPattern,
  },
  password: {
    required: passwordPatterns.required,
    minLength: passwordPatterns.minLength,
  },
  strongPassword: {
    required: passwordPatterns.required,
    pattern: passwordPatterns.strong,
  },
  confirmPassword: (watchPassword) => ({
    required: "Please confirm your password",
    validate: (value) => value === watchPassword || "Passwords do not match",
  }),
  firstName: namePattern,
  lastName: namePattern,
  phone: phonePattern,
};
