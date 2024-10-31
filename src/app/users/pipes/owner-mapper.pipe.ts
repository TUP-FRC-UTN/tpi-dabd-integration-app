import { Pipe, PipeTransform } from '@angular/core';
import { Address, Contact, Owner } from '../models/owner';
import { Document } from '../models/file';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'ownerMapper',
  standalone: true,
})
export class OwnerMapperPipe implements PipeTransform {
  transform(item: any): Owner {
    return {
      id: item.id,
      firstName: item.first_name,
      secondName: item.second_name,
      lastName: item.last_name,
      ownerType: item.owner_type,
      documentNumber: item.document_number,
      documentType: item.document_type,
      cuit: item.cuit,
      bankAccount: item.bank_account,
      birthdate: item.birthdate,
      kycStatus: item.kyc_status,
      isActive: item.is_active,
      addresses: item.addresses.map((address: Address) =>
        this.transformAddress(address)
      ),
      contacts: item.contacts.map((contact: Contact) =>
        this.transformContact(contact)
      ),
    };
  }

  invertTransform(item: any): any {
    return {
      id: item.id,
      first_name: item.firstName,
      second_name: item.secondName,
      last_name: item.lastName,
      owner_type: item.ownerType,
      document_number: item.documentNumber,
      document_type: item.documentType,
      cuit: item.cuit,
      bank_account: item.bankAccount,
      birthdate: item.birthdate,
      kyc_status: item.kycStatus,
      is_active: item.isActive,
      addresses: item.addresses.map((address: Address) =>
        this.invertTransformAddress(address)
      ),
      contacts: item.contacts.map((contact: Contact) =>
        this.invertTransformContact(contact)
      ),
    };
  }

  transformAddress(item: any): any {
    return {
      id: item.id,
      streetAddress: item.street_address,
      number: item.number,
      floor: item.floor,
      apartment: item.apartment,
      city: item.city,
      province: item.province,
      country: item.country,
      postalCode: item.postal_code,
    };
  }

  invertTransformAddress(item: any): any {
    return {
      id: item.id,
      street_address: item.streetAddress,
      number: item.number,
      floor: item.floor,
      apartment: item.apartment,
      city: item.city,
      province: item.province,
      country: item.country,
      postal_code: item.postalCode,
    };
  }

  transformContact(item: any): any {
    return {
      id: item.id || undefined,
      contactType: item.contact_type,
      contactValue: item.contact_value,
      subscriptions: item.Subscriptions,
    };
  }

  invertTransformContact(item: any): any {
    return {
      id: item.id,
      contact_type: item.contactType,
      contact_value: item.contactValue,
      subscriptions: item.Subscriptions,
    };
  }

  transformFile(item: any): Document {
    return {
      id: item.id,
      fileType: item.file_type,
      name: item.name,
      contentType: item.content_type,
      url: item.url,
      approvalStatus: item.approval_status,
      reviewNote: item.review_note,
      isActive: item.is_active
    };
  }
}
