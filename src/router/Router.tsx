import { Route, Routes } from 'react-router';
import SendMessages from '../pages/SendMessages';
import ReceiveMessage from '../pages/ReceiveMessage';

const Router = () => {
    return (
        <Routes>
            <Route path="/*" element={<SendMessages />} />
            <Route path="/message" element={<SendMessages />} />
            <Route path="/receiver" element={<ReceiveMessage />} />
        </Routes>
    );
};

export default Router;
