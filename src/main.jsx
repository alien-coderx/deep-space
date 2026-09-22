import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#58a6ff',
          borderRadius: 10,
          fontFamily: `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif`
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);