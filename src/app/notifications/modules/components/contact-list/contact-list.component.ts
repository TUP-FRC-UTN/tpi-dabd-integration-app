import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbPagination, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { ToastService } from 'ngx-dabd-grupo01';
import { map } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ContactModel } from '../../../models/contacts/contactModel';
import { ContactService } from '../../../services/contact.service';
import { SubscriptionService } from '../../../services/subscription.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbPagination,
    NgbDropdownModule,
    MainContainerComponent,
  ],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css'],
})
export class ContactListComponent implements OnInit {
  private router = inject(Router);
  private contactService = inject(ContactService);
  toastService: ToastService = inject(ToastService);
  suscriptionService: SubscriptionService = inject(SubscriptionService);

  availableSubscriptions: string[] = [];

  getSuscriptions() {
    this.suscriptionService
      .getAllSubscriptions()
      .pipe(map((x) => x.map((y) => this.availableSubscriptions.push(y.name))));
  }

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sizeOptions: number[] = [10, 25, 50];

  // Filtros
  searchTerm = '';
  isActiveContactFilter: boolean | undefined = true;
  selectedContactType: string = '';

  // Datos y estados
  contacts: ContactModel[] = [];
  filteredContacts: ContactModel[] = [];

  // Estados de modales
  isModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  modalTitle = '';
  modalMessage = '';
  isDetailModalOpen = false;
  selectedContact: ContactModel | null = null;

  //Estado de filtors
  showInput: boolean = false;

  // Referencias
  @ViewChild('editForm') editForm!: NgForm;
  contactToDelete: ContactModel | null = null;
  editingContact: ContactModel = this.getEmptyContact();

  constructor() {
    this.initializePagination();
  }

  ngOnInit(): void {
    this.loadContacts();
    this.getAllContacts();
  }

  private getEmptyContact(): ContactModel {
    return {
      id: 0,
      subscriptions: [],
      contactValue: '',
      contactType: '',
      active: true,
      showSubscriptions: false,
    };
  }

  getFilteredContacts(): void {
    this.contactService
      .getFilteredContactsFromBackend(
        this.isActiveContactFilter,
        this.searchTerm,
        this.selectedContactType
      )
      .subscribe((filteredContacts) => {
        this.contacts = filteredContacts;
      });
  }

  filterByStatus(status: 'all' | 'active' | 'inactive') {
    if (status === 'all') {
      this.isActiveContactFilter = undefined;
    } else if (status === 'active') {
      this.isActiveContactFilter = true;
    } else if (status === 'inactive') {
      this.isActiveContactFilter = false;
    }
    this.getFilteredContacts();
  }

  onSearchTextChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.getFilteredContacts();
  }

  filterByContactType(contactType: string): void {
    this.contactService
      .getFilteredContactsFromBackend(
        this.isActiveContactFilter,
        this.searchTerm,
        contactType
      )
      .subscribe((filteredContacts) => {
        this.contacts = filteredContacts;
      });
    this.showInput = true;
  }

  // Carga de datos
  loadContacts() {
    this.contactService
      .getFilteredContactsFromBackend(
        this.isActiveContactFilter,
        this.searchTerm,
        this.selectedContactType
      )
      .subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.filteredContacts = [...this.contacts];
          this.updatePagination();
        },
        error: (error) => {
          this.showModal('Error', 'Error al cargar los contactos');
          console.error('Error loading contacts:', error);
        },
      });
  }

  getAllContacts() {
    this.contactService.getAllContacts().subscribe((data: ContactModel[]) => {
      this.contacts = data.sort((a, b) =>
        a.contactValue.toLowerCase().localeCompare(b.contactValue.toLowerCase())
      );
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedContactType = '';
    this.isActiveContactFilter = true;
    this.showInput = false; // Ocultar input al limpiar
    this.loadContacts();
  }

  // Paginación
  initializePagination() {
    this.updatePagination();
  }

  updatePagination() {
    this.totalItems = this.contacts.length;
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.loadContacts();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadContacts();
  }

  saveContact() {
    this.router.navigate(['/contact/new']);
  }

  editContact(contact: ContactModel) {
    this.contactService.updateContact(contact).subscribe({
      next: (response) => {
        const index = this.contacts.findIndex((c) => c.id === contact.id);
        if (index !== -1) {
          this.contacts[index] = { ...contact };
        }

        this.suscriptionService.updateContactSubscriptions(contact).subscribe({
          next: (response) => {

          },
          error: (error: HttpErrorResponse) => {

            console.error('Error al actualizar las suscripciones del contacto intente nuevamente:', error);
          },
        });

        this.closeEditModal();

        this.toastService.sendSuccess(
          'Éxito El contacto ha sido actualizado correctamente'
        );

      },
      error: (error: HttpErrorResponse) => {
        this.toastService.sendError(
          'Error Ha ocurrido un error al intentar actualizar el contacto intente nuevamente...'
        );
        this.closeEditModal();
        console.error('Error al editar el contacto:', error);
      },
    });
  }

  deleteContact(contact: ContactModel) {
    this.contactService.deleteContact(contact.id).subscribe({
      next: () => {
        this.contacts = this.contacts.filter((c) => c.id !== contact.id);
        this.closeDeleteModal();
        this.toastService.sendSuccess(
          'Éxito El contacto ha sido eliminado correctamente'
        );

        this.initializePagination();
      },
      error: (error: HttpErrorResponse) => {
        this.closeDeleteModal();
        this.toastService.sendError(
          'Error Ha ocurrido un error al intentar eliminar el contacto intente nuevamente...'
        );
        console.error('Error al eliminar el contacto:', error);
      },
    });
  }

  // Modal handlers
  showModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openEditModal(contact: ContactModel) {
    this.editingContact = { ...contact }; // Copia el contacto a editar
    this.isEditModalOpen = true;

    // Cargar las suscripciones disponibles si aún no se han cargado
    if (this.availableSubscriptions.length === 0) {
      this.loadSubscriptions();
    }
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingContact = {
      id: 0,
      subscriptions: [],
      contactValue: '',
      contactType: '',
      active: true,
      showSubscriptions: false,
    };
  }

  isSubscribed(subscription: string): boolean {
    return this.editingContact.subscriptions?.includes(subscription) || false;
  }

  toggleSubscription(subscription: string) {
    if (!this.editingContact.subscriptions) {
      this.editingContact.subscriptions = [];
    }

    const index = this.editingContact.subscriptions.indexOf(subscription);
    if (index !== -1) {
      this.editingContact.subscriptions.splice(index, 1);
    } else {
      this.editingContact.subscriptions.push(subscription);
    }
  }


  loadSubscriptions() {
    this.suscriptionService.getAllSubscriptions()
      .pipe(
        map(subscriptions => subscriptions.map(sub => sub.name))
      )
      .subscribe({
        next: (subscriptionNames) => {
          this.availableSubscriptions = subscriptionNames;
        },
        error: (error) => {
          console.error('Error al cargar suscripciones:', error);
          this.toastService.sendError('Error al cargar las suscripciones');
        }
      });
  }

  openDetailModal(contact: ContactModel) {
    if (contact) {
      this.selectedContact = { ...contact };
      this.isDetailModalOpen = true;
    }
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedContact = null;
  }

  openDeleteModal(contact: ContactModel) {
    this.contactToDelete = contact;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.contactToDelete = null;
  }

  confirmDelete() {
    if (this.contactToDelete) {
      this.deleteContact(this.contactToDelete);
    }
  }

  saveEditedContact() {
    if (this.editForm.form.valid) {
      this.editContact(this.editingContact);
    }
  }

  exportToExcel() {
    // Implementar la lógica de exportación a Excel
    this.contactService.getAllContacts().subscribe({
      next: (contacts) => {
        const data = contacts.map((contact) => ({
          ID: contact.id,
          Tipo: contact.contactType,
          Valor: contact.contactValue,
          Activo: contact.active ? 'Activo' : 'Inactivo',
        }));

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
        const now = new Date();
        const dateTime = `${now
          .toLocaleDateString()
          .replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
        const fileName = `Contactos-${dateTime}.xlsx`; // Nombre del archivo
        XLSX.writeFile(wb, fileName);
      },
      error: (error) => {
        this.showModal('Error', 'Error al cargar los contactos para exportar');
      },
    });
  }

  exportToPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Contactos', 14, 20);

    this.contactService.getAllContacts().subscribe({
      next: (contacts) => {
        autoTable(doc, {
          startY: 30,
          head: [['ID', 'Tipo', 'Valor', 'Activo']],
          body: contacts.map((contact) => [
            contact.id,
            contact.contactType,
            contact.contactValue,
            contact.active ? 'Activo' : 'Inactivo',
          ]),
          columnStyles: {
            // para que no se rompa por si el body es muy grande
            0: { cellWidth: 15 }, // ID
            1: { cellWidth: 40 }, // Tipo
            2: { cellWidth: 100 }, // Valor
            3: { cellWidth: 20 }, // Activo
          },
          styles: { overflow: 'linebreak' },
        });
        const now = new Date();
        const dateTime = `${now
          .toLocaleDateString()
          .replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}`;
        const fileName = `Contactos-${dateTime}.pdf`;

        doc.save(fileName);
        console.log('PDF generado');
      },
      error: (error) => {
        this.showModal(
          'Error',
          'Error al cargar los contactos para generar el PDF'
        );
      },
    });
  }

  showInfo() {
    const message = `
      <strong>Sistema de gestión de contactos</strong><br>
      Aquí puedes administrar todos los contactos del sistema.<br><br>

      <strong>Iconografía:</strong><br>
      Activos: <i class="bi bi-check2-circle text-success large-icon"></i><br>
      Inactivos: <i class="bi bi-x-circle text-danger large-icon"></i>
    `;

    this.showModal('Información', message);
  }
  //Pagination
  get paginatedContacts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.contacts.slice(startIndex, endIndex);
  }
}
