// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabaseUrl: 'https://adryaovnvageedimmbmg.supabase.co', //'https://imfolqngdrsymfotwiib.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnlhb3ZudmFnZWVkaW1tYm1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTA0NDAsImV4cCI6MjA3Mzk4NjQ0MH0.4MzEcSd2Rmsr4SPs6w8adFhb29xElveBU-DLUQIV42g', //'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZm9scW5nZHJzeW1mb3R3aWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjE3MzYsImV4cCI6MjA1NzM5NzczNn0.RyL2blevo_8Jt1lUbAzs1YuB5OY_3Oux3GDNjZvhCiQ',
  emailjs: {
    serviceId: 'service_1vwb5o5',
    templateIdUser: 'template_52mb6lr',
    templateIdAdmin: 'template_li9fghg',
    publicKey: 'WIeiRn9GhuL72YaNi'
  },
   appInfo: {
    name: 'GSE Application',
    description:
      `La aplicación está diseñada para gestionar de manera rápida,
      segura y organizada las solicitudes de documentos institucionales
      y el envío de excusas por parte de los usuarios (estudiantes,
      docentes, empleados o ciudadanos, según el contexto).`,
    version: '1.0.1',
    author: 'JRdevsoft',
    website: 'https://jrdevsoft.dev',   // opcional
    email: 'jr.devsoft@gamil.com',    // opcional
    logoUrl: 'assets/logo.png'         // pon tu logo aquí
  },
  adminPhone: '18099028301'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
//import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
