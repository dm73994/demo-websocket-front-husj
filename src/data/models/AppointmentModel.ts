
export interface AppoinmentModel{
    id: number;
    speciality: string;
    doctor: string;
    programedDate: Date;
    arrivalTime: Date;
    patientName: string;
    patientId: string;
    eps: string;
    priority: boolean;
    moduleName: string;
}