import { InventoryService } from '../../../../services/inventory.service';
import { Component, inject, OnInit } from '@angular/core';
import { Article, ArticleCategory, ArticleCondition, ArticleType, MeasurementUnit } from '../../../../models/article.model';
import { CommonModule } from '@angular/common';
import { ToastService } from 'ngx-dabd-grupo01';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory-article-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory_articles_table.component.html',
  styleUrl: './inventory_articles_table.component.css'
})
export class InventoryArticleTableComponent {

  private inventoryService = inject(InventoryService);

  articles: Article[] = [];
  isEditing: boolean = false; // Variable para controlar el estado de edición
  currentArticleId?: number; // Almacena el ID del ítem actual en edición

  // Propiedades para los enumerados
  ArticleType = ArticleType; // Asignamos el enum ArticleType a una propiedad del componente
  ArticleStatus = ArticleCondition; // Asignamos el enum ArticleStatus a una propiedad del componente
  ArticleCategory = ArticleCategory; // Asignamos el enum ArticleCategory a una propiedad del componente
  MeasurementUnit = MeasurementUnit; // Asignamos el enum MeasurementUnit a una propiedad del componente

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.getArticles();
  }

  getArticles(): void {
    this.inventoryService.getArticles().subscribe(articles => {
      this.articles = articles;
    });
  }


  editArticle(article: Article): void {
    this.isEditing = true; // Cambia el estado a edición
    this.currentArticleId = article.id; // Guarda el ID del ítem actual
    //this.articleForm.patchValue(article); // Llena el formulario con los datos del ítem a editar
  }

  updateArticle(article: Article): void {
    if (this.currentArticleId) {
      // Actualiza el ítem con el ID actual
      this.inventoryService.updateArticle(this.currentArticleId, article).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("El artículo ha sido modificado con éxito.");
          this.getArticles(); // Recarga la lista de ítems
        },
        error: (error) => {
          this.toastService.sendError("Hubo un error en la modificación del artículo.");
          this.getArticles(); // Recarga la lista de ítems
        }
      });
    }
  }

  // deleteArticle(article_id: number): void {
  //   this.inventoryService.deleteArticle(article_id).subscribe(() => {
  //     this.getArticles();
  //   });
  // }

  deleteArticle(id: number): void {
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
        this.inventoryService.deleteArticle(id).subscribe(() => {
          this.getArticles();
          this.toastService.sendSuccess('El inventario ha sido eliminado con éxito.');
        });
      }
    });
  }

}
