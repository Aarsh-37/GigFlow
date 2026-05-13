import React from 'react';
import { FileText, Briefcase, Search } from 'lucide-react'; // Example icons for illustrations

// A simple illustrative component for empty states
const EmptyStateIllustration = ({ message, icon: Icon }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="p-4 rounded-full bg-slate-100 mb-6">
                {Icon ? <Icon size={48} className="text-slate-400" /> : <FileText size={48} className="text-slate-400" />}
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-3">{message}</h3>
            <p className="text-slate-500">
                Your recent activity will appear here once you start interacting with the platform.
            </p>
        </div>
    );
};

export default EmptyStateIllustration;
