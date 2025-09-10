import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Container #root không tồn tại');

const root = createRoot(container);

// Component Error Boundary để xử lý lỗi
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() { return this.state.hasError ? <h1>Lỗi xảy ra. <button onClick={() => window.location.reload()}>Tải lại</button></h1> : this.props.children; }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);