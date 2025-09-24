import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { AccessReqtService } from 'src/app/services/supabase/access-requests/access-reqt.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonInput, IonButton, IonButtons,
  IonBackButton, IonSelect, IonSelectOption, IonTextarea, IonNote } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupsI } from 'src/app/models/groups.models';
import { GroupService } from 'src/app/services/crud/group.service';

@Component({
    selector: 'app-access-reqt',
    templateUrl: './access-reqt.component.html',
    styleUrls: ['./access-reqt.component.scss'],
    standalone: true,
    imports: [IonTextarea, IonBackButton, IonButtons, IonButton, IonInput, IonItem, IonLabel, IonContent, IonTitle, IonToolbar, IonHeader,
        ReactiveFormsModule, CommonModule, IonSelect, IonSelectOption, FormsModule]
})
export class AccessReqtComponent implements OnInit {

  accessForm: FormGroup;
  groups: GroupsI[] = [];
  constructor(
    private fb: FormBuilder,
    private accessService: AccessReqtService,
    private router: Router,
    private interactionService: InteractionService,
    private groupService: GroupService,
    private cdr: ChangeDetectorRef,
    private interaction: InteractionService
  ) {
    this.accessForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      information: ['', Validators.required],
      group: [[], Validators.required],
      subjectSchool: [''],
      courseTeacher: [''],
      sectionTeacher: [''],
      modalidad: [''],
      courseStudent: [''],
      schoolYear: [''],
      nameChildren: [''],
      courseFather: [''],
      sectionFather: [''],
      workshop: [''],
    });
  }

  ngOnInit() {
    console.log(this.loadGroups());

    this.loadGroups();
    // Escucho cambios en el selector de grupo
    this.accessForm.get('group')!.valueChanges.subscribe(g => {
      // Primero, limpio validadores de TODOS los campos extra
      [
        'subjectSchool','courseTeacher','sectionTeacher','modalidad',
        'courseStudent','schoolYear',
        'nameChildren','courseFather','sectionFather','workshop'
      ].forEach(ctrl => {
        const c = this.accessForm.get(ctrl)!;
        c.clearValidators();
        c.reset('');
      });

      // Luego, según el grupo, activo los controles necesarios
      if (g === 'Docente') {
        ['subjectSchool','courseTeacher','sectionTeacher','modalidad']
          .forEach(ctrl => this.accessForm.get(ctrl)!.setValidators(Validators.required));
      }
      else if (g === 'Estudiantes') {
        ['courseStudent','schoolYear']
          .forEach(ctrl => this.accessForm.get(ctrl)!.setValidators(Validators.required));
      }
      else if (g === 'Padre') {
        ['nameChildren','courseFather','sectionFather','workshop']
          .forEach(ctrl => this.accessForm.get(ctrl)!.setValidators(Validators.required));
      }
      // Actualizo el estado del formulario
      this.accessForm.updateValueAndValidity();
    });
  }

  // ---------- Teléfono ----------
  private digitsOnly(s: string): string {
    return (s ?? '').replace(/\D+/g, '');
  }
  private formatPhone(value: string): string {
    const d = this.digitsOnly(value).slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`;
    return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  }
  onPhoneInput(ev: any) {
    const raw: string = ev?.detail?.value ?? ev?.target?.value ?? '';
    const formatted = this.formatPhone(raw);
    this.accessForm.patchValue({ phone: formatted }, { emitEvent: false });
    this.ctrl('phone')!.updateValueAndValidity({ onlySelf: true });
  }
  onPhoneKeyDown(ev: KeyboardEvent) {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
    if (allowed.includes(ev.key)) return;
    if (!/^\d$/.test(ev.key)) ev.preventDefault();
  }
  private phoneValidator = (c: AbstractControl) => {
    const len = this.digitsOnly(String(c.value ?? '')).length;
    return len === 10 ? null : { phone: true };
  };

   ctrl(n: string) { return this.accessForm.get(n)!; }
  async submitRequest() {
    if (this.accessForm.invalid) return;

    const formData = this.accessForm.value;
    const confirmed = await this.interactionService.presentAlert(
      'Envio de Solicitud de Acceso',
      'Usted esta realizando una solicitud de Acceso',
      'Cancelar');

    if (confirmed){

    try {
      await this.interactionService.showLoading('Enviando Solicitud...');
      await this.accessService.saveRequest(formData);
      this.interactionService.dismissLoading();
      await this.accessService.sendMailToAdmin(formData); // correo al admin
      await this.accessService.sendMailToUser(formData); // 👈 correo al solicitante
      this.interaction.showToast('✅ Solicitud enviada correctamente');
      this.goLogin();
      this.accessForm.reset();
    } catch (err) {
      console.error('❌ Error al enviar la solicitud:', err);
      this.interaction.showToast('❌ Error al enviar la solicitud');
    }
  }
}

   loadGroups() {
    this.groupService.getGroups().subscribe({
      next: (group) => {
        this.groups = group;
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.interactionService.showToast('Error al cargar grupos');
      },
    });
  }
  goLogin(){
    this.router.navigate(['/auth']);
  }

}
