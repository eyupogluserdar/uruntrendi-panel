import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import { Activity } from 'lucide-react';

export const PresenceIndicator: React.FC<{ currentProfile: UserProfile | null }> = ({ currentProfile }) => {
    const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        if (!supabase || !currentProfile) return;

        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: currentProfile.id,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users: UserProfile[] = [];

                Object.values(state).forEach((presence: any) => {
                    if (presence && presence[0]) {
                        users.push(presence[0]);
                    }
                });
                setOnlineUsers(users);
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                console.log('User joined:', newPresences);
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                console.log('User left:', leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        id: currentProfile.id,
                        full_name: currentProfile.full_name,
                        role: currentProfile.role,
                        is_online: true,
                        last_seen: new Date().toISOString()
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [currentProfile]);

    if (!onlineUsers.length) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '700' }}>
                <Activity size={14} className="pulse-slow" />
                <span>{onlineUsers.length} Aktif</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                {onlineUsers.map((user, idx) => (
                    <div
                        key={user.id}
                        title={`${user.full_name} (${user.role})`}
                        style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: user.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            border: '2px solid #020617', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: '800',
                            marginLeft: idx === 0 ? 0 : '-12px',
                            cursor: 'help', transition: 'transform 0.2s',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                    >
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                ))}
            </div>

            <style>{`
                .pulse-slow {
                    animation: softPulseSlow 2s infinite ease-in-out;
                }
                @keyframes softPulseSlow {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
