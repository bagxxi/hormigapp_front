import React from 'react';
import './Loader.css';

export function Loader({ message = 'Cargando...' }) {
    return (
        <div className="loader-container">
            <div className="hormi-loader">
                {/* SVG de una alcancía o moneda que se llena */}
                <svg viewBox="0 0 100 100" className="loader-svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-light)" strokeWidth="5" />
                    <path
                        className="fill-path"
                        d="M50 95 A45 45 0 0 1 50 5"
                        fill="none"
                        stroke="var(--primary-blue)"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />
                    <text x="50" y="55" textAnchor="middle" className="loader-money-icon">$</text>
                </svg>
            </div>
            {message && <p className="loader-message">{message}</p>}
        </div>
    );
}
