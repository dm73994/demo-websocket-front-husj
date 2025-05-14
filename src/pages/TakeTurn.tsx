import React, { useEffect, useState } from 'react';
import { AppoinmentModel } from '../data/models/AppointmentModel';
import {
    getAllAppoinments,
    postArrivalAppointment,
    postCallToDeliver,
    postNewArrivalAppointment,
} from '../services/api/AppointmentsApi';
import Swal from 'sweetalert2';
import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
} from '@mui/material';
import useSocket, { DestSocket } from '../hooks/useSocket';

enum tabs {
    FACTURACION = 1,
    SOLICITAR_CITA = 0,
    RESULTADOS = 2,
}

const TakeTurn = () => {
    const { sendMessage } = useSocket(DestSocket.ARRIVAL);
    const [data, setData] = useState<AppoinmentModel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentTab, setCurrentTab] = useState<tabs>(tabs.FACTURACION);
    const [selectedAgenda, setSelectedAgenda] = useState<
        'TOMOGRAFÍA' | 'RADIOGRAFÍA' | 'RESONANCIA' | 'ECOGRAFÍA'
    >();

    // Cambia esto a null para evitar problemas de controlado/no controlado
    const [appointment, setAppointment] = useState<AppoinmentModel | null>(null);
    const [contador, setContador] = useState(1);
    const [error, setError] = useState('');

    const handleChange = (_event: React.SyntheticEvent, newValue: AppoinmentModel | null) => {
        setAppointment(newValue);
    };

    const generarTurno = async () => {
        if (!appointment) {
            alert('⚠️ No se encontró el nombre para esta cédula');
            return;
        }

        setLoading(true);
        try {
            if (currentTab === tabs.FACTURACION) {
                await postArrivalAppointment(appointment.patientId);
            } else {
                const data: AppoinmentModel = {
                    ...appointment,
                    doctor: 'N/a',
                    appoinmentDate: new Date(),
                    appointmentAssignmentDate: new Date(),
                    eps: 'N/a',
                    speciality: selectedAgenda
                };
                setAppointment(data);
                console.log(data);
                await postNewArrivalAppointment(data);
            }
            sendMessage(JSON.stringify(appointment));
            Swal.fire({
                title: 'Turno generado',
                text: `✅ Turno ${contador} generado para ${appointment.patientName} (${appointment.speciality})`,
                timer: 10000,
            });

            setContador(contador + 1);
            setAppointment(null);
            setError('');
        } catch (error) {
            console.error(error);
            setError('Error generando turno');
            Swal.fire({
                title: 'Ha ocurrido un error',
                text: 'Por favor, intente nuevamente',
                timer: 10000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCallToDeliver = async () => {
        await postCallToDeliver('-');
        const message = `${appointment?.patientName.replace('+', ' ')} pasara a recibir resultados`;
        await postCallToDeliver(message);
    };

    const handleTabButtons = (tab: tabs) => {
        setCurrentTab(tab);
        if (tab === tabs.FACTURACION) {
            setAppointment(null);
        } else {
            setAppointment({
                id: 0,
                speciality: 'N/a',
                doctor: 'N/a',
                appoinmentDate: new Date(),
                appointmentAssignmentDate: new Date(),
                patientName: '',
                patientId: 'N/a',
                eps: 'N/a',
            });
        }
    };

    const fetchAppoinments = async () => {
        setLoading(true);
        try {
            const response = await getAllAppoinments();
            if (response) {
                setData(response);
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error obteniendo dados',
                text: 'Por favor intente nuevamente',
                icon: 'error',
                timer: 10000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppoinments();
    }, []);

    return (
        <>
            <div className="turno-container">
                {loading && <p className="info">🔍 Cargando agenda diaria...</p>}

                <h2 className="titulo">Bienvenido a Imágenes Diagnósticas</h2>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 5,
                        marginTop: 3,
                    }}
                >
                    <Button
                        onClick={() => handleTabButtons(tabs.FACTURACION)}
                        variant="outlined"
                        sx={{
                            backgroundColor: currentTab === tabs.FACTURACION ? '#143064' : '#fff',
                            color: currentTab === tabs.FACTURACION ? '#fff' : '#143064',
                        }}
                    >
                        Facturación
                    </Button>
                    <Button
                        onClick={() => handleTabButtons(tabs.SOLICITAR_CITA)}
                        variant="outlined"
                        sx={{
                            backgroundColor:
                                currentTab === tabs.SOLICITAR_CITA ? '#143064' : '#fff',
                            color: currentTab === tabs.SOLICITAR_CITA ? '#fff' : '#143064',
                        }}
                    >
                        Agendamiento
                    </Button>
                    <Button
                        onClick={() => handleTabButtons(tabs.RESULTADOS)}
                        variant="outlined"
                        sx={{
                            backgroundColor: currentTab === tabs.RESULTADOS ? '#143064' : '#fff',
                            color: currentTab === tabs.RESULTADOS ? '#fff' : '#143064',
                        }}
                    >
                        Resultados
                    </Button>
                </Box>

                {currentTab === tabs.SOLICITAR_CITA && (
                    <Box
                        sx={{
                            mt: 5,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            gap: 5,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Digite su nombre completo"
                            onChange={e => {
                                const text = e.target.value;
                                setAppointment(prevValue => {
                                    return { ...prevValue!, patientName: text };
                                });
                            }}
                            value={appointment?.patientName || ''}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Número de identificación"
                            type="number"
                            onChange={e => {
                                const text = e.target.value;
                                setAppointment({ ...appointment!, patientId: text });
                            }}
                            value={appointment?.patientId || ''}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />

                        <FormControl>
                            <FormLabel>Tipo de agendamiento</FormLabel>
                            <RadioGroup
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}
                                onChange={e => {
                                    setSelectedAgenda(e.target.value);
                                }}
                            >
                                <FormControlLabel
                                    value={'TOMOGRAFÍA'}
                                    control={<Radio />}
                                    label={'TOMOGRAFÍA'}
                                />
                                <FormControlLabel
                                    value={'RADIOGRAFÍA'}
                                    control={<Radio />}
                                    label={'RADIOGRAFÍA'}
                                />
                                <FormControlLabel
                                    value={'RESONANCIA'}
                                    control={<Radio />}
                                    label={'RESONANCIA'}
                                />
                                <FormControlLabel
                                    value={'ECOGRAFÍA'}
                                    control={<Radio />}
                                    label={'ECOGRAFÍA'}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                )}

                {currentTab === tabs.FACTURACION && (
                    <div className="input-group">
                        <Autocomplete
                            fullWidth
                            disablePortal
                            id="appointment-search"
                            options={data}
                            getOptionLabel={(option: AppoinmentModel) => option.patientName}
                            renderOption={(props, option: AppoinmentModel) => (
                                <li {...props} key={option.id}>
                                    {option.patientName} - {option.patientId}
                                </li>
                            )}
                            renderInput={params => (
                                <TextField {...params} label="Nombre paciente" />
                            )}
                            onChange={handleChange}
                            value={appointment} // Esta es la línea clave - añade value para que sea controlado
                        />
                        {error && !loading && <p className="error">{error}</p>}
                    </div>
                )}

                {currentTab === tabs.RESULTADOS && (
                    <Box
                        sx={{
                            mt: 5,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            gap: 5,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Digite su nombre completo"
                            onChange={e => {
                                const text = e.target.value;
                                setAppointment(prevValue => {
                                    return { ...prevValue!, patientName: text };
                                });
                            }}
                            value={appointment?.patientName || ''}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                    </Box>
                )}

                {appointment && (
                    <div className="paciente-info">
                        <h3 className="bienvenida">
                            Hola, Bienvenido al Hospital Universitario San José{' '}
                            <span className="nombre">{appointment.patientName}</span>
                        </h3>
                        <p style={{ color: '#1E3B82' }}>
                            Tipo de imagen diagnóstica: <strong>{appointment.speciality}</strong>
                        </p>
                    </div>
                )}

                <Button
                    sx={{ mt: 5 }}
                    onClick={() => {
                        if (currentTab === tabs.RESULTADOS) {
                            handleCallToDeliver();
                        } else {
                            generarTurno();
                        }
                    }}
                    disabled={!appointment} // Simplificado
                    variant="contained"
                    color="success"
                >
                    Confirmar Llegada
                </Button>
            </div>
            <p style={{ color: '#fff' }}>
                HUSJ
                <br />
                Innovación e investigacion 2025 <br />
                Julian Vargas & David Mesa
            </p>
        </>
    );
};

export default TakeTurn;
