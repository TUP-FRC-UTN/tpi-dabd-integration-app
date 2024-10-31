import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleFormComponent } from '../inventory_articles/inventory_articles_form/inventory_articles_form.component';
import { Router, RouterModule } from '@angular/router';
import { TransactionComponentForm } from '../inventory_transaction/inventory_transaction_form/inventory_transaction_form.component';
import { InventoryTransactionTableComponent } from '../inventory_transaction/inventory_transaction_table/inventory_transaction_table.component';
import { InventoryInventoriesUpdateComponent } from './inventory-inventories-update/inventory-inventories-update.component';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { Inventory, StatusType, Transaction, TransactionType } from '../../../models/inventory.model';
import { Article, ArticleCategory, ArticleCondition, ArticleType, MeasurementUnit, Status } from '../../../models/article.model';
import { InventoryService } from '../../../services/inventory.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

//exportar a pdf y excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { ToastService } from 'ngx-dabd-grupo01';


@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule,
     ReactiveFormsModule,
      ArticleFormComponent,
       RouterModule,
        TransactionComponentForm,
         InventoryTransactionTableComponent,
          InventoryInventoriesUpdateComponent,
          FormsModule
        ],
  templateUrl: './inventory_inventories.component.html',
  styleUrls: ['./inventory_inventories.component.css']
  
})
export class InventoryTableComponent implements OnInit {
 
  private router = inject(Router);
  private mapperService = inject(MapperService);
  Status = Status;
  searchInput = new FormControl('');


  // Modals
  showRegisterForm: boolean = false;
  showRegisterTransactionForm: boolean = false;
  showTransactions: boolean = false;
  showInventoryUpdate: boolean = false;

  inventoryForm: FormGroup;
  inventories: Inventory[] = [];
  articles: Article[] = [];
  activeArticles: Article[] = []; // Solo los ítems activos
  articleMap: { [key: number]: string } = {}; // Mapa para almacenar nombre de ítems con sus IDs
  isEditing: boolean = false;
  editingInventoryId: any | null = null; // Para guardar el ID del inventario en edición

  selectedInventoryId: string | null = null;


  //   //sorts
  sortedList: Inventory[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private fb: FormBuilder, private inventoryService: InventoryService, private toastService: ToastService) {
    this.inventoryForm = this.fb.group({
      article_id: ['', Validators.required],
      stock: [1, Validators.required], // Stock inicial es 1
      min_stock: [1],
      inventory_status: [StatusType.ACTIVE]
    });
    this.filterForm = this.fb.group({
      measure: [this.measurementUnits[2]],
    });
  }

  ngOnInit(): void {
    this.getInventories();
  }
/*
  getInventories(): void {
    this.searchInput.valueChanges.subscribe(data => {
      if (data === null || data === '') {
        this.getInventories();
        console.log(this.inventories);
      }
      this.inventories == this.inventories.filter(
        x => x.article.name.toLowerCase().includes(data!.toLowerCase())
        
      )
      console.log(this.inventories, "Primero");
    })
    console.log(this.inventories);
    this.inventoryService.getInventories().subscribe((inventories: any[]) => {
      this.inventories = inventories.map(inventory => ({
        ...this.mapperService.toCamelCase(inventory), // Convertir todo el inventario a camelCase
        article: this.mapperService.toCamelCase(inventory.article) // Convertir el artículo a camelCase
        //transactions: inventory.transactions.map(transaction => this.mapperService.toCamelCase(transaction)) // Convertir las transacciones a camelCase
      }));

      console.log(this.inventories); // Para verificar que la conversión se realizó correctamente
    });
  }
*/
getInventories(): void {
  this.isLoading = true;
  this.searchInput.valueChanges.subscribe( data => {
    if(data === null || data === ''){
      this.getInventories();
    }
    this.inventories = this.inventories.filter(
      x => x.article.name.toLowerCase().includes(data!.toLowerCase())
    )
  })
 
  // this.inventoryService.getInventories().subscribe((inventories: Inventory[]) => {
  //   this.inventories = inventories.map(inventory => ({
  //     ...this.mapperService.toCamelCase(inventory), // Convertir todo el inventario a camelCase
  //     article: this.mapperService.toCamelCase(inventory.article) // Convertir el artículo a camelCase
  //     //transactions: inventory.transactions.map(transaction => this.mapperService.toCamelCase(transaction)) // Convertir las transacciones a camelCase
  //   }));
  this.inventoryService.getInventories().subscribe((inventories: Inventory[]) => {
    this.inventories = inventories.map( inventory => ({
      ...this.mapperService.toCamelCase(inventory),
    }));
    this.inventories.forEach(inventory => {
      inventories.map(inventory.article = this.mapperService.toCamelCase(inventory.article));
    });
    this.inventories = inventories;
    this.filteredInventories = inventories;
    this.isLoading = false;
    console.log('CHANCHA', this.inventories);
    this.inventoryService.getInventories().subscribe((inventories: any[]) => {
      this.inventories = inventories.map(inventory => ({
        ...this.mapperService.toCamelCase(inventory), // Convertir todo el inventario a camelCase
        article: this.mapperService.toCamelCase(inventory.article) // Convertir el artículo a camelCase
        //transactions: inventory.transactions.map(transaction => this.mapperService.toCamelCase(transaction)) // Convertir las transacciones a camelCase
      }));
  });     

    console.log(this.inventories); // Para verificar que la conversión se realizó correctamente
  })};
 // Método para convertir la unidad de medida a una representación amigable
getDisplayUnit(unit: MeasurementUnit): string {
  switch (unit) {
      case MeasurementUnit.LITERS:
          return 'Lts.';
      case MeasurementUnit.KILOS:
          return 'Kg.';
      case MeasurementUnit.UNITS:
          return 'Ud.';
      default:
          return unit; // Retorna el valor original si no coincide
  }
}



  buildArticleMap(): void {
    this.articles.forEach(article => {
      // Verificar que el ID y el nombre no sean undefined o nulos
      if (article && article.id !== undefined && article.id !== null && article.name) {
        this.articleMap[article.id] = article.name;
      } else {
        console.warn('Article inválido encontrado:', article);
      }
    });
  }

  // Método para obtener los ítems y filtrar solo los activos

  getArticles(): void {
    this.inventoryService.getArticles().subscribe((articles: Article[]) => {
      this.articles = articles;
      this.activeArticles = this.articles;//.filter(article => article.article_status === Status.ACTIVE); // Usar ArticleStatus.FUNCTIONAL
      this.buildArticleMap();
    });
  }

  addInventory(): void {
    if (this.inventoryForm.valid) {
      const newInventory = this.inventoryForm.value;
      this.inventoryService.addInventory(newInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });
    }
  }

 /* editInventory(inventory: Inventory): void {
    this.isEditing = true; // Activar el modo edición
    this.editingInventoryId = inventory.id; // Guardar el ID del inventario en edición
    this.inventoryForm.patchValue({
      article_id: inventory.article_id,
      stock: inventory.stock,
      min_stock: inventory.min_stock,
      inventory_status: inventory.inventory_status
    });
  }*/


 /* updateInventory(): void {
    if (this.inventoryForm.valid) {
      const updatedInventory = this.inventoryForm.value;
      this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });
    }
  }*/

  // deleteInventory(id: number): void {
  //   this.inventoryService.deleteInventory(id).subscribe(() => {
  //     this.getInventories();
  //   });
  // }

  
  deleteInventory(id: number): void {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.inventoryService.deleteInventory(id).subscribe(() => {
          this.getInventories();
          this.toastService.sendSuccess('El inventario ha sido eliminado con éxito.');
        });
      }
    });
  }

  resetForm(): void {
    this.isEditing = false; // Desactivar el modo edición
    this.editingInventoryId = null; // Limpiar el ID del inventario en edición
    this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: 'Active' });
  }

  /*saveInventory(): void {
    if (this.inventoryForm.valid) {
      const inventoryData = this.inventoryForm.value;

      if (this.isEditing && this.editingInventoryId) {
        // Editar inventario existente
        const updatedInventory: Inventory = {
          ...inventoryData,
          id: this.editingInventoryId
        };
        this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
          this.getInventories(); // Recargar la lista después de actualizar
          this.resetForm(); // Resetear el formulario después de editar
        });
      } else {
        // Agregar nuevo inventario
        this.inventoryService.addInventory(inventoryData).subscribe(() => {
          this.getInventories(); // Recargar la lista después de agregar
          this.resetForm(); // Resetear el formulario después de agregar
        });
      }
    }
  }*/

  // saveInventory(): void {
  //   if (this.inventoryForm.valid) {
  //     const inventoryData = this.inventoryForm.value;

  //     if (this.isEditing && this.editingInventoryId) {
  //       // Editar inventario existente
  //       const updatedInventory: Inventory = {
  //         ...inventoryData,
  //         id: this.editingInventoryId
  //       };
  //       this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
  //         this.getInventories(); // Recargar la lista después de actualizar
  //         this.resetForm(); // Resetear el formulario después de editar
  //       });
  //     } else {
  //       // Agregar nuevo inventario
  //       this.inventoryService.addInventory(inventoryData).subscribe(() => {
  //         this.getInventories(); // Recargar la lista después de agregar
  //         this.resetForm(); // Resetear el formulario después de agregar
  //       });
  //     }
  //   }
  // }
  saveInventory(): void {
    if (this.inventoryForm.valid) {
      const inventoryData = this.inventoryForm.value;

      if (this.isEditing && this.editingInventoryId) {
        // Editar inventario existente
        const updatedInventory: Inventory = {
          ...inventoryData,
          id: this.editingInventoryId
        };
        //this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
         // this.getInventories(); // Recargar la lista después de actualizar
         // this.resetForm(); // Resetear el formulario después de editar
        //});
      } else {
        // Agregar nuevo inventario
        this.inventoryService.addInventory(inventoryData).subscribe(() => {
          this.getInventories(); // Recargar la lista después de agregar
          this.resetForm(); // Resetear el formulario después de agregar
        });
      }
    }
  }
  onNewTransaction(id:any){
    this.selectedInventoryId = id;
    this.showRegisterTransactionForm = !this.showRegisterTransactionForm;
  }
  onTransactions(inventory:Inventory){
    this.selectedInventory = inventory;
    this.showTransactions = !this.showTransactions;
  }
  onInventoryUpdate(inventory: Inventory){
    this.selectedInventory = inventory;
    this.showInventoryUpdate = !this.showInventoryUpdate;
  }
  
  onRegisterTransactionClose(){
    this.showRegisterTransactionForm = this.showRegisterTransactionForm;
    this.selectedInventoryId = "";
  }
  onTransactionsClose(){
    this.showTransactions = this.showTransactions;
    this.selectedInventory = null;
  }
  onInventoryUpdateClose() {
    this.showInventoryUpdate = false;
    this.selectedInventory = null;
    this.getInventories();
  }

  onNewArticle(){
    this.showRegisterForm = !this.showRegisterForm;
  }
  onRegisterClose(){
    this.showRegisterForm = this.showRegisterForm;
  }

// onNewTransaction(id:any){
//   this.selectedInventoryId = id;
//   this.showRegisterTransactionForm = !this.showRegisterTransactionForm;
// }
// onRegisterTransactionClose(){
//   this.showRegisterTransactionForm = this.showRegisterTransactionForm;
//   this.selectedInventoryId = "";
// }

//onTransactions(id:any){
  // this.selectedInventoryId = id;
  // this.showTransactions = !this.showTransactions;
  // console.log(this.selectedInventoryId);
  // console.log("Esta usando onTransactions");
 
//}
// onTransactions(inventory:Inventory){
//   this.selectedInventory = inventory;
//   this.showTransactions = !this.showTransactions;
// }
// onTransactionsClose(){
//   this.showTransactions = this.showTransactions;
//   this.selectedInventoryId = "";
// } 
 
//   private mapperService = inject(MapperService);
//   Status = StatusType;
//   // Modals

  

  currentPage: number = 0;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

//  //Filtros
 showFilterModal: boolean = false;
  filteredInventories: Inventory[] = [];
  isLoading = false;
  originalInventories: Inventory[] = []; // Lista completa de inventarios (sin filtrar)
  currentFilter: string = 'all';          // Filtro actual

  // Filtros individuales para búsqueda en tiempo real
  articleNameFilter = new FormControl('');
  stockFilter = new FormControl('');
  minStockFilter = new FormControl('');
  locationFilter = new FormControl('');
  measurementUnits: MeasurementUnit[] = [MeasurementUnit.LITERS, MeasurementUnit.KILOS, MeasurementUnit.UNITS];


//   // Formulario para filtros que requieren llamada al servidor
  filterForm: FormGroup;
  readonly MeasurementUnit = MeasurementUnit;

   
//   inventories: Inventory[] = [
//     {
//       id: 10,
//       article: {
//         id: 1,
//         identifier: "A02131",
//         name: 'puerta',
//         description: 'puerta grandota',
//         articleCondition: ArticleCondition.DEFECTIVE, // Valor ficticio; reemplázalo con el valor válido
//         articleCategory: ArticleCategory.CONSUMABLES, // Valor ficticio; reemplázalo con el valor válido
//         articleType: ArticleType.NON_REGISTRABLE,      // Valor ficticio; reemplázalo con el valor válido
//         measurementUnit: MeasurementUnit.KILOS   // Valor ficticio; reemplázalo con el valor válido
//       },
//       stock: 11,
//       minStock: 1,
//       location: 'Tumadre',
//       status: StatusType.ACTIVE,
//       transactions: [
//         {
//           id: 1,
//           inventoryId: 1,
//           transactionType: TransactionType.ENTRY, // Valor ficticio; reemplázalo con el valor válido
//           quantity: 1,
//           price: 1,
//           transactionDate: '2024-01-02'
//         }
//       ]
//     },
//     {
//       id: 10,
//       article: {
//         id: 1,
//         identifier: "A41231",
//         name: 'Auto',
//         description: 'puerta grandota',
//         articleCondition: ArticleCondition.FUNCTIONAL, // Valor ficticio; reemplázalo con el valor válido
//         articleCategory: ArticleCategory.DURABLES, // Valor ficticio; reemplázalo con el valor válido
//         articleType: ArticleType.REGISTRABLE,      // Valor ficticio; reemplázalo con el valor válido
//         measurementUnit: MeasurementUnit.UNITS  // Valor ficticio; reemplázalo con el valor válido
//       },
//       stock: 15,
//       minStock: 12,
//       location: 'Tumadre',
//       status: StatusType.INACTIVE,
//       transactions: [
//         {
//           id: 1,
//           inventoryId: 1,
//           transactionType: TransactionType.OUTPUT, // Valor ficticio; reemplázalo con el valor válido
//           quantity: 1,
//           price: 1,
//           transactionDate: '2024-01-02'
//         }
//       ]
//     }
//   ];

//   articles: Article[] = [
//     {
//       id: 100,
//       identifier: '1234',
//       name: 'Producto 1',
//       description: 'Descripción del producto 1',
//       articleCondition: ArticleCondition.FUNCTIONAL,
//       articleCategory: ArticleCategory.DURABLES,
//       articleType: ArticleType.REGISTRABLE,
//       measurementUnit: MeasurementUnit.UNITS
//     }
//   ];
//   activeArticles: Article[] = []; // Solo los ítems activos
//   articleMap: { [key: number]: string } = {}; // Mapa para almacenar nombre de ítems con sus IDs
//   isEditing: boolean = false;
//   editingInventoryId: any | null = null; // Para guardar el ID del inventario en edición


  selectedInventory: Inventory | null = null;
  showModalFilter: boolean = false;



//   ngOnInit(): void {
//     this.loadInventories();
//     this.setupFilterSubscriptions();

//   }

//   openModalFilter(): void {
//     this.showModalFilter = true;
//   }
  
//   closeModalFilter(): void {
//     this.showModalFilter = false;
//   }

//   private setupFilterSubscriptions(): void {
//     Object.keys(this.filterForm.controls).forEach(key => {
//       this.filterForm.get(key)?.valueChanges.pipe(
//         debounceTime(300),
//         distinctUntilChanged()
//       ).subscribe(() => {
//         console.log('Aplicando filtros...', this.filterForm.value);
//         this.applyAllFilters();
//       });
//     });
//   }

//    applyAllFilters(): void {
//     const filters = {
//       measure: this.filterForm.get('measure')?.value
//     }

//     Object.keys(filters).forEach(key => {
//       if (!filters[key as keyof typeof filters]) {
//         delete filters[key as keyof typeof filters];
//       }
//     });

//     this.inventoryService.getInventoriesUnit(filters.measure).subscribe((inventories: Inventory[]) => {
//       this.inventories = inventories.map( inventory => ({
//         ...this.mapperService.toCamelCase(inventory),
//       }));
//       this.inventories.forEach(inventory => {
//         inventories.map(inventory.article = this.mapperService.toCamelCase(inventory.article));
//       });
//       this.inventories = inventories;
//       this.filteredInventories = inventories;
//       this.isLoading = false;
//       console.log('CHANCHA FILTRADA', this.inventories);
//     });
//   }
//   applyFilter(): void {
//     const articleName = this.filterForm.get('articleName')?.value;
//     const minStock = this.filterForm.get('minStock')?.value;
//     const status = this.filterForm.get('status')?.value;

//     this.inventories = this.originalInventories.filter(inventory => {
//       const matchArticleName = articleName ? inventory.article.name.toLowerCase().includes(articleName.toLowerCase()) : true;
//       const matchMinStock = minStock ? inventory.stock >= minStock : true;
//       const matchStatus = status ? inventory.status === status : true;

//       return matchArticleName && matchMinStock && matchStatus;
//     });

//     // Cerrar el modal después de aplicar los filtros
//     this.closeModalFilter();
//   }

//   clearFilters(): void {
//     this.articleNameFilter.reset();
//     this.stockFilter.reset();
//     this.getInventories(); // Recargar todos los inventarios
//   }

//   getInventories(): void {
//     this.isLoading = true;
//     this.articleNameFilter.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getInventories();
//       }
//       this.inventories = this.inventories.filter(
//         x => x.article.name.toLowerCase().includes(data!.toLowerCase())
//       )
//     })
//     this.stockFilter.valueChanges.subscribe( data => {
//       if(data === null || data === ''){
//         this.getInventories();
//       }
//       this.inventories = this.inventories.filter(
//         x => x.stock.toString().toLowerCase().includes(data!.toLowerCase())
//       )
//     })
//     // this.inventoryService.getInventories().subscribe((inventories: Inventory[]) => {
//     //   this.inventories = inventories.map(inventory => ({
//     //     ...this.mapperService.toCamelCase(inventory), // Convertir todo el inventario a camelCase
//     //     article: this.mapperService.toCamelCase(inventory.article) // Convertir el artículo a camelCase
//     //     //transactions: inventory.transactions.map(transaction => this.mapperService.toCamelCase(transaction)) // Convertir las transacciones a camelCase
//     //   }));
//     this.inventoryService.getInventories().subscribe((inventories: Inventory[]) => {
//       this.inventories = inventories.map( inventory => ({
//         ...this.mapperService.toCamelCase(inventory),
//       }));
//       this.inventories.forEach(inventory => {
//         inventories.map(inventory.article = this.mapperService.toCamelCase(inventory.article));
//       });
//       this.inventories = inventories;
//       this.filteredInventories = inventories;
//       this.isLoading = false;
//       console.log('CHANCHA', this.inventories);
//     });      

//       console.log(this.inventories); // Para verificar que la conversión se realizó correctamente
//     };

//  // Método para convertir la unidad de medida a una representación amigable
// getDisplayUnit(unit: MeasurementUnit): string {
//   switch (unit) {
//       case MeasurementUnit.LITERS:
//           return 'Lts.';
//       case MeasurementUnit.KILOS:
//           return 'Kg.';
//       case MeasurementUnit.UNITS:
//           return 'Ud.';
//       default:
//           return unit; // Retorna el valor original si no coincide
//   }
// }



//   buildArticleMap(): void {
//     this.articles.forEach(article => {
//       // Verificar que el ID y el nombre no sean undefined o nulos
//       if (article && article.id !== undefined && article.id !== null && article.name) {
//         this.articleMap[article.id] = article.name;
//       } else {
//         console.warn('Article inválido encontrado:', article);
//       }
//     });
//   }

//   // Método para obtener los ítems y filtrar solo los activos

//   getArticles(): void {
//     this.inventoryService.getArticles().subscribe((articles: Article[]) => {
//       this.articles = articles;
//       this.activeArticles = this.articles;//.filter(article => article.article_status === Status.ACTIVE); // Usar ArticleStatus.FUNCTIONAL
//       this.buildArticleMap();
//     });
//   }

//   addInventory(): void {
//     if (this.inventoryForm.valid) {
//       const newInventory = this.inventoryForm.value;
//       this.inventoryService.addInventory(newInventory).subscribe(() => {
//         this.getInventories();
//         this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
//       });
//     }
//   }

//   editInventory(inventory: Inventory): void {
//     console.log(inventory.id);
//     this.router.navigate(['articles/article', inventory.id]);
//     /*this.isEditing = true; // Activar el modo edición
//     this.editingInventoryId = inventory.id; // Guardar el ID del inventario en edición
//     this.inventoryForm.patchValue({
//       article_id: inventory.article_id,
//       stock: inventory.stock,
//       min_stock: inventory.min_stock,
//       inventory_status: inventory.inventory_status
//     });*/
//   }


//   updateInventory(): void {
//     if (this.inventoryForm.valid) {
//       const updatedInventory = this.inventoryForm.value;
//       /*this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
//         this.getInventories();
//         this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
//       });*/
//     }
//   }

//   deleteInventory(id: number): void {
//     this.inventoryService.deleteInventory(id).subscribe(() => {
//       this.getInventories();
//     });
//   }
//   resetForm(): void {
//     this.isEditing = false; // Desactivar el modo edición
//     this.editingInventoryId = null; // Limpiar el ID del inventario en edición
//     this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: 'Active' });
//   }

//   saveInventory(): void {
//     if (this.inventoryForm.valid) {
//       const inventoryData = this.inventoryForm.value;

//       if (this.isEditing && this.editingInventoryId) {
//         // Editar inventario existente
//         const updatedInventory: Inventory = {
//           ...inventoryData,
//           id: this.editingInventoryId
//         };
//         /*this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
//           this.getInventories(); // Recargar la lista después de actualizar
//           this.resetForm(); // Resetear el formulario después de editar
//         });*/
//       } else {
//         // Agregar nuevo inventario
//         this.inventoryService.addInventory(inventoryData).subscribe(() => {
//           this.getInventories(); // Recargar la lista después de agregar
//           this.resetForm(); // Resetear el formulario después de agregar
//         });
//       }
//     }
//   }

//   onNewArticle(){
//     this.showRegisterForm = !this.showRegisterForm;
//   }
//   onRegisterClose(){
//     this.showRegisterForm = this.showRegisterForm;
// }

// onNewTransaction(id:any){
//   this.selectedInventoryId = id;
//   this.showRegisterTransactionForm = !this.showRegisterTransactionForm;
// }
// onTransactions(inventory:Inventory){
//   this.selectedInventory = inventory;
//   this.showTransactions = !this.showTransactions;
// }
// onInventoryUpdate(inventory: Inventory){  
//   console.log("Estas usando el metodo onInventoryUpdate");
//   this.selectedInventory = inventory;
//   this.showInventoryUpdate = !this.showInventoryUpdate;
//   console.log(this.selectedInventory);
// }


// onRegisterTransactionClose(){
//   this.showRegisterTransactionForm = this.showRegisterTransactionForm;
//   this.selectedInventoryId = "";
// }
// onTransactionsClose(){
//   this.showTransactions = this.showTransactions;
//   this.selectedInventory = null;
// }
// onInventoryUpdateClose() {
//   this.showInventoryUpdate = false;
//   this.selectedInventory = null;
//   this.getInventories();
// }


// private watchPageSizeChanges(): void {
//   this.inventoryForm.get('itemsPerPage')?.valueChanges.subscribe(() => {
//     this.currentPage = 0;
//     this.loadInventories();
//   });
// }

// // loadInventories(): void {
// //   this.inventoryService.getInventoriesPageable(this.currentPage, this.itemsPerPage)
// //     .subscribe({
// //       next: (page) => {
// //         console.log(page)
// //         page = this.mapperService.toCamelCase(page);
// //         console.log(page);
// //         this.inventories = this.mapperService.toCamelCase(page.content) 
// //         this.totalPages = page.totalPages;
// //         this.totalElements = page.totalElements;
// //         this.currentPage = page.number;
// //       },
// //       error: (error) => {
// //         console.error('Error loading inventories:', error);
// //         // Handle error appropriately
// //       }
// //     });
// // }

// loadInventories(): void {
//   // Simulación de datos cargados
//   this.originalInventories = [
//     {
//       id: 1,
//       article: {
//         id: 1,
//         name: 'Puerta',
//         identifier: 'A001',
//         description: 'Puerta grande',
//         articleCondition: ArticleCondition.FUNCTIONAL, // Asigna el valor correspondiente
//         articleCategory: ArticleCategory.DURABLES, // Asigna el valor correspondiente
//         articleType: ArticleType.NON_REGISTRABLE, // Asigna el valor correspondiente
//         measurementUnit: MeasurementUnit.UNITS // Asigna el valor correspondiente
//       },
//       stock: 10,
//       minStock: 2,
//       location: 'Almacén 1',
//       status: StatusType.ACTIVE,
//       transactions: [] // Agrega transacciones si es necesario
//     },
//     // Agrega más registros si es necesario
//   ];
//   // Copia inicial de inventarios
//   this.inventories = [...this.originalInventories];
// }
loadInventories(): void {
  this.inventoryService.getInventoriesPageable(this.currentPage, this.itemsPerPage)
    .subscribe({
      next: (page) => {
        console.log(page)
        page = this.mapperService.toCamelCase(page);
        console.log(page);
        this.inventories = this.mapperService.toCamelCase(page.content) 
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.currentPage = page.number;
      },
      error: (error) => {
        console.error('Error loading inventories:', error);
        // Handle error appropriately
      }
    });
}
filterActiveInventories(): void {
  this.currentFilter = 'active';
  this.inventories = this.originalInventories.filter(inventory => inventory.status === StatusType.ACTIVE);
}

filterInactiveInventories(): void {
  this.currentFilter = 'inactive';
  this.inventories = this.originalInventories.filter(inventory => inventory.status !== StatusType.ACTIVE);
}

showAllInventories(): void {
  this.currentFilter = 'all';
  this.inventories = [...this.originalInventories];
}


goToNextPage(): void {
  if (this.currentPage < this.totalPages - 1) {
    this.currentPage++;
    this.loadInventories();
  }
}

goToPreviousPage(): void {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadInventories();
  }
}

onPageSizeChange(event: any): void {
  this.itemsPerPage = event.target.value;
  this.currentPage = 0; // Reset to first page
  this.loadInventories();
}
exportToPDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const title = 'Listado de Inventario';
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

  const tableColumn = ['Identificador','Artículo', 'Descripcion','Stock','Medida', 'Stock Mínimo', 'Ubicación'];
  const tableRows: any[][] = [];
  
  this.inventories.forEach(inventory => {
    const inventoryData = [
      inventory.article.identifier,
      inventory.article.name,
      inventory.article.description,
      inventory.stock,
      this.getDisplayUnit(inventory.article.measurementUnit),
      inventory.minStock,
      inventory.location
    ];
    tableRows.push(inventoryData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
  });

  doc.save('inventario.pdf');
}

exportToExcel(): void {
  try{
    let element = document.getElementById('inventoryTable');
    if(!element){
      console.warn('No se encontró el elemento con el ID "inventoryTable"');
      element = this.createTableFromData();
    }
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, 'inventario.xlsx');
  } catch( error ){
    console.error('Error al exportar a Excel:', error);
  }
}

private createTableFromData(): HTMLTableElement {
  const table = document.createElement('table');
  const thead = table.createTHead();
  const tbody = table.createTBody();

  const headerRow = thead.insertRow();
  const headers = ['Identificador','Artículo', 'Descripcion','Stock','Medida', 'Stock Mínimo', 'Ubicación'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });

  this.inventories.forEach(inventory => {
    const unid = this.getDisplayUnit(inventory.article.measurementUnit);
    const row = tbody.insertRow();
    [inventory.article.identifier, inventory.article.name, inventory.article.description, inventory.stock, unid, inventory.minStock, inventory.location].forEach(text => {
      const cell = row.insertCell();
      cell.textContent = text !== undefined && text !== null ? text.toString() : null;
    });
  });

  return table;
}

sort(column: string) : void {
  this.sortDirection = this.sortColumn === column ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    this.sortColumn = column;
  
    // Ordena la lista
    this.inventories = [...this.inventories].sort((a, b) => {
      // const valueA = a[column];
      //   const valueB = b[column];
  
      // if (valueA == null || valueB == null) return 0; // Evita ordenamiento si es null o undefined
  
      // if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      // if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
}
}
