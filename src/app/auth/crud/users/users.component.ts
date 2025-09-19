import { Component, OnInit, ViewChild } from '@angular/core';
import { Models } from 'src/app/models/models';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonIcon,
  IonFab,
  IonFabButton,
  IonMenuButton,
  IonButton,
  IonModal,
  IonSearchbar,
  IonInput,
  IonText,
  IonSelect,
  IonSelectOption,
  IonPopover,
  PopoverController, IonBadge } from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  create,
  trash,
  add,
  createOutline,
  trashOutline, logOutOutline, keyOutline, informationCircleOutline } from 'ionicons/icons';
import { InteractionService } from 'src/app/services/interaction.service';
import { GroupsI } from 'src/app/models/groups.models';
import { GroupService } from 'src/app/services/crud/group.service';
import { UserService } from 'src/app/services/crud/user.service';
import { SupabaseService } from 'src/app/services/supabase/supabase.service';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    IonPopover,
    IonText,
    IonInput,
    IonModal,
    IonButton,
    IonIcon,
    IonItem,
    IonList,
    IonLabel,
    IonContent,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonMenuButton,
    FormsModule,
    CommonModule,
    IonFab,
    IonFabButton,
    ReactiveFormsModule,
    IonSelectOption,
    IonAvatar,
    IonSelect,
    RouterLink
  ],
})
export class UsersComponent  {
  users: Models.User.UsersI[] = [];
  groups: GroupsI[] = [];
  newUser!: Models.User.UsersI;
  selectedGroupId: string | null = null;
  photo: File | null = null;
  isEditing = false;
  listValidate = {
    hasMin: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false
  }
  passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?':{}|<>]).{8,}$/;
  formUser: any = {
    name: '',
    email: '',
    phone: ''
  };
  editingUserId: string | null = null;
  //BUSQUEDA // Lista original de usuarios
  filteredUsers: Models.User.UsersI[] = []; // Lista filtrada de usuarios
  selectedPhoto: File | null = null;

  userPhoto: string = '';
  showUserMenu = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedPhoto = file;
  }

  @ViewChild('modalCreate') modalCreate!: IonModal;
  @ViewChild('modalUpdate') modalUpdate!: IonModal;

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private supabaseService: SupabaseService,
    private interactionService: InteractionService,
    private router: Router,
    private popoverCtrl: PopoverController
  ) {
    addIcons({logOutOutline,keyOutline,informationCircleOutline,create,trash,add,createOutline,trashOutline});
  }

 async ionViewWillEnter() {
    this.loadGroups();
    this.loadUsers();
    this.userPhoto = await this.supabaseService.loadPhoto();
  }

  // Formatea con guiones automáticamente
formatPhone(event: any) {
  let input = event.target.value || '';

  // Elimina todo lo que no sea dígito
  input = input.replace(/\D/g, '');

  // Máximo 10 dígitos
  if (input.length > 10) {
    input = input.substring(0, 10);
  }

  // Aplica formato XXX-XXX-XXXX
  if (input.length > 6) {
    input = input.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3');
  } else if (input.length > 3) {
    input = input.replace(/(\d{3})(\d{0,3})/, '$1-$2');
  }

  this.newUser.phone = input;
}
onPasswordInput(ev: any) {
  const v: string = ev?.target?.value || '';

  this.listValidate.hasMin = v.length >= 8;
  this.listValidate.hasUpper = /[A-Z]/.test(v);
  this.listValidate.hasNumber = /\d/.test(v);
  this.listValidate.hasSpecial = /[!@#$%^&*(),.?':{}|<>]/.test(v);
}
//solo letras
allowOnlyLetters(event: KeyboardEvent) {
  const inputChar = String.fromCharCode(event.keyCode || event.which);
  // Solo letras, espacios, ñ, Ñ y vocales acentuadas
  const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
  if (!pattern.test(inputChar)) {
    event.preventDefault();
  }
}
//solo numeros
allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  // Solo números (0–9) y teclas especiales (backspace=8, tab=9, enter=13)
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
  }
}

// Valida el formato (ej: 809-555-1234)
  isValidPhone(phone: string): boolean {
    return /^\d{3}-\d{3}-\d{4}$/.test(phone);
  }
  logout() {
    this.supabaseService.signOut();
    this.router.navigate(['/auth']);
  }

  changePassword(){
    this.router.navigate(['/changed-pass']);
  }
  filterUsers(searchTerm: string) {
    if (!searchTerm) {
      this.filteredUsers = this.users;
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.email.toLowerCase().includes(lowerCaseSearch)
    );
  }
  openModalEdit() {
    this.modalUpdate.present(); // Muestra el primer modal
  }

  openModalCreate() {
    this.resetForm();
    this.modalCreate.present(); // Muestra el primer modal
  }

  cancelModalCreate() {
    this.modalCreate.dismiss(null, 'cancel');
  }
  cancelModalUpdate() {
    this.modalUpdate.dismiss(null, 'cancel');
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.interactionService.showToast('Error al cargar usuarios');
      },
    });
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

  compareGroups =  (g1: any, g2: any): boolean => {
    return g1 && g2 ? g1.id === g2.id : false;
  };
  getDefaultUsers(): Models.User.UsersI {
    return {
      name: '',
      email: '',
      group_id: {
        id: '',
        name: '',
        parentId: '',
        permition_states: false,
        permition_groups: false,
        permition_users: false,
        permition_typerequests: false,
        permition_requests: false,
        permition_viewsolic: false,
      },
      photo: '',
      phone: '',
    };
  }
  uploadPhoto(event: any) {
    this.photo = event.target.files[0];
  }

  resetForm() {
    this.newUser = {
      id: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      group_id: {
        id: '',
        name: '',
        parentId: '',
        permition_states: false,
        permition_groups: false,
        permition_users: false,
        permition_typerequests: false,
        permition_requests: false,
        permition_viewsolic: false,
      },
      photo: '',
    };
    this.photo = null;
    this.selectedPhoto = null;
  }
  getGroupNameById(id: string): string {
    const group = this.groups.find((g) => g.id === id);
    return group ? group.name : 'Sin grupo';
  }

    async addUser() {
    if (!this.photo) {
      this.interactionService.showToast('Debes seleccionar una foto 📸');
      return;
    }

    this.interactionService.showLoading();
    try {
      await this.supabaseService.signUp(
        this.newUser.name,
        this.newUser.email,
        this.newUser.phone,
        this.newUser.password,
        this.newUser.group_id,
        this.photo
      );

      this.loadUsers();
      this.modalCreate.dismiss();
      this.resetForm();
      this.interactionService.showToast('Usuario registrado con éxito ✅');
    } catch (e: any) {
      console.error('Error en registro:', e);

      // Mensajes específicos por código
      if (e?.status === 409 || e?.code === '23505' || /already registered/i.test(e?.message)) {
        //this.interactionService.showToast('El correo ya está registrado ❌');
        this.interactionService.showExistsAlert('No se pudo registrar', 'El correo ya está registrado.');
      } else if (e?.code === '23503') {
        // Violación de FK: o id no existe en auth.users o group_id inválido
        this.interactionService.showToast('Datos inválidos: verifique grupo y credenciales (FK) ❌');
      } else {
        this.interactionService.showToast('Error al registrar usuario ❌');
      }
    } finally {
      // 🔒 Nunca se queda colgado el loading
      this.interactionService.dismissLoading();
    }
  }
  editUser(user: Models.User.UsersI) {
    this.isEditing = true;
    this.editingUserId = user.id!;
    this.newUser = { ...user };
    this.selectedGroupId = user.group_id?.id ?? null;
    this.modalUpdate.present();
  }

  async updateUser() {
    if (!this.editingUserId) return;

    // Validaciones básicas
    if (!this.newUser.name?.trim()) {
      return this.interactionService.showToast('El nombre es obligatorio');
    }
    if (!this.newUser.email) {
      return this.interactionService.showToast('El correo es obligatorio');
    }

    // Armo el payload, incluyendo group_id sólo si no es null
    const payload: any = {
      name:  this.newUser.name.trim(),
      email: this.newUser.email,
      phone: this.newUser.phone,
      group_id: this.selectedGroupId,
      photo: this.newUser.photo
    };

    await this.interactionService.showLoading('Actualizando usuario...');
    this.userService.updateUser(this.editingUserId, payload)
      .subscribe({
        next: updated => {
          // Reemplazo el usuario en el array
          const idx = this.users.findIndex(u => u.id === updated.id);
          if (idx > -1){
            this.users = [
              ...this.users.slice(0, idx),
              updated,                              // 👈 ya viene con group_id {id,name}
              ...this.users.slice(idx + 1),
            ];
          } //this.users[idx] = updated;

          this.interactionService.dismissLoading();
          this.modalUpdate.dismiss();
          this.interactionService.showToast('✅ Usuario actualizado');
          this.isEditing = false;
          this.editingUserId = null;
        },
        error: err => {
          console.error('Error al actualizar usuario:', err);
          this.interactionService.dismissLoading();
          this.interactionService.showToast('❌ Error al actualizar usuario');
        }
      });
  }
  // editUser(user: Models.User.UsersI) {
  //   this.isEditing = true;
  //   this.editingUserId = user.id!;
  //   const groupId = user.group_id as any;
  //     if (typeof groupId === 'string') {
  //       const group = this.groups.find(g => g.id === groupId);
  //       if (group) {
  //         this.newUser.group_id = group;
  //       } else {
  //         console.warn('⚠️ No se encontró el grupo con id:', groupId);
  //       }
  //     } else {
  //       this.newUser.group_id = user.group_id;
  //     }
  //   this.newUser = {
  //     name:  user.name,
  //     email: user.email,
  //     phone: user.phone,
  //     photo: user.photo,
  //     group_id: groupId
  //   };

  //   this.modalUpdate.present(); // Muestra el modal
  // }

  // async updateUser() {
  //   if (!this.editingUserId) return;

  //   const userToUpdate: Partial<any> = {
  //     name: this.newUser.name,
  //     email: this.newUser.email,
  //     phone: this.newUser.phone,
  //     photo: this.newUser.photo,
  //     group_id: typeof this.newUser.group_id === 'string'
  //           ? this.newUser.group_id
  //           : this.newUser.group_id.id
  //   };
  //   console.log('🆔 ID del usuario que se va a editar:', this.editingUserId);
  //   console.log('Esto es userToUpadate: ', userToUpdate);

  //   this.userService.updateUser(this.editingUserId, userToUpdate).subscribe({
  //     next: () => {
  //     this.modalUpdate.dismiss();
  //     this.interactionService.showToast('✅ Usuario actualizado');
  //     this.loadUsers();
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.interactionService.showToast('❌ Error al actualizar usuario');
  //     }
  //   });
  // }

  async deleteUser(id: string) {
    const confirm = await this.interactionService.presentAlert(
      'Eliminar Usuario',
      '¿Estás seguro de eliminar este usuario?',
      'Cancelar'
    );
    console.log('Este es el id de ELIMINAR: ', id);

    if (confirm) {
      await this.interactionService.showLoading('Eliminando...');
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.filteredUsers = [...this.users];
          this.loadUsers();
          this.interactionService.showToast('Usuario eliminado');
        },
        error: (err) => {
          this.interactionService.showToast('Error al eliminar usuario');
          console.error(err);
        },
        complete: () => this.interactionService.dismissLoading(),
      });
    }
  }
}
