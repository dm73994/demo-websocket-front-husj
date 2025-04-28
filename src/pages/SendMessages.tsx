/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import useSocket, { DestSocket } from '../hooks/useSocket';
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    TextField,
    Typography,
} from '@mui/material';
import { AppoinmentModel } from '../data/models/AppointmentModel';
import { DataGrid, GridColDef, GridFilterModel, useGridApiRef } from '@mui/x-data-grid';
import { postWaitingAppointmentToCall } from '../services/api/AppointmentsApi';
import Swal from 'sweetalert2';

const SendMessages = () => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const [patientId, setPatientId] = useState<string>('');
    const { data } = useSocket(DestSocket.WAITING);
    const pageSize = 5;
    const apiRef = useGridApiRef();
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

    const handleSendMessage = async () => {
        try {
            await postWaitingAppointmentToCall(patientId, inputMessage);
            setInputMessage('');
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'Por favor intente nuevamente',
                timer: 10000,
            });
        }
    };

    const handleChange = (_event: React.SyntheticEvent, newValue: AppoinmentModel | null) => {
        if (newValue) {
            setPatientId(newValue.patientId);
            setInputMessage(`${newValue.patientName} Solicitado en ${newValue.speciality}`);
        } else {
            setInputMessage('');
        }
    };

    const columns: GridColDef<AppoinmentModel>[] = [
        { field: 'id', headerName: 'ID', width: 80 },
        {
            field: 'patientName',
            headerName: 'Paciente',
            flex: 1,
        },
        {
            field: 'speciality',
            headerName: 'Procedimiento',
            flex: 1,
        },
        {
            field: 'doctor',
            headerName: 'Doctor',
            flex: 1,
        },
        //   {
        //     field: 'appoinmentDate',
        //     headerName: 'Hora de cita',
        //     width: 160,
        //     valueFormatter: (params) => {
        //       return new Date(params.value).toLocaleTimeString();
        //     },
        //   },
    ];

    return (
        <div style={styles.banner}>
            <Container sx={{ paddingBlock: 5 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component={'div'} textAlign={'center'}>
                            LLAMAR PACIENTE
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 5,
                                gap: 5,
                            }}
                        >
                            <Autocomplete
                                disablePortal
                                id="appointment-search"
                                options={data}
                                getOptionLabel={(option: AppoinmentModel) => option.patientName}
                                renderOption={(props, option: AppoinmentModel) => (
                                    <li {...props} key={option.id}>
                                        {option.patientName} - {option.speciality}
                                    </li>
                                )}
                                sx={{ width: 300 }}
                                renderInput={params => (
                                    <TextField {...params} label="Nombre paciente" />
                                )}
                                onChange={handleChange}
                            />

                            <Button
                                onClick={handleSendMessage}
                                variant="contained"
                                sx={{
                                    minHeight: '100%',
                                }}
                            >
                                <span className="material-symbols-outlined">campaign</span>
                                LLAMAR
                            </Button>
                        </Box>

                        <Divider sx={{ marginTop: 5, marginBottom: 5 }} />

                        <Typography variant="h6">Pacientes en espera</Typography>

                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={data}
                                columns={columns}
                                filterModel={filterModel}
                                onFilterModelChange={newModel => setFilterModel(newModel)}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: pageSize,
                                        },
                                    },
                                }}
                                pageSizeOptions={[pageSize]}
                                disableRowSelectionOnClick
                                apiRef={apiRef}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Container>
            <p style={{ color: '#fff' }}>
                HUSJ
                <br />
                Innovación e investigacion 2025 <br />
                Julian Vargas & David Mesa
            </p>
        </div>
    );
};

const styles = {
    banner: {
        // minHeight: '100vh',
        // height: '100%',
        // maxWidth: '100%',
        // minWidth: '100%',
    },
};

export default SendMessages;
