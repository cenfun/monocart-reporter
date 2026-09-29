const fs = require('node:fs');
const path = require('node:path');

// esbuild's metafile lists the actual files in the bundle (including nested
// node_modules), unlike package.json's list of direct dependencies.
function generateVendorLicense(metafile, rootDir, outputPath) {
    const packages = new Map();
    for (const input of Object.keys(metafile.inputs)) {
        let dir = path.dirname(path.resolve(rootDir, input));
        while (dir !== rootDir && dir !== path.dirname(dir)) {
            const manifestPath = path.join(dir, 'package.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                // Some packages have nested package.json files containing only
                // { "type": "module" }; these are not separate packages.
                if (manifest.name && dir.split(path.sep).includes('node_modules')) {
                    packages.set(dir, manifest);
                    break;
                }
            }
            dir = path.dirname(dir);
        }
    }

    const entries = [... packages].map(([dir, manifest]) => ({
        dir,
        manifest,
        id: `${manifest.name}@${manifest.version}`,
        files: fs.readdirSync(dir).filter((name) => (/^(?:licen[cs]e|copying|notice)(?:[._-].*)?$/i).test(name) && fs.statSync(path.join(dir, name)).isFile()).sort()
    })).filter(({ files }) => files.length).sort((a, b) => a.id.localeCompare(b.id) || a.dir.localeCompare(b.dir));

    const notices = entries.map(({
        dir, files, id
    }) => {
        const text = files.map((file) => fs.readFileSync(path.join(dir, file), 'utf8').trim()).join('\n\n');
        return `%% ${id} NOTICES AND INFORMATION BEGIN HERE\n=========================================\n${text}\n=========================================\nEND OF ${id} NOTICES AND INFORMATION`;
    });

    const list = entries.map(({ manifest, id }) => {
        const repository = typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url;
        const url = repository?.replace(/^git\+/, '')
            .replace(/^git:\/\//, 'https://')
            .replace(/^git@github\.com:/, 'https://github.com/')
            .replace(/^(?!\w+:\/\/)([\w.-]+\/[\w.-]+)$/, 'https://github.com/$1')
            .replace(/\.git$/, '');
        return `- ${id}${url ? ` (${url})` : ''}`;
    });
    fs.writeFileSync(outputPath, [
        path.relative(rootDir, outputPath).replace(/\\/g, '/'),
        '',
        'THIRD-PARTY SOFTWARE NOTICES AND INFORMATION',
        '',
        'The following inlined npm packages have license or notice files included below.',
        '',
        ... list,
        '',
        ... notices,
        ''
    ].join('\n'));
}

module.exports = {
    generateVendorLicense
};
