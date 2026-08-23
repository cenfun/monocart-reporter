export default (context) => {
    const paths = typeof context.keys === 'function' ? context.keys() : Object.keys(context);
    const icons = {};
    paths.forEach((path) => {
        const list = path.toLowerCase().split('/');
        const filename = list.pop();
        const iconName = filename.slice(0, -4);
        const content = typeof context === 'function' ? context(path) : context[path];
        if (content.startsWith('data:')) {
            const b64 = content.slice(content.indexOf(',') + 1);
            icons[iconName] = atob(b64);
            return;
        }
        icons[iconName] = content;
    });
    return icons;
};
