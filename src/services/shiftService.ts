import axios from 'axios';

const API_URL = 'http://localhost:3001/api/employee-shifts';

export interface Shift {
    id: string;
    employeeId: number;
    employeeName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'absent' | 'pending';
    notes?: string | null;
    attendanceTime?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ShiftChangeRequest {
    id: string;
    shiftId: string;
    employeeId: number;
    employeeName: string;
    currentDate: string;
    requestedDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface CreateShiftDto {
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

export interface CreateChangeRequestDto {
    shiftId: string;
    requestedDate: string;
    reason: string;
}

class ShiftService {
    private getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Obtener todos los turnos (admin) o mis turnos (empleado)
    async getShifts(filters?: {
        employeeId?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Shift[]> {
        try {
            const response = await axios.get(API_URL, {
                headers: this.getAuthHeader(),
                params: filters
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching shifts:', error);
            throw error;
        }
    }

    // Obtener mis turnos
    async getMyShifts(): Promise<Shift[]> {
        try {
            const response = await axios.get(`${API_URL}/my-shifts`, {
                headers: this.getAuthHeader()
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching my shifts:', error);
            throw error;
        }
    }

    // Crear turno (solo admin)
    async createShift(data: CreateShiftDto): Promise<Shift> {
        try {
            const response = await axios.post(API_URL, data, {
                headers: this.getAuthHeader()
            });
            return response.data.data;
        } catch (error) {
            console.error('Error creating shift:', error);
            throw error;
        }
    }

    // Actualizar turno (solo admin)
    async updateShift(id: string, data: Partial<Shift>): Promise<Shift> {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data, {
                headers: this.getAuthHeader()
            });
            return response.data.data;
        } catch (error) {
            console.error('Error updating shift:', error);
            throw error;
        }
    }

    // Eliminar turno (solo admin)
    async deleteShift(id: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: this.getAuthHeader()
            });
        } catch (error) {
            console.error('Error deleting shift:', error);
            throw error;
        }
    }

    // Marcar asistencia
    async markAttendance(shiftId: string): Promise<Shift> {
        try {
            const response = await axios.post(
                `${API_URL}/${shiftId}/attendance`,
                {},
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error marking attendance:', error);
            throw error;
        }
    }

    // Solicitar cambio de turno
    async requestChange(data: CreateChangeRequestDto): Promise<ShiftChangeRequest> {
        try {
            const response = await axios.post(
                `${API_URL}/change-request`,
                data,
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error requesting change:', error);
            throw error;
        }
    }

    // Obtener solicitudes de cambio
    async getChangeRequests(): Promise<ShiftChangeRequest[]> {
        try {
            const response = await axios.get(`${API_URL}/change-requests`, {
                headers: this.getAuthHeader()
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching change requests:', error);
            throw error;
        }
    }

    // Aprobar/rechazar solicitud (solo admin)
    async updateChangeRequest(
        id: string,
        status: 'approved' | 'rejected'
    ): Promise<ShiftChangeRequest> {
        try {
            const response = await axios.put(
                `${API_URL}/change-request/${id}`,
                { status },
                { headers: this.getAuthHeader() }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error updating change request:', error);
            throw error;
        }
    }
}

export const shiftService = new ShiftService();
