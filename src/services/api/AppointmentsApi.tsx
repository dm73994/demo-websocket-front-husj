import { customAxios } from "../../config/customAxios";
import { AppoinmentModel } from "../../data/models/AppointmentModel";

export const getAllAppoinments = async(): Promise<AppoinmentModel[]> => {
    try {
        const response = await customAxios.get<AppoinmentModel[]>("/appointments");
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postArrivalAppointment = async(id: string): Promise<AppoinmentModel[]> => {
    try {
        const response = await customAxios.post<AppoinmentModel[]>(`/appointments/arrival/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postNewArrivalAppointment = async(appointment: AppoinmentModel): Promise<AppoinmentModel[]> => {
    try {
        const response = await customAxios.post<AppoinmentModel[]>(`/appointments/arrival`, appointment);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postArrivalAppointmentToCall = async(message: string): Promise<AppoinmentModel[]> => {
    try {
        const response = await customAxios.post<AppoinmentModel[]>(`/appointments/arrival-call`, {message});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postWaitingAppointment = async(id: string): Promise<AppoinmentModel[]> => {
    try {
        const response = await customAxios.post<AppoinmentModel[]>(`/appointments/waiting/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
} 

export const postWaitingAppointmentToCall = async(id: string, message: string): Promise<AppoinmentModel[]> => {
    try {
        const response = await customAxios.post<AppoinmentModel[]>(`/appointments/consult/${id}?message=${message}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
} 

export const deleteArrivalAppointment = async(appointment: AppoinmentModel) => {
    try {
        const response = await customAxios.post<AppoinmentModel[]>(`/appointments/arrival/delete`, appointment)
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getCurrentWaitingList = async() => {
    try {
        const response = await customAxios.get<AppoinmentModel[]>(`/appointments/waiting/all`)
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getCurrentArrivalList = async() => {
    try {
        const response = await customAxios.get<AppoinmentModel[]>(`/appointments/arrival/all`)
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postCallToDeliver = async(message: string) => {
    try {
        const response = await customAxios.post<string[]>(`/appointments/call/result`, message)
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}