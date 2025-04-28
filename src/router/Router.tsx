import { Route, Routes } from 'react-router';
import SendMessages from '../pages/SendMessages';
import ReceiveMessage from '../pages/ReceiveMessage';
import TakeTurn from '../pages/TakeTurn';
import Facturacion from '../pages/Facturacion';
import CallFacturacion from '../pages/CallFacturacion';
import CallDelivery from '../pages/CallDelivery';

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<TakeTurn />} />
            <Route path="/message" element={<SendMessages />} />
            <Route path="/receiver" element={<ReceiveMessage />} />
            <Route path="/tomar-turno" element={<TakeTurn />} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/call-facturacion" element={<CallFacturacion />} />
            <Route path="/call-delivery" element={<CallDelivery />} />
        </Routes>
    );
};


export default Router;
