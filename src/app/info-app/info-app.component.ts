import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { IonContent, IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonIcon, IonNote, IonTitle, IonHeader, IonToolbar, IonButtons, IonBackButton } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-info-app',
    templateUrl: './info-app.component.html',
    styleUrls: ['./info-app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IonBackButton, IonButtons, IonToolbar, IonHeader, IonTitle, IonNote, IonIcon, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader,
        IonCard, IonBadge, IonContent, CommonModule]
})
export class InfoAppComponent {

  info = environment.appInfo;
  time = new Date();
  currentDate =this.time.getFullYear();

  openLink(url?: string) {
    if (!url) return;
    window.open(url, '_blank');
  }

  mailTo(email?: string) {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  }

}
