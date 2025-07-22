import { useState, useEffect } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import { AppoinmentModel } from '../data/models/AppointmentModel';
import { getCurrentArrivalList, getCurrentWaitingList } from '../services/api/AppointmentsApi';
import { WaitingModel } from '../data/models/WaitingModel';

export enum DestSocket {
    ARRIVAL = 'arrival',
    WAITING = 'waiting',
    CONSULT = 'consult',
    ARRIVAL_CALL = 'arrivalcall',
    DELIVER = 'deliver_results',
}
const url = 'ws://localhost:5000/websocket';

const useSocket = (destSocket: DestSocket) => {
    const [messages, setMessages] = useState<string>();
    const [data, setData] = useState<AppoinmentModel[]>([]);
    const [waitingList, setWaitingList] = useState<WaitingModel[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [socket, setSocket] = useState<Client | null>(null);
    const [subscription, setSubscription] = useState<StompSubscription | null>(null);

    const fetchAtFirstDataWaitingList = async () => {
        try {
            const response = await getCurrentWaitingList();
            setData(response);
        } catch (error) {
            console.log(Error);
            throw error;
        }
    };

    const fetchAtFirstDatArrivalList = async () => {
        try {
            const response = await getCurrentArrivalList();
            setData(response);
        } catch (error) {
            console.log(Error);
            throw error;
        }
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: url, // Usa el WebSocket directamente
            connectHeaders: {},
            debug: str => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Conectado al servidor WebSocket');
            let sub;
            switch (destSocket) {
                case DestSocket.ARRIVAL:
                    fetchAtFirstDatArrivalList();
                    sub = client.subscribe('/topic/arrival', message => {
                        const messageContent = message.body;
                        console.log('MENSAJE DESDE arrival', messageContent);
                        setData(JSON.parse(messageContent));
                    });
                    break;

                case DestSocket.WAITING:
                    fetchAtFirstDataWaitingList();
                    sub = client.subscribe('/topic/waiting', message => {
                        const messageContent = message.body;
                        console.log('MENSAJE DESDE waiting');
                        setData(JSON.parse(messageContent));
                    });
                    break;

                case DestSocket.CONSULT:
                    sub = client.subscribe('/topic/consult', message => {
                        const messageContent = message.body;
                        console.log('MENSAJE DESDE consult');
                        setMessages(messageContent);
                    });
                    break;

                case DestSocket.ARRIVAL_CALL:
                    sub = client.subscribe('/topic/arrivalcall', message => {
                        const messageContent: AppoinmentModel = JSON.parse(message.body);
                        console.log('MENSAJE DESDE arrivalcall', messageContent);

                        setWaitingList(prev => {
                            const newEntry = {
                                name: messageContent.patientName.toUpperCase(),
                                place: messageContent.moduleName.toUpperCase(),
                            };

                            const updatedList = [newEntry, ...prev];
                            return updatedList.slice(0, 3); // Cortar SIEMPRE
                        });
                    });
                    break;

                case DestSocket.DELIVER:
                    sub = client.subscribe('/topic/deliver_results', message => {
                        const messageContent = message.body;
                        console.log('MENSAJE DESDE deliver_results', messageContent);
                        setMessages(messageContent);
                    });
                    break;

                default:
                    sub = client.subscribe('/topic/waiting', message => {
                        const messageContent = message.body;
                        console.log('MENSAJE DESDE WAITING');
                        setData(JSON.parse(messageContent));
                    });
                    break;
            }

            setSubscription(sub);
        };

        client.onDisconnect = () => {
            console.log('Desconectado del servidor WebSocket');
        };

        client.activate();
        setSocket(client);

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
            if (client.connected) {
                client.deactivate();
            }
        };
    }, []);

    const sendMessage = (message: string) => {
        if (socket && socket.connected && message) {
            switch (destSocket) {
                case DestSocket.ARRIVAL:
                    socket.publish({
                        destination: '/app/arrival',
                        body: message,
                    });
                    break;

                case DestSocket.WAITING:
                    socket.publish({
                        destination: '/app/waiting',
                        body: message,
                    });
                    break;

                case DestSocket.CONSULT:
                    socket.publish({
                        destination: '/app/consult',
                        body: message,
                    });
                    break;

                case DestSocket.ARRIVAL_CALL:
                    console.log('Enviando mensaje: ' + message);
                    socket.publish({
                        destination: '/app/arrivalcall',
                        body: message,
                    });
                    break;

                case DestSocket.DELIVER:
                    console.log('Enviando mensaje: ' + message);
                    socket.publish({
                        destination: '/app/deliver_results',
                        body: message,
                    });
                    break;

                default:
                    socket.publish({
                        destination: '/app/waiting',
                        body: message,
                    });
                    break;
            }
        }
    };

    return {
        messages,
        sendMessage,
        inputMessage,
        setInputMessage,
        data,
        waitingList,
    };
};

export default useSocket;
