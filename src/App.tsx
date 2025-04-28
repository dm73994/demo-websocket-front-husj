import { BrowserRouter } from 'react-router';
import Router from './router/Router';
import { CssBaseline } from '@mui/material';
import './index.css';

export interface Message {
    id: number;
    content: string;
}

const App = () => {
    return (
        <CssBaseline>
            <BrowserRouter>
            <img src="src\assets\img\logoHUSJ.png" alt="logo-husj" width={200} style={{
                position: 'absolute',
                top: 0,
                left: 0
            }}/>
                <Router />
                
            </BrowserRouter>
        </CssBaseline>
    );
};

export default App;
