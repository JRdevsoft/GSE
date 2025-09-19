import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { CategoriesI } from 'src/app/models/categories.models';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  table: string = 'categories'
    // Obtener todas las categorias
  getCategories(): Observable<CategoriesI[]> {
    return from(supabase.from(this.table).select('*').then(({ data }) => data as CategoriesI[]));
  }

  // Agregar Categoria
  addCategory(category: CategoriesI): Observable<any> {
    return from(supabase.from(this.table).insert([category]));
  }

  // Actualizar Categoria
  updateCategory(id: string, category: Partial<CategoriesI>): Observable<any> {
    return from(supabase.from(this.table).update(category).eq('id', id));
  }

  // Eliminar Categoria
  deleteCategory(id: string): Observable<any> {
    return from(supabase.from(this.table).delete().eq('id', id));
  }

  async getInitialCategory(): Promise<string | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('❌ Error al buscar categoria inicial:', error.message);
      return null;
    }

    return data?.id ?? null;
  }
}
