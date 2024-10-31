import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '../models/role';

@Pipe({
  name: 'roleMapper',
  standalone: true
})
export class TransformRolePipe implements PipeTransform {
  transform(role: any): Role {
    return {
      id: role.id,
      code: role.code,
      name: role.name.toString(),
      prettyName: role.pretty_name.toString(),
      description: role.description.toString(),
      active: role.active
    };
  }

}