//Interfaz para el top de proveedores en los graficos
export interface TopProvider {
    name: string;
    companyName: string;
    serviceName: string;
    registrationDate: Date;
    timeActive: string;
}

//Interfaz para servicios agrupados por companias
export interface ServicesByCompany {
    [company: string]: {
      [service: string]: number;
    };
}
