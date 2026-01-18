import React, { useEffect, useState } from 'react';
import Layout from '@theme-original/DocItem/Layout';
import ExportPdfButton from '@site/src/components/ExportPdfButton';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ReactDOM from 'react-dom';

export default function LayoutWrapper(props) {
    const { siteConfig } = useDocusaurusContext();
    const faviconUrl = useBaseUrl(siteConfig.favicon);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const PrintHeader = (
        <div className="print-header">
            <div className="print-header-content">
                <img src={faviconUrl} alt="Logo" className="print-logo" />
                <span className="print-title">{siteConfig.title}</span>
            </div>
        </div>
    );

    const PrintFooter = (
        <div className="print-footer">
            <img src={faviconUrl} alt="Logo" className="print-footer-logo" />
            <div className="print-footer-text">
                <span>© {new Date().getFullYear()} {siteConfig.title} | Confidencial - Uso Interno</span>
            </div>
            <div style={{ width: '25px' }}></div> {/* Spacer for centering */}
        </div>
    );

    return (
        <>
            {PrintHeader}
            <Layout {...props} />

            {mounted && ReactDOM.createPortal(
                PrintFooter,
                document.body
            )}

            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <ExportPdfButton />
            </div>
        </>
    );
}
