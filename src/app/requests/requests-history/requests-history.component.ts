import { Component, OnInit } from '@angular/core';
import { HistoryService } from 'src/app/services/requests/history.service';
import { Models } from 'src/app/models/models';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSegment,
  IonSegmentButton, IonItem, IonInput, IonLabel, IonSearchbar, IonRefresher, IonRefresherContent,
  IonList, IonAvatar, IonSpinner, ToastController, IonBackButton } from "@ionic/angular/standalone";

// Exportadores
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-requests-history',
  templateUrl: './requests-history.component.html',
  styleUrls: ['./requests-history.component.scss'],
  standalone: true,
  imports: [IonBackButton, IonSpinner, IonAvatar, IonList, IonRefresherContent, IonRefresher, IonSearchbar,
    IonLabel, IonInput, IonItem, IonSegmentButton, IonSegment, IonContent, IonIcon, IonButton,
    IonButtons, IonTitle, IonToolbar, IonHeader, CommonModule, FormsModule ]
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
    private toastCtrl: ToastController
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
  private wrapBreaks(s: string): string {
  // inserta saltos suaves para que URLs/llaves largas puedan partir
    return (s ?? '').replace(/([/:?&=._-])/g, '$1\u200B');
  }
exportPDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

  const pageWidth = (doc as any).internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Cabecera
  const imgW = 220, imgH = 120, topY = 40;
  doc.addImage('assets/logo.png', 'PNG', centerX - imgW/2, topY, imgW, imgH);
  doc.setFontSize(20);
  const titleY = topY + imgH + 22;
  doc.text('Historial de Solicitudes', centerX, titleY + 6, { align: 'center' });

  // Márgenes / anchos
  const left = 40, right = 40, bottom = 40;
  const usable = pageWidth - left - right;
  const startY = titleY + 22;

  // Porcentajes de columnas (suman 1.0)
  const w = {
    fecha: usable * 0.16,
    nombre: usable * 0.22,
    tel: usable * 0.14,
    tipo: usable * 0.18,
    detalle: usable * 0.30, // ancho real de "Detalle"
  };

  // Cuerpo con "Detalle" pre-partido al ancho real de su columna
  const body = this.filtered.map(r => {
    const detallePlano = this.wrapBreaks(this.compactFormData(r.formData));
    // restamos un pequeño padding interior (~12pt)
    const detalleEnvuelto = doc.splitTextToSize(detallePlano, w.detalle - 12);
    const detalleMultiline = Array.isArray(detalleEnvuelto) ? detalleEnvuelto.join('\n') : String(detalleEnvuelto);
    return [
      new Date(r.created_at).toLocaleString(),
      r.usersapp?.name ?? '',
      r.usersapp?.phone ?? '',
      r.typeName ?? '',
      detalleMultiline, // <-- array de líneas, ya no se sale
    ];
  });

  autoTable(doc, {
    startY,
    margin: { left, right, bottom },
    tableWidth: usable,
    styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
    bodyStyles: { valign: 'top' },
    headStyles: { fillColor: [46,125,50], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: w.fecha },
      1: { cellWidth: w.nombre },
      2: { cellWidth: w.tel },
      3: { cellWidth: w.tipo },
      4: { cellWidth: w.detalle },
    },
    head: [['Fecha', 'Nombre', 'Teléfono', 'Tipo', 'Detalle (formData)']],
    body,
    pageBreak: 'auto',
    rowPageBreak: 'auto',   // permite partir filas largas entre páginas
  });

  doc.save(`historial_solicitudes_${new Date().toISOString().slice(0,10)}.pdf`);
}
  private async toast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toastCtrl.create({ message, duration: 2500, color });
    t.present();
  }

}
