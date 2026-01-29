import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

export default function StatCard({ label, value, icon, trend, trendUp }: StatCardProps) {
    return (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                <h3 className="text-3xl font-bold tracking-tight gradient-text">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </p>
                )}
            </div>
        </div>
    );
}
