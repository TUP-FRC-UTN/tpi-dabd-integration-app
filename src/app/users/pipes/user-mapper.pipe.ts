import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../models/user';

@Pipe({
  name: 'userMapper',
  standalone: true
})
export class UserMapperPipe implements PipeTransform {

  transform(user: any): User {
    return {
      id: user.id,
      firstName: user.first_name.toString(),
      lastName: user.last_name.toString(),
      userName: user.user_name.toString(),
      email: user.email.toString(),
      addresses: [...user.address],
      contacts: [...user.contacts],
      roles: [...user.contacts],
      isActive: user.is_active
    };
  }

  invertTransform(user: any): any {
    return {
      id: user.id,
      first_name: user.firstName.toString(),
      last_name: user.lastName.toString(),
      user_name: user.userName.toString(),
      email: user.email.toString(),
      is_active: user.isActive
    };
  }
}
