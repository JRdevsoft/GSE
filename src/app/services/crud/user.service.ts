import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { normalizeOne } from 'src/app/helper/nomalization';
import { GroupsI } from 'src/app/models/groups.models';
import { Models } from 'src/app/models/models';

type PartialUserPayload = Partial<Models.User.UsersI> & {
  group_id?: string | GroupsI | null;
  // photo puede llegar como string (url) o File nuevo
  photoFile?: File | null;
};

export function getPublicUrl(bucket: string, path: string): string | null {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
@Injectable({
  providedIn: 'root'
})

export class UserService {

  private async maybeUploadPhoto(userId: string, photoFile?: File | null): Promise<string | undefined> {
    if (!photoFile) return undefined;
    const filePath = `users/${userId}/${Date.now()}_${photoFile.name}`;
    const { error } = await supabase.storage.from('devsoftimg').upload(filePath, photoFile, { upsert: true });
    if (error) throw error;
    return getPublicUrl('devsoftimg', filePath) ?? undefined;
  }

  // Obtener todos los usuarios
  // getUsers(): Observable<Models.User.UsersI[]> {
  //   return from(this.fetchUsers());
  // }
  // private async fetchUsers(): Promise<Models.User.UsersI[]> {
  //   const { data, error } = await supabase
  //     .from('usersapp')
  //     .select('*,  group_id(name)');
  //   if (error) throw error;
  //   console.log('[Supabase] Data cargada:', data);
  //   return data as Models.User.UsersI[];
  // }

  getUsers(): Observable<Models.User.UsersI[]> {
  return from(
    supabase
      .from('usersapp')
      .select(`
        id, name, email, phone, photo, group_id,
        group:groups!usersapp_group_id_fkey ( id, name )
      `)
      .order('name', { ascending: true })
  ).pipe(
    map(({ data, error }) => {
      if (error) throw error;
      const rows = (data ?? []) as any[];
      return rows.map(r => {
        const groupObj = Array.isArray(r.group) ? (r.group[0] ?? null) : (r.group ?? null);
        const user: Models.User.UsersI = {
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          photo: r.photo,
          // 🔴 IMPORTANTE: la UI espera objeto, no string
          group_id: groupObj, // { id, name } | null
        };
        return user;
      });
    })
  );
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

  // updateUser(id: string, user: PartialUserPayload): Observable<Models.User.UsersI> {
  //   const gid =
  //     typeof user.group_id === 'string'
  //       ? user.group_id
  //       : (user.group_id as GroupsI | null | undefined)?.id ?? null;

  //   return from((async () => {
  //     // 1) Si hay archivo nuevo, súbelo y usa su URL
  //     const photoUrl = await this.maybeUploadPhoto(id, user.photoFile as File | undefined);

  //     // 2) Arma payload limpio (no envíes keys undefined)
  //     const payload: any = {
  //       name: user.name?.trim(),
  //       email: user.email,
  //       phone: user.phone,
  //       group_id: gid,
  //     };
  //     if (photoUrl !== undefined) payload.photo = photoUrl;
  //     if (user.photo && !user.photoFile) payload.photo = user.photo; // si ya traía URL y no se cambió

  //     // 3) Update + join del grupo y normalización
  //     const { data, error } = await supabase
  //       .from('usersapp')
  //       .update(payload)
  //       .eq('id', id)
  //       .select(`
  //         id, name, email, phone, photo, group_id,
  //         group:groups!usersapp_group_id_fkey ( id, name )
  //       `)
  //       .maybeSingle();

  //     if (error) throw error;
  //     if (!data) throw new Error('No se encontró la fila actualizada');

  //     // 4) Normaliza: UI espera group_id como objeto
  //     const normalized: Models.User.UsersI = {
  //       ...data,
  //       group_id: data.group ?? null, // 👈 ahora tu UI puede usar user.group_id?.name
  //     };

  //     // opcional: elimina alias temporal
  //     delete (normalized as any).group;

  //     return normalized;
  //   })());
  // }

  updateUser(id: string, user: Partial<Models.User.UsersI>): Observable<Models.User.UsersI> {
    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      //group_id: typeof user.group_id === 'object' ? user.group_id.id : user.group_id,
      group_id: typeof user.group_id === 'string'
        ? user.group_id
        : (user.group_id as any)?.id,
      photo: user.photo,
    };
    return from(
      supabase
        .from('usersapp')
        .update(payload)
        .eq('id', id)
       .select(`
          *,
          group:groups!usersapp_group_id_fkey ( id, name )
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
  deleteUsers(id: string): Observable<any> {
    return from(
      supabase
        .from('usersapp')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) {
          throw new Error('No se eliminó ninguna fila');
        }
        console.log('🗑 Usuario eliminado (server):', data);
        return data;
      })
    );
  }
  deleteUser(id: string): Observable<any> {
    return from(supabase.from('usersapp').delete().eq('id', id));
  }
}
