import React from 'react';

export function AuditTrailSection({ audits }: { audits: any[] }) {
    return (
        <div className="p-6">
            <h2 className="text-lg font-bold text-red-800 mb-4 tracking-tight">Journal d'Audit Trail</h2>
            <div className="overflow-x-auto border border-red-100 rounded-2xl">
                <table className="w-full text-[11px] text-left">
                    <thead className="bg-red-50/50 text-red-900 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 border-b border-red-100">Date & Heure</th>
                            <th className="px-6 py-4 border-b border-red-100">Auteur</th>
                            <th className="px-6 py-4 border-b border-red-100">Action</th>
                            <th className="px-6 py-4 border-b border-red-100">Module</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                        {audits.map((audit: any) => (
                            <tr key={audit.id} className="hover:bg-red-50/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-500">{new Date(audit.created_at).toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold">{audit.user?.name || 'Système'}</td>
                                <td className="px-6 py-4 text-blue-600 font-black">{audit.event.toUpperCase()}</td>
                                <td className="px-6 py-4 text-gray-400 italic">{audit.auditable_type.split('\\').pop()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}