const fs = require('fs');
const path = require('path');
const https = require('https');
const yauzl = require('yauzl');

const owner = 'aerotechnologiesstore';
const repo = 'aerotechnologiesstore.github.io';
const runFile = 'run.json';

if (!fs.existsSync(runFile)) {
    console.error('run.json not found');
    process.exit(1);
}

const runId = JSON.parse(fs.readFileSync(runFile, 'utf8')).id;

const options = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
    headers: {
        'User-Agent': 'Node.js'
    }
};

https.get(options, (res) => {
    if (res.statusCode === 302) {
        https.get(res.headers.location, (res2) => {
            const zipPath = path.join(__dirname, 'logs.zip');
            const file = fs.createWriteStream(zipPath);
            res2.pipe(file);
            file.on('finish', () => {
                file.close();
                yauzl.open(zipPath, {lazyEntries: true}, (err, zipfile) => {
                    if (err) throw err;
                    zipfile.readEntry();
                    zipfile.on('entry', (entry) => {
                        if (entry.fileName.includes('Build with Next.js')) {
                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) throw err;
                                let data = '';
                                readStream.on('data', chunk => data += chunk.toString('utf8'));
                                readStream.on('end', () => {
                                    const lines = data.split('\n');
                                    console.log(lines.slice(-60).join('\n'));
                                });
                            });
                        } else {
                            zipfile.readEntry();
                        }
                    });
                });
            });
        });
    }
});
