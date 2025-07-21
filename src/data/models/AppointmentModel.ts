
export interface AppoinmentModel{
    id: number;
    speciality: string;
    doctor: string;
    appoinmentDate: Date;
    appointmentAssignmentDate: Date;
    patientName: string;
    patientId: string;
    eps: string;
    priority: boolean;
}