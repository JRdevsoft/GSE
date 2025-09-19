export interface CategoriesI{
  id?: string;
  name: string;
  created_at?: string;
}

export interface SubCategoriesI{
  id?: string;
  name: string;
  category_id?: string;
  created_at?: string;
}


