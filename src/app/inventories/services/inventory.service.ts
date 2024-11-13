import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Article, ArticleInventoryPost, ArticlePost } from '../models/article.model';
import { Inventory, Transaction, TransactionPost } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
   private apiArticlesUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/articles'; // URL de la API para los ítems DEL BACK
   private apiInventoriesUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/inventories'; // URL de la API para los inventarios
   private apiTransactionsUrl = 'https://f81hvhvc-8080.brs.devtunnels.ms/transactions'; // URL de la API para las transacciones

  //private apiArticlesUrl = 'http://localhost:3000/articles'; // URL de la API para los ítems DEL BACK
  //private apiInventoriesUrl = 'http://localhost:3000/inventories'; // URL de la API para los inventarios
 // private apiTransactionsUrl = 'http://localhost:3000/transactions'; // URL de la API para las transacciones

  constructor(private http: HttpClient) {}


  // CRUD para Ítems
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiArticlesUrl);
  }

  getArticleInventory(id:number):Observable<ArticleInventoryPost>{
    return this.http.get<ArticleInventoryPost>(this.apiInventoriesUrl+'/'+id);
  }

  addArticle(article: ArticlePost): Observable<ArticlePost> {
    console.log(article);
    return this.http.post<ArticlePost>(this.apiArticlesUrl, article);
  }

  updateArticle(articleId: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiArticlesUrl}/${articleId}`, article);
  }

  deleteArticle(article_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiArticlesUrl}/${article_id}`, { article_status: 'Inactive' });
  }

  // CRUD para Inventarios
  getInventories(filters?:{
    measure?: string;
    location?: string;
    articleName?: string;
    stock?: number;
  } 
  ): Observable<Inventory[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== undefined && value !== '') {
          params = params.append(key, value.toString());
        }
      });
    }
    
    return this.http.get<Inventory[]>(this.apiInventoriesUrl, { params });
  }

  getInventoriesUnit(measure: string): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.apiInventoriesUrl}/article/${measure}`);
  }
  
  addInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiInventoriesUrl, inventory);
  }

  addInventoryArticle(articleInventory: ArticleInventoryPost): Observable<ArticleInventoryPost> {
    console.log(articleInventory);
    return this.http.post<ArticleInventoryPost>(this.apiInventoriesUrl+'/newArticle', articleInventory);
  }

  updateInventory(id: number, updatedInventory: Partial<Inventory>): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiInventoriesUrl}/${id}`, updatedInventory);
  }
  //  updateInventory(inventory: Inventory): Observable<Inventory> {
   //   return this.http.put<Inventory>(`${this.apiInventoriesUrl}/${inventory.id}`, inventory);
   // }

  deleteInventory(inventoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiInventoriesUrl}/${inventoryId}`);
  }


  // CRUD para Transacciones
  getTransactionsInventory(inventoryId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiTransactionsUrl}/inventory/${inventoryId}`);
}
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiTransactionsUrl);
  }

  addTransaction(transaction: TransactionPost, inventoryId: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiTransactionsUrl}/${inventoryId}`, transaction);
  }

  updateTransaction(transactionId: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiTransactionsUrl}/${transactionId}`, transaction);
  }

  deleteTransaction(transaction_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiTransactionsUrl}/${transaction_id}`, { transaction_status: 'Inactive' });
  }

  getInventoriesPageable(page: number, size: number): Observable<Page<Inventory>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiInventoriesUrl}/pageable`, { params })
  }
}
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
