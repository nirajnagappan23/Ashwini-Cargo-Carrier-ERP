
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length);
            if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [images.length, onClose]);

    if (!images || images.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999, // High z-index to cover everything
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 10000
                }}
            >
                <X size={24} />
            </button>

            {/* Navigation Left */}
            <button
                onClick={handlePrev}
                style={{
                    position: 'absolute',
                    left: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 10000 // Ensure clickable
                }}
            >
                <ChevronLeft size={32} />
            </button>

            {/* Main Image */}
            <div style={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <img
                    src={images[currentIndex].url}
                    alt="Lightbox View"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '500'
                }}>
                    {images[currentIndex].type} ({currentIndex + 1} / {images.length})
                </div>
            </div>

            {/* Navigation Right */}
            <button
                onClick={handleNext}
                style={{
                    position: 'absolute',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 10000 // Ensure clickable
                }}
            >
                <ChevronRight size={32} />
            </button>

        </div>
    );
};

export default ImageLightbox;
