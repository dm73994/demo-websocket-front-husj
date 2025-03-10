import { useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import { useSpeech } from '../hooks/useSpeech';

const ReceiveMessage = () => {
    const { messages } = useSocket();
    const { play, updateText } = useSpeech();
    const lastProcessedIdRef = useRef<number>(-1);

    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        console.log('Nuevo mensaje recibido:', lastMessage);

        // Solo reproducir si es un mensaje nuevo
        updateText(lastMessage.content);
        play();
        lastProcessedIdRef.current = lastMessage.id;
    }, [messages, updateText, play]);

    return (
        <div>
            <div>
                <h3>Mensajes recibidos:</h3>
                {messages.length === 0 ? (
                    <p>No hay mensajes aún.</p>
                ) : (
                    <ul>
                        {messages.map(message => (
                            <li key={message.id}>{message.content}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ReceiveMessage;
