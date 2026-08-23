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

export const initMermaid = () => {
    if (!state.mermaidLoaded) {
        return;
    }

    const mermaidOptions = state.mermaid;
    const mermaidConfig = {
        theme: state.theme === 'dark' ? 'dark' : 'default',
        ... mermaidOptions?.config
    };
    window.mermaid.initialize(mermaidConfig);

    renderMermaid();

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
    // console.log(config);

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.onload = () => {
        state.mermaidLoaded = true;
        initMermaid();
    };
    document.body.appendChild(script);
};

