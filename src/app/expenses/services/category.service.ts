import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import Category from '../models/category';
import { PORT } from '../const';
import {PaginatedResponse} from "../models/paginatedResponse";

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private url = `${PORT}categories`

  getPaginatedCategories(
    page: number,
    size: number,
    sortField: string,
    direction: string,
    searchParams: any = {}
  ): Observable<PaginatedResponse<Category>> {
    try {
      page--
      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('sort', [`${sortField},${direction}`].toString())

      Object.keys(searchParams).forEach((key) => {
        if (searchParams[key]) {
          params = params.set(key, searchParams[key]);
        }
      });

      return this.http.get<PaginatedResponse<Category>>(`${this.url}/page`, { params });
    } catch (error) {
      console.error('Error en getPaginatedCategories:', error);
      throw error;
    }
  }

  getAllCategories(): Observable<Category[]> {
    try {
      const response = this.http.get<Category[]>(this.url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  addCategory(newCategory: Category) {
    try {
      return this.http.post<Category>(this.url, newCategory);
    } catch (error) {
      throw error;
    }
  }

  updateCategory(categoryId: number, category: Partial<Category>) {
    try {
      const updateData = {
        name: category.name,
        description: category.description,
        is_delete: category.is_delete
      };
      return this.http.put<Category>(`${this.url}/${categoryId}`, updateData);
    } catch (error) {
      throw error;
    }
  }

  validateCategoryName(name: string): Observable<boolean> {
    return this.getAllCategories().pipe(
      map(categories =>
        categories.some(category =>
          category.name.toLowerCase().trim() === name.toLowerCase().trim()
        )
      )
    );
  }
}
