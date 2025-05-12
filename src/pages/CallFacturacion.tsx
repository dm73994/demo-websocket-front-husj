import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket, { DestSocket } from '../hooks/useSocket';
import { useSpeech } from '../hooks/useSpeech';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { WaitingModel } from '../data/models/WaitingModel';

const CallFacturacion = () => {
    const { waitingList } = useSocket(DestSocket.ARRIVAL_CALL);
    const { play } = useSpeech();
    const [currentCall, setCurrentCall] = useState<WaitingModel>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const callQueueRef = useRef<WaitingModel[]>([]);

    // Función para reproducir un mensaje con repeticiones
    const playMessageWithRepetitions = useCallback(
        (message: string, repetitions: number = 1, callback: () => void) => {
            let count = 0;

            const playNextRepetition = () => {
                if (count < repetitions) {
                    play(message);
                    count++;
                    // Usar setTimeout para esperar antes de la siguiente repetición
                    setTimeout(() => {
                        playNextRepetition();
                    }, 2000); // Ajusta este tiempo según la duración promedio de tus mensajes
                } else {
                    // Todas las repeticiones terminadas, ejecutar callback
                    callback();
                }
            };

            playNextRepetition();
        },
        [play],
    );

    // Procesar la cola de llamadas
    const processCallQueue = useCallback(() => {
        console.log(callQueueRef)
        if (callQueueRef.current.length === 0 || isPlaying) return;

        // Establecer estado a reproduciendo
        setIsPlaying(true);

        // Obtener el próximo llamado de la cola
        const nextCall = callQueueRef.current.shift();
        setCurrentCall(nextCall);

        // Reproducir tono antes del llamado
        const audio = new Audio('src/assets/sounds/tone.wav');

        audio.onended = () => {
            // Crear el mensaje para reproducir
            //const callMessage = `${nextCall?.name} pasar a ${nextCall?.place}. ${nextCall?.name} pasar a ${nextCall?.place}. ${nextCall?.name} pasar a ${nextCall?.place}.`;
            const callMessage = `${nextCall?.name}. ${nextCall?.place}.`;

            // Reproducir el mensaje tres veces con pausas
            playMessageWithRepetitions(callMessage, 1, () => {
                // Cuando termina la última repetición, marcar como no reproduciendo
                setTimeout(() => {
                    setIsPlaying(false);
                    // Procesar el siguiente llamado automáticamente
                    processCallQueue();
                }, 500); // Pausa de 1 segundo antes del siguiente llamado
            });
        };

        audio.play();
    }, [playMessageWithRepetitions, isPlaying]);

    // Escuchar cambios en la lista de espera
    useEffect(() => {
        if (!waitingList || waitingList.length === 0) return;

        // Agregar el nuevo llamado a la cola
        const lastMessage = waitingList[0];

        // Verificar si ya existe en la cola para evitar duplicados
        // Ya que no hay ID, comparamos por nombre y lugar
        const isAlreadyInQueue = callQueueRef.current.some(
            call => call.name === lastMessage.name && call.place === lastMessage.place,
        );

        if (!isAlreadyInQueue) {
            callQueueRef.current.push(lastMessage);
            console.log('Nuevo llamado agregado a la cola:', lastMessage);

            // Iniciar el procesamiento si no está reproduciendo
            if (!isPlaying) {
                processCallQueue();
            }
        }
    }, [waitingList]);

    // Efecto para manejar cambios en el estado de reproducción
    useEffect(() => {
        if (!isPlaying && callQueueRef.current.length > 0) {
            processCallQueue();
        }
    }, [isPlaying, processCallQueue]);
 
    return (
        <Box
            style={{
                minHeight: '100vh',
                minWidth: '100vw',
                maxWidth: '100vw',
                top: 0,
                backgroundColor: '#152D58',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'start',
                backgroundImage: "url('src/assets/img/HUSJ.webp')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                flexDirection: 'column',
            }}
        >
            <Box
                sx={{
                    background: 'rgba(255,255,255, 0.6)',
                    backdropFilter: 'blur(2px)',
                    width: '100%',
                    paddingBlock: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    {/* <img src="src\assets\img\logo.webp" alt="logo_husj" width={200} /> */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Typography color="#fff" fontWeight={'bold'}>
                            IMÁGENES DIAGNÓSTICAS
                        </Typography>
                        <img
                            src="src\assets\img\joselin.png"
                            alt="joselin"
                            style={{
                                width: 150,
                                bottom: 0,
                            }}
                        />
                    </Box>
                </Box>

                {currentCall && (
                    <Stack>
                        <Typography textAlign={'center'} variant="h3" fontWeight={'bold'}>
                            {currentCall.name}
                        </Typography>
                        <Chip
                            label={currentCall.place}
                            size="medium"
                            color="warning"
                            sx={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                paddingY: 3,
                            }}
                        />
                    </Stack>
                )}
            </Box>

            <Box sx={{ width: '100vw' }}>
                {waitingList.map((data, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            backgroundColor: index % 2 == 0 ? '#fff' : '#ddd',
                            py: 1,
                            px: 5,
                        }}
                    >
                        <Typography> {data.name} </Typography>
                        <Typography> {data.place} </Typography>
                    </Box>
                ))}
            </Box>

            <Typography
                sx={{
                    color: '#fff',
                    fontWeight: '#fff',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                Innovación e investigación 2025
            </Typography>
        </Box>
    );
};

export default CallFacturacion;
