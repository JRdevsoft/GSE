import { Injectable } from '@angular/core';
import { supabase } from 'src/app/core/supabase.client';
import { SubCategoriesI } from 'src/app/models/categories.models';

@Injectable({
  providedIn: 'root'
})
export class SubCategoriesService {

  private table = 'sub_categories';

  async getAll(): Promise<SubCategoriesI[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getByCategory(categoryId: string): Promise<SubCategoriesI[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // async add(payload: { name: string; category_id: string }): Promise<SubCategoriesI> {
  //   const { data, error } = await supabase
  //     .from(this.table)
  //     .insert(payload)
  //     .single();
  //   if (error) throw error;
  //   return data;
  // }

  async add(sub: Partial<SubCategoriesI>): Promise<SubCategoriesI> {
    const { data, error } = await supabase
      .from(this.table)
      .insert(sub)
      .single();
    if (error) throw error;
    return data as SubCategoriesI;
  }

  async update1(id: string, sub: Partial<SubCategoriesI>): Promise<SubCategoriesI> {
    const { data, error } = await supabase
      .from(this.table)
      .update(sub)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as SubCategoriesI;
  }

  async update(id: string, payload: { name?: string; category_id?: string }
  ): Promise<SubCategoriesI> {
    const { data, error } = await supabase
      .from(this.table)
      .update(payload)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as SubCategoriesI;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
