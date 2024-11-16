import { FormControl, FormGroup, ValidationErrors } from "@angular/forms";

export class ValidatorFecha{
  static validarFecha(control: FormControl): ValidationErrors | null {
    let fecha = new Date(control.value);
    const fechaHoy = new Date();
  
    fecha = addOneDay(fecha);
    
    fecha.setHours(0, 0, 0, 0);
    fechaHoy.setHours(0, 0, 0, 0);
  
    // Comparar solo las fechas (sin considerar la hora)
    if (fecha < fechaHoy) {
      return { errorFechaInicio: true }; 
    }
  
    return null;
  }
  
}

function addOneDay(date: Date): Date {
  const newDate = new Date(date); // Hacemos una copia de la fecha
  newDate.setDate(newDate.getDate() + 1); // Sumamos un día
  return newDate;
}