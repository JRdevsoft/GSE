export interface GroupsI{
  id?: string;
  name: string;
  parentId?: string | null;
  permition_states?: boolean;
  permition_groups?: boolean;
  permition_users?: boolean;
  permition_typerequests?: boolean;
  permition_requests?: boolean;
  permition_viewsolic?: boolean;
  permition_state_requests?: boolean;
  permition_access_requests?: boolean;
  permition_init_excuse?: boolean;
  permition_init_request?: boolean;
  permition_history_requests?: boolean;
  permition_config?: boolean;
}

export interface GroupI{
  id?: number;
  name: string;
  parentId: number | null;
}

export interface GroupWithParentName extends GroupsI {
  parentName?: string | null;
}

export interface GroupsFilters {
  mode: 'all' | 'name' | 'phone' | 'date';
  search?: string;            // name or phone, según mode
  dateFrom?: string | null;   // ISO yyyy-mm-dd
  dateTo?: string | null;     // ISO yyyy-mm-dd
}
