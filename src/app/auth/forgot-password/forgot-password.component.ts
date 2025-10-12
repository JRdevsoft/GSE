import { Component} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from 'src/app/core/supabase.client';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon, IonButtons, IonBackButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    imports: [IonBackButton, IonButtons, IonText, IonButton, IonInput, IonLabel, IonItem, IonContent, IonTitle, IonToolbar, IonHeader,
        ReactiveFormsModule, CommonModule
    ]
})
export class ForgotPasswordComponent {

  form: FormGroup;
  message: string = '';
  error: string = '';
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  constructor(private fb: FormBuilder,
              private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    });
  }

  get emailCtrl(): AbstractControl {
    return this.form.get('email')!;
  }

  // opcional: limpia espacios y pone en minúsculas al salir del campo
  normalizeEmail() {
    const v = (this.emailCtrl.value || '').toString().trim().toLowerCase();
    if (v !== this.emailCtrl.value) {
      this.emailCtrl.setValue(v);
    }
  }
  async resetPassword() {
    const { email } = this.form.value;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://requestsgse.up.railway.app/reset-password'
    });

    if (error) {
      this.error = error.message;
      this.message = '';
    } else {
      this.message = '📩 Te hemos enviado un correo para restablecer tu contraseña.';
      this.error = '';
    }

    setTimeout(() => {
      this.form.reset();
      this.message = '';
      this.error = '';
    }, 2000);
  }

  goLogin(){
    this.router.navigate(['/auth']);
  }
}
