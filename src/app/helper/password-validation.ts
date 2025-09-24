import { AbstractControl, ValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';

export type PasswordPolicy = {
  min?: number;      // longitud mínima
  upper?: number;    // mayúsculas requeridas
  digits?: number;   // dígitos requeridos
  special?: number;  // especiales requeridos
};

/** Validador sencillo con REGEX dinámico (fácil de escalar cambiando la policy) */
export function passwordComplexity(policy: PasswordPolicy = { min: 8, upper: 1, digits: 1, special: 1 }): ValidatorFn {
  const lookaheads: string[] = [];
  if (policy.upper)   lookaheads.push(`(?=(?:.*[A-Z]){${policy.upper},})`);
  if (policy.digits)  lookaheads.push(`(?=(?:.*\\d){${policy.digits},})`);
  if (policy.special) lookaheads.push(`(?=(?:.*[^A-Za-z0-9]){${policy.special},})`);
  const min = policy.min ?? 8;
  const re = new RegExp(`^${lookaheads.join('')}.{${min},}$`);

  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '');
    if (!v) return { required: true };
    return re.test(v) ? null : { passwordComplexity: true };
  };
}

/** Coincidencia de campos (password === confirm) */
export function sameAs(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const p = g.get(passwordKey)?.value;
    const c = g.get(confirmKey)?.value;
    return !p || !c ? null : (p === c ? null : { passwordsMismatch: true });
  };
}

export default { passwordComplexity, sameAs};
