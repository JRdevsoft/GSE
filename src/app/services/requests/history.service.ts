import { Injectable } from '@angular/core';
import { supabase } from 'src/app/core/supabase.client';
import { Models } from 'src/app/models/models';


@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  /**
   * Obtiene historial con filtros aplicados en el servidor.
   * Usa join por FK requests.user_id -> usersapp.id (alias usersapp).
   */
  async getHistory(filters: Models.History.HistoryFilters): Promise<Models.History.RequestHistoryItem[]> {
    let query = supabase
      .from('requests')
      .select(
        `
        id,
        created_at,
        typeName,
        formData,
        usersapp:usersapp!inner (
          id, name, phone, email
        )
      `
      )
      .order('created_at', { ascending: false });

    // Filtro por nombre
    if (filters.mode === 'name' && filters.search && filters.search.trim() !== '') {
      query = query.ilike('usersapp.name', `%${filters.search.trim()}%`);
    }

    // Filtro por teléfono
    if (filters.mode === 'phone' && filters.search && filters.search.trim() !== '') {
      query = query.ilike('usersapp.phone', `%${filters.search.trim()}%`);
    }

    // Filtro por rango de fechas (00:00:00 a 23:59:59)
    if (filters.mode === 'date' && filters.dateFrom && filters.dateTo) {
      const from = `${filters.dateFrom}T00:00:00`;
      const to = `${filters.dateTo}T23:59:59`;
      query = query.gte('created_at', from).lte('created_at', to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as unknown as Models.History.RequestHistoryItem[];
  }
}
