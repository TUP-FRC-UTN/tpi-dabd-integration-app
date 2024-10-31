import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  Subject,
  BehaviorSubject,
  Subscription,
  OperatorFunction,
} from 'rxjs';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { SanctionTypeService } from '../../services/sanction-type.service';
import { SanctionType } from '../../models/sanction-type.model';

@Component({
  selector: 'app-sanction-type-select',
  standalone: true,
  imports: [CommonModule, NgbTypeaheadModule, FormsModule, JsonPipe],
  templateUrl: './sanction-type-select.component.html',
  styleUrls: ['./sanction-type-select.component.scss'],
})
export class SanctionTypeSelectComponent implements OnInit, OnDestroy {
  @Input() selectedSanctionType: SanctionType | undefined;

  @Input() disabled: boolean = true;
  @Input() readonly: boolean = false;

  @Input() requiered: boolean = false;

  isSanctionTypeValid: boolean = false;
  searchTerm$: Subject<string> = new Subject<string>();
  selectedSanctionTypeSubscription: Subscription | undefined;

  @Output() selectedSanctionTypeChange = new EventEmitter<
    SanctionType | undefined
  >();

  constructor(private sanctionService: SanctionTypeService) {}

  ngOnInit(): void {
    this.selectedSanctionTypeSubscription = this.searchTerm$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((term) =>
          term.length > 0 ? this.sanctionService.getSanctionTypes(term) : []
        )
      )
      .subscribe((sanctionTypes) => {
        // Puedes manejar los resultados de la búsqueda aquí si es necesario
      });
  }

  ngOnDestroy(): void {
    this.selectedSanctionTypeSubscription?.unsubscribe();
  }

  search: OperatorFunction<string, readonly SanctionType[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) =>
        term.length > 0 ? this.sanctionService.getSanctionTypes(term) : []
      )
    );

  formatter = (x: SanctionType) => x.name;

  onSelectedChange(value: SanctionType) {
    this.selectedSanctionType = value;
    this.isSanctionTypeValid = true;
    this.selectedSanctionTypeChange.emit(value);
  }

  validateSanctionType(selected: SanctionType | undefined) {
    this.isSanctionTypeValid = !!selected;
  }
}
