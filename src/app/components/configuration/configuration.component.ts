import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonButton, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput,
  IonToggle, IonAvatar, IonPopover, IonList, IonIcon, ToastController, LoadingController, IonProgressBar } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource  } from '@capacitor/camera';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigScreenRequestsService } from 'src/app/services/supabase/config/config-screen-requests.service';
import { ConfigScreenExcuseService } from 'src/app/services/supabase/config/config-screen-excuse.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { Router, RouterLink } from '@angular/router';
import { ConfigLogoService } from 'src/app/services/supabase/config/config-logo.service';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
    imports: [IonProgressBar, IonIcon, IonList, IonPopover, IonAvatar, IonToggle, IonInput, IonLabel, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonButton,
        IonContent, IonButtons, IonTitle, IonToolbar, IonHeader, IonMenuButton, FormsModule, CommonModule,
        RouterLink]
})
export class ConfigurationComponent  implements OnInit {


  showForm = {
    formSolict: false,
    formExcuse: false,
    formLogo: false,
    isDarkMode: false
  };
  upload = {
    solicit: 0,
    excuse: 0,
    logo:   0
  };
  private progressTimers: Record<'solicit'|'excuse'|'logo', any> = { solicit: null, excuse: null, logo: null };

  userPhoto = '';

  // Campos ligados a los formularios
  newTitle = '';
  newText  = '';

  // Estados actuales
  currentSolict = { image: '', title: '', text: '' };
  currentExcuse = { image: '', title: '', text: '' };
  currentLogo   = { image: '', title: '' };

  // Para el flujo de imagen “Solicitud”
  selectedSolicitImgBase64: string|null = null;
  selectedSolicitImgFormat: string|null = null;
  selectedSolicitImgName:   string|null = null;

  // Para el flujo de imagen “Excusa”
  selectedExcuseImgBase64: string|null = null;
  selectedExcuseImgFormat: string|null = null;
  selectedExcuseImgName:   string|null = null;

  // Para el flujo de imagen “Logo”
  selectedLogoImgBase64: string|null = null;
  selectedLogoImgFormat: string|null = null;
  selectedLogoImgName:   string|null = null;

  cacheKey = Date.now();//romper cache de imágenes
  constructor(
    private reqCfg: ConfigScreenRequestsService,
    private excCfg: ConfigScreenExcuseService,
    private logoService: ConfigLogoService,
    private supabaseService: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {

    // Avatar
    this.userPhoto = await this.supabaseService.loadPhoto();

    // Suscripciones a valores actuales
    this.reqCfg.image$.subscribe(img => this.currentSolict.image = img);
    this.reqCfg.title$.subscribe(t  => this.currentSolict.title = t);
    this.reqCfg.text$.subscribe(txt=> this.currentSolict.text  = txt);

    this.excCfg.image$.subscribe(img => this.currentExcuse.image = img);
    this.excCfg.title$.subscribe(t  => this.currentExcuse.title = t);
    this.excCfg.text$.subscribe(txt=> this.currentExcuse.text  = txt);

    this.logoService.image$.subscribe(img => this.currentLogo.image = img);
    this.logoService.title$.subscribe(t  => this.currentLogo.title = t);
  }

  private async toast(message: string, color: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom', icon: 'checkmark-circle' });
    t.present();
  }

  private startProgress(which: 'solicit'|'excuse'|'logo') {
    this.upload[which] = 0.05;
    clearInterval(this.progressTimers[which]);
    this.progressTimers[which] = setInterval(() => {
      // sube poco a poco hasta 0.9 mientras sube en backend
      if (this.upload[which] < 0.9) this.upload[which] = Math.min(0.9, this.upload[which] + Math.random() * 0.08);
    }, 180);
  }

  private async finishProgress(which: 'solicit'|'excuse'|'logo') {
    clearInterval(this.progressTimers[which]);
    this.upload[which] = 1;
    await new Promise(r => setTimeout(r, 400));
    this.upload[which] = 0; // ocultar barra
  }

  private resetSectionUI(section: 'formSolict'|'formExcuse'|'formLogo') {
    // Cierra todos los toggles
    this.showForm.formSolict = false;
    this.showForm.formExcuse = false;
    this.showForm.formLogo   = false;

    // Limpia campos temporales del section
    if (section === 'formSolict') {
      this.selectedSolicitImgBase64 = null;
      this.selectedSolicitImgFormat = null;
      this.selectedSolicitImgName   = null;
    }
    if (section === 'formExcuse') {
      this.selectedExcuseImgBase64 = null;
      this.selectedExcuseImgFormat = null;
      this.selectedExcuseImgName   = null;
    }
    if (section === 'formLogo') {
      this.selectedLogoImgBase64 = null;
      this.selectedLogoImgFormat = null;
      this.selectedLogoImgName   = null;
    }
    // Limpia inputs comunes
    this.newTitle = '';
    this.newText  = '';
  }
  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/auth']);
  }

  changePassword(){
    this.router.navigate(['/changed-pass']);
  }

  /** Adjunta ?v=cacheKey para forzar recarga */
  cacheBust(url?: string): string {
    if (!url) return '';
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${this.cacheKey}`;
  }
  /** Cuando cambie una imagen, renueva cacheKey y refresca UI */
  private bumpCache() {
    this.cacheKey = Date.now();
    this.cdr.markForCheck(); // por si usas OnPush
  }

  // ——— Solicitudes ———

  get canUpdateSolicit(): boolean {
    return this.newTitle.trim() !== '' && this.newText.trim() !== '';
  }

  updateDataTitleText() {
    if (!this.canUpdateSolicit) return;
    this.reqCfg.changeTitle(this.newTitle);
    this.reqCfg.changeText(this.newText);
    this.toast('Texto de Solicitud actualizado', 'success');
    this.resetSectionUI('formSolict');
  }

  async selectSolicitImage() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!photo.base64String) return;

      // almacenamos selección, creamos nombre
      this.selectedSolicitImgBase64 = photo.base64String;
      this.selectedSolicitImgFormat = photo.format;
      this.selectedSolicitImgName   = `solicit_${Date.now()}.${photo.format}`;
    } catch (e) {
      console.error('Error al seleccionar imagen solicit:', e);
    }
  }

  async uploadSolicitImage() {
      if (!this.selectedSolicitImgBase64) return;
      this.startProgress('solicit');
      try {
      await this.reqCfg.changeImageBase64(this.selectedSolicitImgBase64, this.selectedSolicitImgFormat!);
      await this.finishProgress('solicit');
      this.bumpCache();
      await this.toast('Imagen de Solicitud cambiada', 'success');
      this.resetSectionUI('formSolict');
    } catch (e) {
      await this.finishProgress('solicit');
      console.error(e);
      await this.toast('Error al subir imagen de Solicitud', 'danger');
    }
  }

  get canUploadSolicitImage(): boolean {
    return !!this.selectedSolicitImgBase64;
  }

  // ——— Excusas ———

  get canUpdateExcuse(): boolean {
    return this.newTitle.trim() !== '' && this.newText.trim() !== '';
  }

  updateDataTitleTextExcuse() {
    if (!this.canUpdateExcuse) return;
    this.excCfg.changeTitle(this.newTitle);
    this.excCfg.changeText(this.newText);
    this.toast('Texto de Excusa actualizado', 'success');
    this.resetSectionUI('formExcuse');
  }

  async selectExcuseImage() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!photo.base64String) return;

      this.selectedExcuseImgBase64 = photo.base64String;
      this.selectedExcuseImgFormat = photo.format;
      this.selectedExcuseImgName   = `excuse_${Date.now()}.${photo.format}`;
    } catch (e) {
      console.error('Error al seleccionar imagen excuse:', e);
    }
  }

  async uploadExcuseImage() {
      if (!this.selectedExcuseImgBase64) return;
      this.startProgress('excuse');
      try {
      await this.excCfg.changeImageBase64(this.selectedExcuseImgBase64, this.selectedExcuseImgFormat!);
      await this.finishProgress('excuse');
      this.bumpCache();
      await this.toast('Imagen de Excusa cambiada', 'success');
      this.resetSectionUI('formExcuse');
    } catch (e) {
      await this.finishProgress('excuse');
      console.error(e);
      await this.toast('Error al subir imagen de Excusa', 'danger');
    }
  }

  get canUploadExcuseImage(): boolean {
    return !!this.selectedExcuseImgBase64;
  }

  // ——— Logo ———

  get canUpdateTitleLogo(): boolean {
    return this.newTitle.trim() !== '';
  }
  updateLogoTitleText() {
    if (!this.canUpdateTitleLogo) return;
    this.logoService.changeTitle(this.newTitle);
    this.toast('Título de logo actualizado', 'success');
    this.resetSectionUI('formLogo');
    // this.newTitle = '';
  }
  async selectLogoImage() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });
      if (!photo.base64String) return;

      this.selectedLogoImgBase64 = photo.base64String;
      this.selectedLogoImgFormat = photo.format;
      this.selectedLogoImgName   = `logo_${Date.now()}.${photo.format}`;
    } catch (e) {
      console.error('Error al seleccionar imagen logo:', e);
    }
  }

  async uploadLogoImage() {
      if (!this.selectedLogoImgBase64) return;
      this.startProgress('logo');
      try {
      await this.logoService.changeImageBase64(this.selectedLogoImgBase64, this.selectedLogoImgFormat!);
      await this.finishProgress('logo');
      this.bumpCache();
      await this.toast('Logo cambiado', 'success');
      this.resetSectionUI('formLogo');
    } catch (e) {
      await this.finishProgress('logo');
      console.error(e);
      await this.toast('Error al subir logo', 'danger');
    }
  }

  get canUploadLogoImage(): boolean {
    return !!this.selectedLogoImgBase64;
  }

  /**
   * Enciende sólo la sección indicada y apaga las otras.
   * @param section 'formSolict' | 'formExcuse' | 'formLogo'
   */
  toggleSection(section: 'formSolict' | 'formExcuse' | 'formLogo', event: CustomEvent<{ checked: boolean}>) {
    const checked = event.detail.checked;
    // Primero apaga todas
    if (checked) {
      this.showForm.formSolict  = false;
      this.showForm.formExcuse = false;
      this.showForm.formLogo    = false;
      this.showForm[section] = true;
    }else{
      this.showForm[section]    = !this.showForm[section];
    }
  }
}
