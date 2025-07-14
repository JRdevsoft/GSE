import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { Models } from 'src/app/models/models';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Obtener todos los usuarios
  getUsers(): Observable<Models.User.UsersI[]> {
    return from(this.fetchUsers());
  }
  private async fetchUsers(): Promise<Models.User.UsersI[]> {
    const { data, error } = await supabase
      .from('usersapp')
      .select('*,  group_id(name)');
    if (error) throw error;
    console.log('[Supabase] Data cargada:', data);
    return data as Models.User.UsersI[];
  }

  // Agregar usuario
  addUser(user: Models.User.UsersI): Observable<void> {
    return from(
      supabase
        .from('usersapp')
        .insert([user])
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  updateUser(id: string, user: Partial<Models.User.UsersI>): Observable<Models.User.UsersI> {
    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      //group_id: typeof user.group_id === 'object' ? user.group_id.id : user.group_id,
      group_id: typeof user.group_id === 'string'
        ? user.group_id
        : (user.group_id as any)?.id
    };

    return from(
      supabase
        .from('usersapp')
        .update(payload)
        .eq('id', id)
       .select(`
          *,
          group:group_id (*)
        `)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) {
          throw new Error('No se encontró la fila actualizada');
        }
        console.log('🔄 Usuario actualizado (server):', data);
        return data;
      })
    );
  }


  // Eliminar usuario
  deleteUser(id: string): Observable<void> {
    // return from(
    //   supabase
    //     .from('usersapp')
    //     .delete()
    //     .eq('id', id)
    //     .select(`
    //       *,
    //       group:group_id (*)
    //     `)
    //     .maybeSingle()
    // ).pipe(
    //   map(({ data, error }) => {
    //     if (error) throw error;
    //     if (!data) {
    //       throw new Error('No se eliminó ninguna fila');
    //     }
    //     console.log('🗑 Usuario eliminado (server):', data);
    //     return data;
    //   })
    // );

    return from(
    supabase
      .from('usersapp')
      .delete()
      .eq('id', id)
  ).pipe(
    map(({ error }) => {
      if (error) throw error;       // aquí cualquier violación de FK o fallo
      console.log('🗑 Usuario eliminado correctamente');
      return;
    })
  );
  }
}
