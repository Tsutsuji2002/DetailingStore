import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './app/store';
import AppRouter from './routes/AppRouter';
import { GOOGLE_CLIENT_ID } from './config/googleAuth';
import './styles/global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppRouter />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
