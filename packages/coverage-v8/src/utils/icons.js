const context = require.context('../images/icons', true, /\.svg$/);
const paths = context.keys();
const icons = {};
paths.forEach((path) => {
    const list = path.toLowerCase().split('/');
    const filename = list.pop();
    const iconName = filename.slice(0, -4);
    const dataUrl = context(path);
    const header = 'data:image/svg+xml;base64,';
    const b64 = dataUrl.slice(header.length);
    const svg = atob(b64);
    icons[iconName] = svg;
});

// console.log(icons);

export default icons;
