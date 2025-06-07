import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { supabase } from 'src/app/core/supabase.client';
import { IonHeader, IonInput, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonButton,
  IonText, MenuController } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [IonText, IonButton, IonLabel, IonItem, IonContent, IonTitle, IonToolbar, IonInput, IonHeader,
    ReactiveFormsModule, CommonModule
   ]
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  message: string = '';
  error: string = '';
  accessToken: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private menuCtrl: MenuController) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    });
  }

  // Se llama justo antes de que Ionic muestre esta página
  ionViewWillEnter() {
    // Deshabilita el menú lateral
    this.menuCtrl.enable(false);
  }

  // Se llama justo después de que Ionic deje de mostrar esta página
  ionViewDidLeave() {
    // Vuelve a habilitar el menú lateral
    this.menuCtrl.enable(true);
  }

  ngOnInit(){
    console.log('Constructor');
    const hash = window.location.hash;
    const tokenMatch = hash.match(/access_token=([^&]+)/);
    this.accessToken = tokenMatch ? tokenMatch[1] : null;

    if (!this.accessToken) {
      this.error = '❌ Token inválido o expirado. Intenta restablecer tu contraseña nuevamente.';
    }

  }

  async updatePassword() {
    if (!this.accessToken) return;

    const { password, confirm } = this.form.value;

    if (password !== confirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      this.error   = error.message;
      this.message = '';
      return;
    }

    // 2) Cierra la sesión para forzar login de nuevo
    await supabase.auth.signOut();

    // 3) Muestra mensaje y redirige
    this.message = '✅ Contraseña actualizada. Serás redirigido al login.';
    this.error   = '';
    setTimeout(() => {
      this.router.navigate(['/auth']);  // o la ruta de tu login
    }, 2000);

  } catch (err) {
    console.error('Error inesperado:', err);
    this.error = '⚠️ Algo salió mal. Intenta nuevamente.';
  }
  }
}
