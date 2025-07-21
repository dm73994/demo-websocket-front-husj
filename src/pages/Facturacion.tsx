import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { AppoinmentModel } from '../data/models/AppointmentModel';
import useSocket, { DestSocket } from '../hooks/useSocket';
import {
    deleteArrivalAppointment,
    postArrivalAppointmentToCall,
    postFinishAppointment,
    postUnattendedAppointment,
    postWaitingAppointment,
} from '../services/api/AppointmentsApi';
import Swal from 'sweetalert2';
import { useState } from 'react';
import {
    Campaign,
    Delete,
    HourglassTop,
    Person,
    Badge,
    LocalHospital,
    Schedule,
} from '@mui/icons-material';

const Facturacion = () => {
    const { data: pacientes } = useSocket(DestSocket.ARRIVAL);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [filter, setFilter] = useState('FACTURACION');

    const llamarPaciente = async (paciente: AppoinmentModel, cabin: string) => {
        const data = JSON.stringify({
            name: paciente.patientName,
            place: `${
                paciente.doctor === 'N/a'
                    ? `agendamiento ${paciente.speciality}`
                    : `facturación ${cabin}`
            } `,
            calledBy: `${paciente.doctor === 'N/a' ? paciente.speciality : 'Facturacion' + cabin}`,
        });
        console.log(data);
        await postArrivalAppointmentToCall(String(paciente.id), data);
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

    const finalizarAgendamiento = async (paciente: AppoinmentModel) => {
        try {
            await postFinishAppointment(paciente);
            Swal.fire({
                title: 'Agendamiento finalizado',
                text: 'El paciente ha sido pasado a espera correctamente.',
                icon: 'success',
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error al finalizar agendamiento',
                text: 'Por favor intente nuevamente.',
                icon: 'error',
            });
        }
    };

    const pacienteNoAtendido = async (paciente: AppoinmentModel) => {
        try {
            await postUnattendedAppointment(paciente);
            Swal.fire({
                title: 'Paciente marcado como no atendido',
                text: 'El paciente ha sido marcado correctamente.',
                icon: 'success',
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error al marcar paciente como no atendido',
                text: 'Por favor intente nuevamente.',
                icon: 'error',
            });
        }
    };

    const filterOptions = ['FACTURACION', 'TOMOGRAFÍA', 'RADIOGRAFÍA', 'RESONANCIA', 'ECOGRAFÍA'];

    const filteredPacientes = pacientes.filter(p =>
        filter !== 'FACTURACION'
            ? p.speciality.toUpperCase() === filter
            : !['FACTURACION', 'TOMOGRAFÍA', 'RADIOGRAFÍA', 'RESONANCIA', 'ECOGRAFÍA'].includes(
                  p.speciality.toUpperCase(),
              ),
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: 3,
            }}
        >
            <Container maxWidth="xl">
                {/* Filtros */}
                <Card elevation={1} sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                            Filtrar por especialidad
                        </Typography>
                        <Stack
                            direction={isMobile ? 'column' : 'row'}
                            spacing={1}
                            sx={{ flexWrap: 'wrap' }}
                        >
                            {filterOptions.map(option => (
                                <Button
                                    key={option}
                                    variant={filter === option ? 'contained' : 'outlined'}
                                    onClick={() => setFilter(option)}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        borderRadius: 2,
                                        textTransform: 'capitalize',
                                        fontWeight: 500,
                                        backgroundColor:
                                            filter === option ? 'primary.main' : 'transparent',
                                        color: filter === option ? 'white' : 'text.primary',
                                        borderColor: '#ccc',
                                        '&:hover': {
                                            backgroundColor:
                                                filter === option ? 'primary.dark' : '#f0f0f0',
                                        },
                                    }}
                                >
                                    {option}
                                </Button>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Tabla de pacientes */}
                <Card elevation={1}>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f4f6f8' }}>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <Schedule sx={{ color: 'action.active' }} />
                                                Hora cita
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <Person color="primary" />
                                                Nombre
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <Badge color="primary" />
                                                Cédula
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                                            Procedimiento
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                                            Encargado
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', py: 2, textAlign: 'center' }}
                                        >
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPacientes.length > 0 ? (
                                        filteredPacientes.map((paciente, index) => (
                                            <TableRow
                                                key={paciente.patientId}
                                                sx={{
                                                    '&:hover': { backgroundColor: '#f5f7fa' },
                                                    backgroundColor: paciente.priority
                                                        ? index % 2 === 0
                                                            ? '#f8d6d6ff'
                                                            : '#f8d6d6ff'
                                                        : index % 2 === 0
                                                        ? '#fafafa'
                                                        : 'white',
                                                }}
                                            >
                                                <TableCell sx={{ py: 2 }}>
                                                    <Chip
                                                        label={new Date(
                                                            paciente.appoinmentDate,
                                                        ).toLocaleTimeString()}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ py: 2, fontWeight: 500 }}>
                                                    {paciente.patientName}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    {paciente.patientId}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Chip
                                                        label={paciente.speciality}
                                                        color="secondary"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    {paciente.doctor}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            flexWrap: 'wrap',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {paciente.doctor !== 'N/a' ? (
                                                            <>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<Campaign />}
                                                                    onClick={() =>
                                                                        llamarPaciente(
                                                                            paciente,
                                                                            '1',
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        background:
                                                                            'linear-gradient(45deg, #4CAF50, #45a049)',
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    Puesto 1
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<Campaign />}
                                                                    onClick={() =>
                                                                        llamarPaciente(
                                                                            paciente,
                                                                            '2',
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        background:
                                                                            'linear-gradient(45deg, #2196F3, #1976D2)',
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    Puesto 2
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    color="success"
                                                                    startIcon={<HourglassTop />}
                                                                    onClick={() =>
                                                                        finalizarFacturacion(
                                                                            paciente,
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        borderWidth: 2,
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    Pasar a espera
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    color="error"
                                                                    startIcon={<Delete />}
                                                                    onClick={() =>
                                                                        pacienteNoAtendido(paciente)
                                                                    }
                                                                    sx={{
                                                                        borderWidth: 2,
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    No se presentó
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<Campaign />}
                                                                    onClick={() =>
                                                                        llamarPaciente(
                                                                            paciente,
                                                                            paciente.speciality,
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        background:
                                                                            'linear-gradient(45deg, #667eea, #764ba2)',
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    Llamar
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<Campaign />}
                                                                    onClick={() =>
                                                                        finalizarAgendamiento(
                                                                            paciente,
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        background:
                                                                            'linear-gradient(45deg, #096916ff, #469e63ff)',
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    Finalizar
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    color="error"
                                                                    startIcon={<Delete />}
                                                                    onClick={() =>
                                                                        pacienteNoAtendido(paciente)
                                                                    }
                                                                    sx={{
                                                                        borderWidth: 2,
                                                                        minWidth: isMobile
                                                                            ? '100%'
                                                                            : 'auto',
                                                                    }}
                                                                >
                                                                    No se presentó
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                sx={{ textAlign: 'center', py: 4 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                    }}
                                                >
                                                    <HourglassTop
                                                        sx={{ fontSize: 60, color: '#9e9e9e' }}
                                                    />
                                                    <Typography variant="h6" color="text.secondary">
                                                        No hay pacientes en espera
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Card
                    elevation={0}
                    sx={{
                        mt: 4,
                        backgroundColor: '#f4f4f4',
                        color: 'text.primary',
                        borderTop: '1px solid #e0e0e0',
                    }}
                >
                    <CardContent sx={{ py: 3 }}>
                        <Grid container spacing={3}>
                            <Grid
                                size={{
                                    md: 6,
                                    xs: 12,
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    Hospital Universitario San José
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Proyecto de innovación 2025
                                </Typography>
                            </Grid>
                            <Grid
                                size={{
                                    md: 6,
                                    xs: 12,
                                }}
                            >
                                <Box sx={{ textAlign: isMobile ? 'left' : 'right' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Fredy López • Julian Vargas • David Mesa • Isabel Dorado
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Facturacion;
