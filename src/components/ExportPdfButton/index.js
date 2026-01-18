import React from 'react';
import styles from './styles.module.css';

export default function ExportPdfButton() {
    const handleExport = () => {
        window.print();
    };

    return (
        <button
            className={`button button--primary ${styles.exportButton}`}
            onClick={handleExport}
            type="button"
        >
            Exportar PDF
        </button>
    );
}
