import { useState } from 'react';
import useSocket from '../hooks/useSocket';

const SendMessages = () => {
    const [inputMessage, setInputMessage] = useState<string>('');
    const { sendMessage } = useSocket();

    const handleSendMessage = () => {
        sendMessage(inputMessage);
        setInputMessage('');
    };
    return (
        <div>
            <div>
                <h3>Enviar nuevo mensaje</h3>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="Escribe un mensaje"
                />
                <button onClick={handleSendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default SendMessages;
