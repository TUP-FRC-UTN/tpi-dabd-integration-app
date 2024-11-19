import { Component, inject, ViewEncapsulation } from '@angular/core';
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
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { UserDataService, UserData } from '../../shared/services/user-data.service';
import {Rules} from './rules';
import {ConfigurationService} from '../moderations/sanction-type/services/configuration.service';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [MainContainerComponent, CommonModule, FormsModule, CKEditorModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
})
export class RulesComponent {
  public Editor = ClassicEditor;
  private configService = inject(ConfigurationService)

  rulesContent: string = '';
  editMode: boolean = false;
  currentRules!:Rules

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

  userDataService = inject(UserDataService);
  userData!: UserData;

  loadUserData() {
    this.userDataService.loadNecessaryData().subscribe((response) => {
      if (response) {
        this.userData = response;
      }
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadRules();
  }

  loadRules(): void {
    // const savedRules = localStorage.getItem('rulesContent');
    // this.rulesContent = savedRules || 'No hay reglas definidas.';

    this.configService.getRules().subscribe(response => {
      this.currentRules = response
      this.rulesContent= response.rules
    })


  }

  onChange({ editor }: any): void {
    this.rulesContent = editor.getData();
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
  }

  saveRules(): void {
    // localStorage.setItem('rulesContent', this.rulesContent);
    // this.editMode = false;

    const newRules:Rules = this.currentRules
    newRules.rules = this.rulesContent

    this.configService.putRules(newRules,1).subscribe({
      next: (response) => {
        console.log('new rules: ',response.rules)
        this.loadRules()
        this.editMode=false
      },
      error: (error) => {
        console.error(error);
      }
    })
  }
}
