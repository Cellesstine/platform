const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email).trim());
}

export function isValidPassword(password) {
  return String(password).length >= 8;
}

export function passwordsMatch(password, confirmPassword) {
  const p = String(password);
  const c = String(confirmPassword);
  return p.length > 0 && p === c;
}

export function canSubmitAccountForm({ email, password, confirmPassword, agreedToTerms }) {
  return (
    agreedToTerms &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordsMatch(password, confirmPassword)
  );
}

export function canSubmitSignInForm({ email, password }) {
  return isValidEmail(email) && isValidPassword(password);
}
