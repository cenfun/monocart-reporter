import inflate from 'lz-utils/inflate';
const compressed = '{compressed_placeholder}';
inflate(compressed).then((res) => {
    const script = document.createElement('script');
    script.innerHTML = res;
    document.body.appendChild(script);
});
