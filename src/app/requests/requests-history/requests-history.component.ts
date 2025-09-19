import { Component, OnInit } from '@angular/core';
import { HistoryService } from 'src/app/services/requests/history.service';
import { Models } from 'src/app/models/models';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSegment, IonSegmentButton, IonItem, IonInput, IonLabel, IonSearchbar, IonRefresher, IonRefresherContent, IonList, IonAvatar, IonSpinner } from "@ionic/angular/standalone";

// Exportadores
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
@Component({
  selector: 'app-requests-history',
  templateUrl: './requests-history.component.html',
  styleUrls: ['./requests-history.component.scss'],
  standalone: true,
  imports: [IonSpinner, IonAvatar, IonList, IonRefresherContent, IonRefresher, IonSearchbar, IonLabel, IonInput, IonItem, IonSegmentButton, IonSegment, IonContent, IonIcon, IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, ]
})
export class RequestsHistoryComponent  implements OnInit {

  loading = false;
  items: Models.History.RequestHistoryItem[] = [];
  filtered: Models.History.RequestHistoryItem[] = [];

  filters: Models.History.HistoryFilters = {
    mode: 'all',
    search: '',
    dateFrom: null,
    dateTo: null,
  };

  constructor(
    private historySrv: HistoryService,
    // private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.fetch();
  }

  async fetch() {
    try {
      this.loading = true;
      const data = await this.historySrv.getHistory(this.filters);
      this.items = data;
      this.applyClientFilter();
    } catch (e: any) {
      this.toast('Error cargando historial: ' + (e?.message ?? e), 'danger');
    } finally {
      this.loading = false;
    }
  }

  // En listas grandes es útil un filtro adicional en cliente (texto libre)
  applyClientFilter(text: string = '') {
    const t = text.trim().toLowerCase();
    if (!t) {
      this.filtered = this.items.slice();
      return;
    }
    this.filtered = this.items.filter((r) => {
      const name = (r.usersapp?.name ?? '').toLowerCase();
      const phone = (r.usersapp?.phone ?? '').toLowerCase();
      const type = (r.typeName ?? '').toLowerCase();
      const form = this.compactFormData(r.formData).toLowerCase();
      return name.includes(t) || phone.includes(t) || type.includes(t) || form.includes(t);
    });
  }

  onModeChange() {
    // Limpia campos al cambiar de modo y vuelve a consultar
    this.filters.search = '';
    this.filters.dateFrom = null;
    this.filters.dateTo = null;
    this.fetch();
  }

  onSearchChange() {
    this.fetch();
  }

  onDateChange() {
    if (this.filters.dateFrom && this.filters.dateTo) {
      this.fetch();
    }
  }

  compactFormData(fd: any): string {
    if (!fd || typeof fd !== 'object') return '';
    try {
      const pairs = Object.entries(fd).map(([k, v]) => `${k}: ${this.valueToText(v)}`);
      return pairs.join(' | ');
    } catch {
      return JSON.stringify(fd);
    }
  }

  private valueToText(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  // --------- EXPORTS ----------
  exportExcel() {
    const rows = this.filtered.map((r) => ({
      'Fecha': new Date(r.created_at).toLocaleString(),
      'Nombre': r.usersapp?.name ?? '',
      'Teléfono': r.usersapp?.phone ?? '',
      'Email': r.usersapp?.email ?? '',
      'Tipo de solicitud': r.typeName ?? '',
      'Detalle (formData)': this.compactFormData(r.formData),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `historial_solicitudes_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  exportPDF() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

    // Título
    doc.setFontSize(16);
    doc.text('Historial de Solicitudes', 40, 40);

    // Tabla
    // Encabezado verde (46,125,50)
    (doc as any).autoTable({
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
      headStyles: { fillColor: [46, 125, 50], textColor: 255, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 150 },
        2: { cellWidth: 120 },
        3: { cellWidth: 160 },
        4: { cellWidth: 420 } // detalle
      },
      head: [['Fecha', 'Nombre', 'Teléfono', 'Tipo', 'Detalle (formData)']],
      body: this.filtered.map((r) => [
        new Date(r.created_at).toLocaleString(),
        r.usersapp?.name ?? '',
        r.usersapp?.phone ?? '',
        r.typeName ?? '',
        this.compactFormData(r.formData),
      ]),
      didDrawPage: (data: any) => {
        // Footer
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(9);
        doc.text(
          `Generado: ${new Date().toLocaleString()}`,
          40,
          pageHeight - 20
        );
      },
    });

    doc.save(`historial_solicitudes_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  private async toast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 2500, color });
    t.present();
  }

}
