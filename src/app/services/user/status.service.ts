import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { GroupsI } from 'src/app/models/groups.models';
import { Models } from 'src/app/models/models';

function normalizeOne<T>(rel: any): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : (rel ?? null);
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  setUserStatus(userId: string, enabled: boolean): Observable<Models.User.UsersI> {
    return from(
      supabase
        .from('usersapp')
        .update({ status: enabled })
        .eq('id', userId)
        .select(`
          id, name, email, phone, photo, status, group_id,
          group:groups!usersapp_group_id_fkey ( id, name )
        `)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) throw new Error('No se encontró el usuario actualizado');

        const groupObj = normalizeOne<GroupsI>((data as any).group);
        const u: Models.User.UsersI = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          photo: data.photo,
          status: !!data.status,
          group_id: groupObj
        };
        return u;
      })
    );
  }

  /**
   * Atajo para alternar el estado actual.
   */
  toggleUserStatus(userId: string, current: boolean): Observable<Models.User.UsersI> {
    return this.setUserStatus(userId, !current);
  }
}
