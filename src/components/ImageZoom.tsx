import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageZoomProps {
    src: string;
    alt: string;
    onClose: () => void;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, onClose }) => {
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 1));

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'auto'
        }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 2001 }}>
                <button onClick={handleZoomIn} className="btn" style={{ background: 'rgba(255,255,255,0.1)', padding: '12px' }}><ZoomIn size={24} /></button>
                <button onClick={handleZoomOut} className="btn" style={{ background: 'rgba(255,255,255,0.1)', padding: '12px' }}><ZoomOut size={24} /></button>
                <button onClick={onClose} className="btn" style={{ background: 'var(--danger)', padding: '12px' }}><X size={24} /></button>
            </div>

            <div
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '20px'
                }}
                onMouseDown={handleMouseDown}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        maxWidth: '95vw',
                        maxHeight: '85vh',
                        borderRadius: '12px',
                        userSelect: 'none',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        objectFit: 'contain'
                    }}
                />
            </div>

            <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                {scale > 1 ? 'Sürükleyerek inceleyebilirsiniz' : 'Resmi büyütmek için butonları kullanın'}
            </div>
        </div>
    );
};
