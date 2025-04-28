import { Box, Typography } from '@mui/material';
import { useEffect, useRef } from 'react'
import useSocket, { DestSocket } from '../hooks/useSocket';
import { useSpeech } from '../hooks/useSpeech';

const CallDelivery = () => {
    const { messages } = useSocket(DestSocket.DELIVER);
    const { play } = useSpeech();
    const lastProcessedIdRef = useRef<string>("");

    useEffect(() => {
        if (!messages) return;

        const lastMessage = messages;

        play(lastMessage.toUpperCase());
        lastProcessedIdRef.current = lastMessage;
    }, [messages, play]);

    return (
        <Box style={{
            minHeight: '100vh',
            minWidth: '100vw',
            maxWidth: '100vw',
            top: 0,
            backgroundColor: '#152D58',
            display: 'flex',
            justifyContent: 'center',
            alignItems:'center',
            backgroundImage: "url('src/assets/img/HUSJ.webp')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center'
        }}>

            <Box sx={{
                backgroundColor: '#fff',
                width: '100%',
                paddingBlock: 4
                ,display: 'flex',
                justifyContent: 'center'
                ,flexDirection: 'column'
                ,alignItems: 'center'
                ,gap: 5
            }}>
                    <img src="src\assets\img\logo.webp" alt="logo_husj" width={150}/>

                    {messages && (
                        <Typography textAlign={'center'} variant='h3'>{messages.toUpperCase()}</Typography>
                    )}
            </Box>
        </Box>
    );
}

export default CallDelivery