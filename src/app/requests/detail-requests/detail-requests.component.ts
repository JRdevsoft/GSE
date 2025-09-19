import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RequestsI } from 'src/app/models/requests.models';
import { StateI } from 'src/app/models/state.models';
import { StatesService } from 'src/app/services/crud/states.service';
import { InteractionService } from 'src/app/services/interaction.service';
import { RequestsService } from 'src/app/services/requests/requests.service';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCardTitle,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCardSubtitle,
  IonImg,
  IonBackButton, IonList, IonPopover, IonAvatar, IonIcon, IonText } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImageViewModalComponent } from './image-view-modal/image-view-modal.component';
import { ModalController } from '@ionic/angular';
import { filter, firstValueFrom, throwError } from 'rxjs';
import { getIdFromMaybeObject } from 'src/app/helper/utils';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { PopoverController, IonToggle } from '@ionic/angular/standalone';
import { UserMenuComponent } from 'src/app/components/user-menu/user-menu.component';

@Component({
    selector: 'app-detail-requests',
    templateUrl: './detail-requests.component.html',
    styleUrls: ['./detail-requests.component.scss'],
    providers: [ModalController],
    imports: [IonIcon, IonAvatar, IonPopover, IonList,
        IonBackButton,
        IonCardSubtitle,
        IonLabel,
        IonItem,
        IonCardContent,
        IonCard,
        IonCardTitle,
        IonCardHeader,
        IonContent,
        IonTitle,
        IonButton,
        IonButtons,
        IonToolbar,
        IonHeader,
        IonSelect,
        IonSelectOption,
        FormsModule,
        CommonModule,
        IonToggle,
        RouterLink
    ]
})
export class DetailRequestsComponent implements OnInit {
  request!: RequestsI;
  states: StateI[] = [];
  selectedStateId: string | null = null;
  isLoading = true;
  attachEnabled = false;
  requestUserData: { userName: string | null; userPhone: string | null } = {
      userName: null,
      userPhone: null,
    };
  userPhoto: string = '';
  showUserMenu = false;
  selectedDoc: File | null = null;
  requestId!: string;
  documentUrl: string | null = null;

  originalStateId: string | null = null;
  isStateChanged = false;

  modalController = inject(ModalController);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestsService: RequestsService,
    private supabaseNameService: SupabaseService,
    private statesService: StatesService,
    private interactionService: InteractionService,
    private popoverCtrl: PopoverController
  ) {}

  docPreviewUrl: string | null = null;

  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedDoc = input.files[0];
    this.docPreviewUrl = URL.createObjectURL(this.selectedDoc);
  }

  async loadDocument(){
    // Aquí ya puedes pasar `file` a tu servicio para subirlo
    try {
      await this.interactionService.showLoading('Subiendo documento...');
      await this.requestsService.attachDocument(this.requestId, this.selectedDoc);
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Documento adjuntado ✅');

    } catch (err: any) {
      this.interactionService.dismissLoading();
      this.interactionService.showToast('Error: ' + err.message);
      console.error(err);
    }
  }

  objectKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }
  async ngOnInit() {

    const requestId = this.route.snapshot.paramMap.get('id');
    if (!requestId) {

      this.router.navigate(['/view-excuse']);
      return;
    }
    this.requestId = requestId; // <-- SOLUCIÓN
    await this.loadRequestData(requestId);
    this.userPhoto =  await this.supabaseNameService.loadPhoto();
  }

  async openUserMenu(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: UserMenuComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
    });
    await popover.present();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.supabaseNameService.signOut();
    this.router.navigate(['/auth']);
  }

  onStateChange(newValue: string) {
    this.originalStateId = newValue; // Actualiza el original al nuevo valor
    this.isStateChanged = true;
  }
  async loadRequestData(requestId: string) {
    try {
      // 1. Cargar estados primero
      await firstValueFrom(this.statesService.getStates()).then((states) => {
        this.states = states;
      });

      // 2. Cargar solicitud
      const request = await this.requestsService.getRequestById(requestId);
      if (!request) {
        this.router.navigate(['/view-excuse']);
        return;
      }

      this.request = request;
      // Cargar nombre y teléfono del solicitante a partir del user_id
      if (typeof this.request.user_id === 'string') {
        console.log('User ID:', this.request.user_id);

        const userData = await this.supabaseNameService.getUserDataById(this.request.user_id);
        this.requestUserData.userName = userData.name;
        this.requestUserData.userPhone = userData.phone;
}
      //this.selectedStateId = typeof request.state_id === 'object' ? request.state_id?.id : request.state_id
      this.selectedStateId = getIdFromMaybeObject(request.state_id);
      this.originalStateId = this.selectedStateId; // Guardamos el original

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      this.interactionService.showToast('Error al cargar los datos');
    } finally {
      this.isLoading = false;
    }
  }

  async updateStateDoc() {
    if (!this.selectedStateId) {
      this.interactionService.showToast('Selecciona un estado válido');
      return;
    }
    try {
      await this.requestsService.updateRequestState(
        this.request.id!,
        this.selectedStateId
      );

      if (this.attachEnabled) {
        if (!this.selectedDoc) {
          throw new Error('Debes seleccionar un documento primero.');
        }
        await this.requestsService.attachDocument(
          this.requestId,
          this.selectedDoc
        );
      }
      //this.request.state_id = this.selectedStateId;

      this.goToWhatsApp(this.requestUserData.userName, this.requestUserData.userPhone);

      //this.loadDocument();
      this.interactionService.showToast('✅ Estado actualizado correctamente');
      this.router.navigate(['/view-excuse']);
    } catch (error) {
      console.error(error);
      this.interactionService.showToast('❌ Error al actualizar estado');
    }
  }

  isImage(value: string): boolean {
    return (
      typeof value === 'string' &&
      (value.startsWith('data:image') || value.startsWith('http'))
    );
  }

  isStringOrNumber(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }

  goBack() {
    this.router.navigate(['/view-excuse']);
  }
  changePassword(){
    this.router.navigate(['/changed-pass']);
  }

  async openImageModal(imageUrl: string) {
    const modal = await this.modalController.create({
      component: ImageViewModalComponent, // Asegúrate de tener este componente creado
      componentProps: {
        image: imageUrl,
      },
      cssClass: 'image-modal',
    });

    return await modal.present();
  }

  //Envio de Mensaje via Whatsapp
  goToWhatsApp(name: string, rawPhone: string) {
    if (!name || !rawPhone) {
    this.interactionService.showToast('Nombre o número de teléfono no disponibles.');
    return;
  }
  // 1) Elimina cualquier carácter que no sea número
  const digits = rawPhone.replace(/\D+/g, '');

  if (!digits || digits.length < 10) {
    this.interactionService.showToast('Número de teléfono inválido.');
    return;
  }

  // 2) Código de país por defecto (puedes cambiarlo según tu país)
  const defaultCountryCode = '1'; // Ej: República Dominicana = '1', México = '52'
  const phone = digits.startsWith(defaultCountryCode)
    ? digits
    : defaultCountryCode + digits;

  // 3) Mensaje personalizado (puedes modificarlo o pasarlo como parámetro)
  const message = `¡Hola ${name}! 👋\n\nSu solicitud ha sido procesada con éxito. ✅\n\nGracias por confiar en nosotros.`;

  // 4) Construcción de URL segura para WhatsApp
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // 5) Intentar abrir WhatsApp
  try {
    const newWindow = window.open(whatsappUrl, '_blank');
    if (!newWindow) {
      throw new Error('No se pudo abrir WhatsApp. Verifica que no estén bloqueadas las ventanas emergentes.');
    }
  } catch (error) {
    this.interactionService.showToast('Error al abrir WhatsApp: ' + error);
  }
}
}
