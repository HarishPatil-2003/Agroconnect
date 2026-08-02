import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

/* ── Toast Store (simple event-based) ───────────────────────── */
const listeners = [];
let toastId = 0;

export const toast = {
  _emit(type, message, options = {}) {
    const t = { id: ++toastId, type, message, duration: 3500, ...options };
    listeners.forEach(fn => fn('add', t));
  },
  success: (msg, opts) => toast._emit('success', msg, opts),
  error:   (msg, opts) => toast._emit('error',   msg, opts),
  warning: (msg, opts) => toast._emit('warning', msg, opts),
  info:    (msg, opts) => toast._emit('info',    msg, opts),
};

/* ── Individual Toast Item ───────────────────────────────────── */
const ToastItem = ({ id, type, message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const iconMap = {
    success: <CheckCircle size={18} />,
    error:   <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info:    <Info size={18} />,
  };

  return (
    <div className={`ds-toast ds-toast--${type}`} role="alert">
      <span className="ds-toast__icon">{iconMap[type] || iconMap.info}</span>
      <span className="ds-toast__message">{message}</span>
      <button className="ds-toast__close" onClick={() => onRemove(id)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
};

/* ── Toast Container (mount once in App.js) ──────────────────── */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const handleRemove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const listener = (action, toastData) => {
      if (action === 'add') {
        setToasts(prev => [...prev.slice(-4), toastData]); // max 5
      }
    };
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="ds-toast-container" aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onRemove={handleRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
