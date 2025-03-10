import { useState, useEffect } from 'react';

interface Message {
    id: number;
    content: string;
}

const useSocket = (url = 'wss://demo-websockets-husj-production.up.railway.app') => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [inputMessage, setInputMessage] = useState<string>('');

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('Conectado al servidor WebSocket');
        };

        ws.onmessage = (event: MessageEvent) => {
            console.log('Mensaje recibido del servidor:', event.data);
            setMessages(prevMessages => [
                ...prevMessages,
                { id: prevMessages.length + 1, content: event.data },
            ]);
        };

        ws.onclose = () => {
            console.log('Desconectado del servidor WebSocket');
        };

        setSocket(ws);

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [url]);

    const sendMessage = (message: string) => {
        if (socket && message) {
            socket.send(message);
        }
    };

    return {
        messages,
        sendMessage,
        inputMessage,
        setInputMessage,
    };
};

export default useSocket;
