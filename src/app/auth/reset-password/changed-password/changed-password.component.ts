import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from 'src/app/core/supabase.client';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonInput, IonButton, IonItem, IonText,
  IonButtons, IonBackButton, IonAvatar, IonPopover, IonList, IonIcon, IonNote } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { passwordComplexity, PasswordPolicy, sameAs } from 'src/app/helper/password-validation';

@Component({
    selector: 'app-changed-password',
    templateUrl: './changed-password.component.html',
    styleUrls: ['./changed-password.component.scss'],
    imports: [IonNote, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonInput, IonButton, IonItem, IonText,
        FormsModule, ReactiveFormsModule, IonButtons, IonBackButton, CommonModule, IonList, IonIcon,
    ]
})
export class ChangedPasswordComponent  implements OnInit {

    form: FormGroup;
    message: string = '';
    error: string = '';
    accessToken: string | null = null;
    userPhoto: string = '';
    policy: PasswordPolicy = { min: 8, upper: 1, digits: 1, special: 1 };
    showPwd = false;
    showConfirm = false;

    constructor(private fb: FormBuilder, private router: Router,
      private supabaseService: SupabaseService
    ) {
      this.form = this.fb.group({
        password: ['', [Validators.required, passwordComplexity(this.policy)]],
        confirm: ['', [Validators.required]],
      },
        // validators: this.passwordsMatch
      { validators: sameAs('password', 'confirm')}
    );
    }

    async ngOnInit(){
      console.log('Constructor');
      this.userPhoto =  await this.supabaseService.loadPhoto();
    }

    private passwordsMatch(group: FormGroup) {
      const pass = group.get('password')!.value;
      const confirm = group.get('confirm')!.value;
      return pass === confirm ? null : { mismatch: true };
    }

    async updatePassword() {
      // if (!this.accessToken) return;

      const { password, confirm } = this.form.value;

      if (password !== confirm) {
        this.error = 'Las contraseñas no coinciden';
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          this.error = error.message;
          this.message = '';
        } else {
          this.message = '✅ Contraseña actualizada correctamente. Serás redirigido al login.';
          this.error = '';
          setTimeout(() => {
            this.router.navigate(['/auth']);
          }, 1000);
        }
      } catch (err) {
        console.error('Error inesperado:', err);
        this.error = '⚠️ Algo salió mal. Intenta nuevamente.';
      }
    }

    ///get pw() { return String(this.form.get('password')?.value ?? ''); }
get mismatch() { return this.form.hasError('passwordsMismatch'); }

  // Contadores basados en el valor actual
get pw(): string { return String(this.form.get('password')?.value ?? ''); }
get upperCount(): number { return (this.pw.match(/[A-Z]/g) ?? []).length; }
get digitCount(): number { return (this.pw.match(/\d/g) ?? []).length; }
get specialCount(): number { return (this.pw.match(/[^A-Za-z0-9]/g) ?? []).length; }

// Cumplimientos (booleans para el template)
get okMin(): boolean { return this.pw.length >= (this.policy.min ?? 8); }
get okUpper(): boolean { return this.upperCount >= (this.policy.upper ?? 0); }
get okDigits(): boolean { return this.digitCount >= (this.policy.digits ?? 0); }
get okSpecial(): boolean { return this.specialCount >= (this.policy.special ?? 0); }
}
