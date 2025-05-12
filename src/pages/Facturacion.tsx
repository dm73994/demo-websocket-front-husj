import { Box, Button } from '@mui/material';
import { AppoinmentModel } from '../data/models/AppointmentModel';
import useSocket, { DestSocket } from '../hooks/useSocket';
import { deleteArrivalAppointment, postWaitingAppointment } from '../services/api/AppointmentsApi';
import Swal from 'sweetalert2';

const Facturacion = () => {
    const { data: pacientes } = useSocket(DestSocket.ARRIVAL);
    const { sendMessage } = useSocket(DestSocket.ARRIVAL_CALL);

    const llamarPaciente = async (paciente: AppoinmentModel, cabin: string) => {
        // await postArrivalAppointmentToCall(`${paciente.patientName} pasar a facturación`)
        const data = JSON.stringify({
            name: paciente.patientName,
            place: `${paciente.doctor === 'N/a' ? `agendamiento ${paciente.speciality}` : `facturación ${cabin}`} `,
        });
        sendMessage(data);
    };

    const deletePatient = async (paciente: AppoinmentModel) => {
        try {
            await deleteArrivalAppointment(paciente);
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Ha ocurrido un error',
                text: 'Por favor intente nuevamente',
            });
        }
    };

    const finalizarFacturacion = async (paciente: AppoinmentModel) => {
        try {
            await postWaitingAppointment(paciente.patientId);
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Ha ocurrido un error',
                text: 'Por favor intente nuevamente',
            });
        }
    };

    return (
        <div className="tabla-container">
            <h2>📋 Lista de Pacientes - Facturación</h2>
            <div className="tabla-wrapper">
                <table className="tabla-pacientes">
                    <thead>
                        <tr>
                            <th>🆔 Hora cita</th>
                            <th>👤 Nombre</th>
                            <th>🪪 Cédula</th>
                            <th>🩻 Procedimiento</th>
                            <th>🪪 Encargado</th>
                            <th>⚙️ Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pacientes.length > 0 ? (
                            pacientes.map(paciente => (
                                <tr key={paciente.patientId}>
                                    <td>
                                        {new Date(paciente.appoinmentDate).toLocaleTimeString()}
                                    </td>
                                    <td>{paciente.patientName}</td>
                                    <td>{paciente.patientId}</td>
                                    <td>{paciente.speciality}</td>
                                    <td>{paciente.doctor}</td>
                                    <td>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 4,
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                onClick={() => llamarPaciente(paciente, '1')}
                                            >
                                                📢 Llamar puesto 1
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={() => llamarPaciente(paciente, '2')}
                                            >
                                                📢 Llamar puesto 2
                                            </Button>
                                            {paciente.doctor === 'N/a' && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => deletePatient(paciente)}
                                                    sx={{
                                                        borderWidth: '2px',
                                                    }}
                                                >
                                                    ❌ ELIMINAR
                                                </Button>
                                            )}
                                            {paciente.doctor !== 'N/a' && (
                                                <Button
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => finalizarFacturacion(paciente)}
                                                    sx={{
                                                        borderWidth: '2px',
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">
                                                        hourglass_top
                                                    </span>
                                                    PASAR A ESPERA
                                                </Button>
                                            )}
                                        </Box>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5}>⏳ No hay pacientes en espera...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <p style={{ color: '#fff' }}>
                HUSJ
                <br />
                Innovación e investigacion 2025 <br />
                Julian Vargas & David Mesa
            </p>
        </div>
    );
};

export default Facturacion;
