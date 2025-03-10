import { BrowserRouter } from 'react-router';
import Router from './router/Router';

export interface Message {
    id: number;
    content: string;
}

const App = () => {
    return (
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    );
};

export default App;
