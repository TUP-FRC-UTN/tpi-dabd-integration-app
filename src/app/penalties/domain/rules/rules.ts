import {EntityBase} from '../../shared/models/entity-base.model';


export interface Rules extends EntityBase, RuleDto {
}

export interface RuleDto {
  rules:string
}
