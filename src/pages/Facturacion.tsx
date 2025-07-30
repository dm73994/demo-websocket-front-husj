import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
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
    postArrivalAppointmentToCall,
    postFinishAppointment,
    postUnattendedAppointment,
    postWaitingAppointment,
} from '../services/api/AppointmentsApi';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { HourglassTop } from '@mui/icons-material';
import { Specialities } from '../data/enums/Specialities';

const Facturacion = () => {
    const { data: pacientes } = useSocket(DestSocket.ARRIVAL);
    console.log('Pacientes en Facturacion:', pacientes);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [filter, setFilter] = useState(Specialities.FACTURACION.valueOf());

    const llamarPaciente = async (paciente: AppoinmentModel, cabin: string) => {
        const calledBy = paciente.doctor === 'N/a' ? paciente.speciality : 'Facturacion ' + cabin;
        const data = JSON.stringify({
            name: paciente.patientName,
            place: `${
                paciente.doctor === 'N/a'
                    ? `agendamiento ${paciente.speciality}`
                    : `facturación ${cabin}`
            } `,
            calledBy,
        });
        console.log(data);
        await postArrivalAppointmentToCall(String(paciente.id), data, calledBy);
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

    const filterOptions = Object.values(Specialities).map(s => s.valueOf());

    const filteredPacientes = pacientes
        .filter(p =>
            filter !== Specialities.FACTURACION.valueOf()
                ? p.speciality.toUpperCase() === filter
                : ![
                      Specialities.FACTURACION.valueOf(),
                      Specialities.TOMOGRAFIA.valueOf(),
                      Specialities.RADIOGRAFIA.valueOf(),
                      Specialities.RESONANCIA.valueOf(),
                      Specialities.ECOGRAFIA.valueOf(),
                  ].includes(p.speciality.toUpperCase()),
        )
        .sort((a, b) => {
            return a.priority === b.priority ? 0 : a.priority ? -1 : 1;
        });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                py: { xs: 2, md: 4 },
                px: { xs: 1, md: 3 },
                bgcolor: 'linear-gradient(135deg, #f9fafc, #e4ecf7)',
            }}
        >
            <Container maxWidth="lg">
                <Card
                    elevation={2}
                    sx={{
                        mb: 4,
                        borderRadius: 3,
                        boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
                    }}
                >
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Filtrar por especialidad
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                flexWrap: 'wrap',
                                overflowX: 'auto',
                                pb: 1,
                                scrollbarWidth: 'thin',
                                '&::-webkit-scrollbar': {
                                    height: 6,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#ccc',
                                    borderRadius: 2,
                                },
                            }}
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
                                        color: filter === option ? '#fff' : 'text.primary',
                                        backgroundColor: filter === option ? '#3f51b5' : undefined,
                                        borderColor: '#ccc',
                                        '&:hover': {
                                            backgroundColor:
                                                filter === option ? '#303f9f' : '#f0f0f0',
                                        },
                                    }}
                                >
                                    {option}
                                </Button>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer
                            sx={{
                                maxHeight: '65vh',
                                overflow: 'auto',
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#eef1f5' }}>
                                        {[
                                            'Hora cita',
                                            'Hora Llegada',
                                            'Nombre',
                                            'Cédula',
                                            'Procedimiento',
                                            'Encargado',
                                            'Acciones',
                                        ].map((label, idx) => (
                                            <TableCell
                                                key={idx}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#3f51b5',
                                                    color: '#fff',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 1,
                                                }}
                                            >
                                                {label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPacientes.length > 0 ? (
                                        filteredPacientes.map((paciente, index) => (
                                            <TableRow
                                                key={paciente.patientId}
                                                sx={{
                                                    backgroundColor: paciente.priority
                                                        ? 'rgba(150, 56, 56, 0.2)'
                                                        : index % 2 === 0
                                                        ? '#fafbfd'
                                                        : '#ffffff',
                                                    '&:hover': {
                                                        backgroundColor: '#f1f5fb',
                                                    },
                                                }}
                                            >
                                                <TableCell>
                                                    {paciente.programedDate
                                                        ? new Date(
                                                              paciente.programedDate,
                                                          ).toLocaleTimeString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        paciente.arrivalTime,
                                                    ).toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell>{paciente.patientName}</TableCell>
                                                <TableCell>{paciente.patientId}</TableCell>
                                                <TableCell>{paciente.speciality}</TableCell>
                                                <TableCell>{paciente.doctor}</TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            flexWrap: 'wrap',
                                                            justifyContent: isMobile
                                                                ? 'center'
                                                                : 'flex-start',
                                                            flexDirection: isMobile
                                                                ? 'column'
                                                                : 'row',
                                                        }}
                                                    >
                                                        {(paciente.doctor !== 'N/a'
                                                            ? [
                                                                  {
                                                                      label: 'Puesto 1',
                                                                      color: 'success',
                                                                      action: () =>
                                                                          llamarPaciente(
                                                                              paciente,
                                                                              '1',
                                                                          ),
                                                                  },
                                                                  {
                                                                      label: 'Puesto 2',
                                                                      color: 'info',
                                                                      action: () =>
                                                                          llamarPaciente(
                                                                              paciente,
                                                                              '2',
                                                                          ),
                                                                  },
                                                                  {
                                                                      label: 'Pasar a espera',
                                                                      outline: true,
                                                                      color: 'success',
                                                                      action: () =>
                                                                          finalizarFacturacion(
                                                                              paciente,
                                                                          ),
                                                                  },
                                                                  {
                                                                      label: 'No se presentó',
                                                                      outline: true,
                                                                      color: 'error',
                                                                      action: () =>
                                                                          pacienteNoAtendido(
                                                                              paciente,
                                                                          ),
                                                                  },
                                                              ]
                                                            : [
                                                                  {
                                                                      label: 'Llamar',
                                                                      color: 'primary',
                                                                      action: () =>
                                                                          llamarPaciente(
                                                                              paciente,
                                                                              paciente.speciality,
                                                                          ),
                                                                  },
                                                                  {
                                                                      label: 'Finalizar',
                                                                      color: 'success',
                                                                      action: () =>
                                                                          finalizarAgendamiento(
                                                                              paciente,
                                                                          ),
                                                                  },
                                                                  {
                                                                      label: 'No se presentó',
                                                                      outline: true,
                                                                      color: 'error',
                                                                      action: () =>
                                                                          pacienteNoAtendido(
                                                                              paciente,
                                                                          ),
                                                                  },
                                                              ]
                                                        ).map(
                                                            (
                                                                { label, color, action, outline },
                                                                i,
                                                            ) => (
                                                                <Button
                                                                    key={i}
                                                                    variant={
                                                                        outline
                                                                            ? 'outlined'
                                                                            : 'contained'
                                                                    }
                                                                    size="small"
                                                                    color={color}
                                                                    onClick={action}
                                                                    sx={{
                                                                        minWidth: 100,
                                                                        px: 1.5,
                                                                        py: 0.8,
                                                                    }}
                                                                >
                                                                    {label}
                                                                </Button>
                                                            ),
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
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

                <Card
                    elevation={0}
                    sx={{
                        mt: 4,
                        bgcolor: '#f7f7f7',
                        borderTop: '1px solid #ddd',
                        borderRadius: 2,
                    }}
                >
                    <CardContent>
                        <Grid container spacing={2} justifyContent="space-between">
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Hospital Universitario San José
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Proyecto de innovación 2025
                                </Typography>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
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
