import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MainContainerComponent } from '../../../projects/ngx-dabd-grupo01/src/lib/main-container/main-container.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Undo,
  Heading,
  List,
  Indent,
} from 'ckeditor5';
import { RoleService } from '../shared/services/role.service';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [MainContainerComponent, CommonModule, FormsModule, CKEditorModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
})
export class RulesComponent {
  private roleService = inject(RoleService);

  public Editor = ClassicEditor;

  rulesContent: string = '';
  editMode: boolean = false;
  isAdmin: boolean = true;
  

  public config = {
    toolbar: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      '|',
      'bulletedList',
      'numberedList',
    ],
    plugins: [Essentials, Bold, Italic, Undo, Paragraph, Heading, List, Indent],
    language: { ui: 'en' },
  };

  ngOnInit(): void {
    this.roleService.currentRole$.subscribe((role: string) => {
      this.isAdmin = role === "ADMIN";
    });


    this.loadRules();
  }

  loadRules(): void {
    const savedRules = localStorage.getItem('rulesContent');
    this.rulesContent = savedRules || 'No hay reglas definidas.';
  }

  onChange({ editor }: any): void {
    this.rulesContent = editor.getData();
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
  }

  saveRules(): void {
    localStorage.setItem('rulesContent', this.rulesContent);
    this.editMode = false;
  }
}
