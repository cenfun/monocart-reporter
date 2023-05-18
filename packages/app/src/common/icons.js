export default (context) => {
    const paths = context.keys();
    const icons = {};
    paths.forEach((path) => {
        const list = path.toLowerCase().split('/');
        const filename = list.pop();
        const iconName = filename.slice(0, -4);
        const dataUrl = context(path);
        const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
        const svg = atob(b64);
        icons[iconName] = svg;
    });
    // console.log(icons);
    return icons;
};
