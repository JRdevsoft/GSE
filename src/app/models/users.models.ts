import { GroupsI } from "./groups.models";

export namespace ModelsUsers {

  export interface UsersI{
    id?: string,
    name: string,
    email: string,
    phone?: string,
    password?: string,
    status?: boolean,
    group_id: GroupsI | null,
    photo?: string,
  }
}
