import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-success" />,
        error: <AlertCircle size={20} className="text-error" />,
        warning: <AlertTriangle size={20} className="text-warning" />,
        info: <Info size={20} className="text-primary" />,
    };

    const styles = {
        success: 'bg-white border-l-4 border-l-success text-slate-800',
        error: 'bg-white border-l-4 border-l-error text-slate-800',
        warning: 'bg-white border-l-4 border-l-warning text-slate-800',
        info: 'bg-white border-l-4 border-l-primary text-slate-800',
    };

    return (
        <div className={`flex items-start gap-3 min-w-[320px] max-w-md p-4 rounded shadow-lg border border-slate-100 ${styles[type]} animate-in slide-in-from-right-full duration-300`}>
            <div className="mt-0.5 shrink-0">{icons[type]}</div>
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
