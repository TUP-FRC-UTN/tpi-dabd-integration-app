import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import Category from '../models/category';
import { PORT } from '../const';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);
  private url = `${PORT}categories`
  constructor() { }

  getAllCategories():Observable<Category[]>{
    try {
      const response = this.http.get<Category[]>(this.url)
      return response
    } catch (error) {
      throw error
    }
  }

  addCategory(newCategory: Category) {
    try {
      return this.http.post<Category>(this.url, newCategory)
    } catch (error) {
      throw error
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
}
