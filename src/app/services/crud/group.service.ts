import { Injectable } from '@angular/core';
import { concatMap, defer, from, map, mapTo, mergeMap, Observable, tap } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { GroupsI, GroupWithParentName } from 'src/app/models/groups.models';
// import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
// import { from, Observable } from 'rxjs';
// import { GroupsI } from 'src/app/models/groups.models';

@Injectable({
  providedIn: 'root'
})
export class GroupService {


getGroupsReq(): Observable<GroupsI[]> {
   return defer(() =>
    supabase
      .from('groups')
      .select(`
        id,
        name
      `)
      .order('name', { ascending: true })
  ).pipe(
    map(({ data, error }) => {
      if (error) throw error;
      // data puede ser null si la tabla está vacía
      return (data ?? []) as GroupsI[];
    })
  );
}
  // Obtener todos los grupos

  getGroups(): Observable<(GroupsI & { parentId?: string })[]> {
    return from(
      supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true }) // opcional
        .then(({ data, error }) => {
          if (error) throw error;
          return data as GroupsI[];
        })
    ).pipe(
      map(groups => groups.map(g => ({
        ...g,
        parentId: groups.find(p => p.id === g.parentId)?.name
      })))
    );;
  }

  getGroupsSolict(): Observable<GroupsI[]> {
      return from(supabase.from('groups').select('*').then(({ data }) => data as GroupsI[]));
    }

  // Agregar grupo
  addGroup(group: GroupsI): Observable<any> {

     // Sanitizar el parentId: si viene vacío, lo convertimos en null
  const cleanGroup = {
    ...group,
    parentId: group.parentId ? group.parentId : null
  };

  return from(
    supabase
      .from('groups')
      .insert([cleanGroup])
      .select()  // Opcional: si quieres que devuelva el grupo creado
      .then(({ data, error }) => {
        if (error) {
          console.error('🚨 Error al insertar grupo:', error.message);
          throw error;
        }
        console.log('✅ Grupo agregado:', data);
        return data;
      })
  );
    // return from(
    //   supabase
    //     .from('groups')
    //     .insert([group])
    //     .then(({ error }) => {
    //       if (error) throw error;
    //     })
    // );
  }

  // Actualizar grupo
  updateGroup(id: string, group: Partial<GroupsI>): Observable<any> {
    const { id: _omit, ...payload } = group;
    return from(
      supabase
        .from('groups')
        .update(payload)
        .eq('id', id)
        .select()
        .then(({ data, error }) => {
        if (error) throw error;
        // devolvemos la fila actualizada
        return data![0];
      })
    );
  }
  deleteGroup(id: string): Observable<any> {
     return from(
      supabase
        .from('usersapp')
        .update({ group_id: null })
        .eq('group_id', id)
    ).pipe(
      // 1) usuarios desvinculados
      tap(({ error }) => {
        if (error) throw error;
      }),
      // 2) desvincular origin en requests
      mergeMap(() =>
        from(
          supabase
            .from('requests')
            .update({ group_origin: null })
            .eq('group_origin', id)
        )
      ),
      tap(({ error }) => {
        if (error) throw error;
      }),
      // 3) desvincular destine en requests
      mergeMap(() =>
        from(
          supabase
            .from('requests')
            .update({ group_destine: null })
            .eq('group_destine', id)
        )
      ),
      tap(({ error }) => {
        if (error) throw error;
      }),
      // 4) borrar el grupo
      mergeMap(() =>
        from(
          supabase
            .from('groups')
            .delete()
            .eq('id', id)
        )
      ),
      tap(({ error }) => {
        if (error) throw error;
      }),
      // devolvemos void para el consumer
      mapTo(void 0)
    );
  }
}
