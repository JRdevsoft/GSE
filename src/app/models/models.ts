import { ModelsUsers } from 'src/app/models/users.models';
import { ModelsNotifications } from 'src/app/models/notifications.models';
import { ModelsAccess } from 'src/app/models/access.models';
import { ModelsHistory } from 'src/app/models/history-request.models';

export namespace Models {

    export import User = ModelsUsers;
    //export import Tienda = ModelsTienda;
    export import Notifications = ModelsNotifications;
    export import AccessReq = ModelsAccess;
    export import History = ModelsHistory;

}
