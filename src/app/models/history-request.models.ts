export namespace ModelsHistory {

  export interface RequestHistoryItem {
    id: string;
    created_at: string;
    typeName: string | null;
    formData: any;
    usersapp: { id: string; name: string | null; phone: string | null; email: string | null; photo: string | null } | null;
  }

  export interface HistoryFilters {
  mode: 'all' | 'name' | 'phone' | 'date';
  search?: string;            // name or phone, según mode
  dateFrom?: string | null;   // ISO yyyy-mm-dd
  dateTo?: string | null;     // ISO yyyy-mm-dd
}
}
