import state from './state.js';


export const renderMermaid = async () => {
    if (!state.mermaidLoaded) {
        return;
    }
    // console.log('renderMermaid');
    if (window.mermaid) {
        await window.mermaid.run();
    }
};

export const loadMermaid = () => {
    // console.log('loadMermaid');

    if (state.mermaidLoaded) {
        return renderMermaid();
    }

    const mermaidOptions = state.mermaid;
    if (!mermaidOptions) {
        return;
    }

    const scriptSrc = mermaidOptions.scriptSrc;
    if (!scriptSrc) {
        return;
    }

    const config = {
        ... mermaidOptions.config
    };
    // console.log(config);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.onload = () => {
        window.mermaid.initialize(config);
        state.mermaidLoaded = true;
        renderMermaid();
    };
    document.body.appendChild(script);
};
