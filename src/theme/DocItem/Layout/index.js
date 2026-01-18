import React, { useEffect, useState } from 'react';
import Layout from '@theme-original/DocItem/Layout';
// @ts-ignore
import ExportPdfButton from '@site/src/components/ExportPdfButton';
// @ts-ignore
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// @ts-ignore
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

            {/* We inject the button but we might want it inside the layout content. 
          If we just append it here, it might be outside the main container. 
          Let's see where it lands. 
          Usually 'Layout' of DocItem includes the sidebar and the main content.
          If we want it INSIDE the content, this might be tricky with just wrapping Layout.
          However, for a floating action or fixed button, this is fine.
          
          But the plan said "Inject it into the content flow".
          Let's try to pass it as children if Layout supports it? Unlikely.
          
          Actually, checking Docusaurus architecture, DocItem/Layout is the whole page wrapper for a Doc.
          If I want it generally available, creating a portal or fixed position is easiest.
          Or, I can try to use Swizzling on `DocItem/Content` instead if I want it IN the content.
          
          However, let's stick to Layout for now and position it with CSS or just append it.
          Let's wrap it in a div that positions it if needed. 
          Actually, I can put it *above* the layout or *below*. 
          
          Wait, if I want it *in* the page content, maybe `DocItem/Paginator` or `DocItem/Footer` is better?
          Or `DocItem/Content` wrapper. 
          
          Let's stick to the plan: Wrap Layout. I'll put it at the bottom for now or top?
          Actually, the user asked for "only in pages of documentation". This wrapper ensures that.
          
          Let's instantiate it.
       */}
            {/* 
         Pro-tip: The Layout component renders the Sidebar and the Content. 
         If I render my button alongside Layout, it might respect z-index and fixed positioning. 
         But if I want it to be part of the flow (e.g. top of the page), I might need to swizzle something deeper like DocItem/Content.
         
         BUT, if I just want a button that triggers print, fixed position is safest. 
         However, the user might want it to be part of the "UI" of the doc.
         
         Let's stick to a fixed/floating button for now as it's less intrusive on the DOM structure.
         Or I can try to use a Portal.
         
         Actually, let's look at `ExportPdfButton` styles I created.
         I didn't specify position in CSS yet (`margin-bottom: 1rem`). This implies flow.
         If I wrap Layout:
         
         <Layout {...props} />
         <ExportPdfButton />
         
         It will appear below the whole doc layout (footer etc).
         
         Let's try to wrap `DocItem/Content` instead? 
         The file path in plan was `src/theme/DocItem/Layout/index.tsx`.
         Let's stick to that but maybe I should have chosen `DocItem/Content`.
         
         Let's proceed with `DocItem/Layout` but I will position the button using a Portal or just Fixed positioning in CSS if I want it floating. 
         
         Re-reading my plan: "Place it floating top-right... Or inject it into the content flow."
         Let's try to inject it *before* the Layout content? No, Layout *is* the container.
         
         Let's try to wrap `Layout` and use a React Portal to inject into `.theme-doc-markdown` if possible? No that's messy.
         
         Let's simply render it. If it's at the bottom of the page, it's fine for a start.
         I'll add a style to make it fixed bottom-right or similar?
         
         Actually, let's modify the component to be fixed positioned in the bottom right corner for easy access.
         Or top right.
         
         Wait, better idea: Swizzle `DocItem/Content` (creating `src/theme/DocItem/Content/index.tsx`) is safer for "in content" placement.
         But the plan said `Layout`. I'll stick to `Layout` but I'll update the CSS of the button to be fixed if it looks bad.
         
         Actually, let's inspect what `Layout` does. It usually has the sidebar.
         If I put my button *inside* the Layout wrapper, but before `Layout`? 
         It might mess up the sidebar layout if `Layout` expects to be the root.
         
         Let's look at standard Docusaurus 3 structure (assuming v3 or v2).
         
         I will write the file now.
       */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                <ExportPdfButton />
            </div>
        </>
    );
}
