#!/usr/bin/env node

import express from 'express';
import os from 'os';
import path from 'path';
import https from 'https';
import http from 'http';
import { marked } from 'marked';
import * as fs from 'node:fs';
import yargs from 'yargs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('./package.json');

//////////////////////
// Global variables //
//////////////////////

let docs_path;
let quiet = false;

///////////////////
// Main function //
///////////////////

function main() {
    // SSL certificate file path.
    const key_path = 'server.key';
    const cert_path = 'server.crt';

    // Check if SSL files exist
    const use_https = fs.existsSync(key_path) && fs.existsSync(cert_path);

    const argv = yargs(process.argv.slice(2))
        .option('port', {
            alias: 'p',
            type: 'number',
            description: 'Set port number',
            default: (use_https ? 443 : 80),
        })
        .option('dir', {
            alias: 'd',
            type: 'string',
            description: 'Set document path',
            default: './docs',
        })
        .option('file', {
            alias: 'f',
            type: 'string',
            description: 'Set document default name',
            default: 'index.md',
        })
        .option('quiet', {
            alias: 'q',
            type: 'boolean',
            description: 'Activate quiet mode',
        })
        .help()
        .argv;

    if (yargs.version) {
        console.log(`Version: ${version}`);
        return;
    }

    const app = express();

    // Set docs path and quiet mode.
    docs_path = path.resolve(argv.dir);
    quiet = argv.quiet;

    if (!argv.quiet) {
        console.log('Version:', version);
        console.log('Port number:', argv.port);
        console.log('Directory:', docs_path);
        console.log('Default name:', argv.file);
    }

    app.set('views', docs_path);
    app.set('view engine', 'ejs');

    app.get('/', (req, res) => {
        res.redirect(`/${argv.file}`);
    });

    app.get('/search', search_handler);

    app.use((req, res, next) => {
        if (req.path.endsWith('.md')) {
            doc_handler(req, res);
        } else if (req.path.endsWith('.__datetime__')) {
            datetime_handler(req, res);
        } else if (req.path.endsWith('.mp4')) {
            mp4_handler(req, res);
        } else {
            next();
        }
    });

    app.use(express.static(docs_path))

    app.use((req, res, next) => {
        default_handler(req, res);
    });

    // Start server
    if (use_https) {
        // HTTPS server
        https.createServer({
            key: fs.readFileSync(key_path),
            cert: fs.readFileSync(cert_path)
        }, app).listen(argv.port, () => {
            const address = 'https://' + get_ip_address() + (argv.port == 443 ? '' : `:${argv.port}`) + '/';
            if (!argv.quiet)
                console.log(`HTTPS Server started on ${address}`);
        });
    } else {
        // HTTP server
        http.createServer(app).listen(argv.port, () => {
            const address = 'http://' + get_ip_address() + (argv.port == 80 ? '' : `:${argv.port}`) + '/';
            if (!argv.quiet)
                console.log(`HTTP Server started on ${address}`);
        });
    }
};

main();

///////////////////////
// Handler functions //
///////////////////////

const datetime_option = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
};

function doc_handler(req, res) {
    try {
        const req_url = decodeURIComponent(req.url);
        const params = new URL('http://127.0.0.1' + req_url).searchParams;
        const page = params.get('page');
        const file_path = req_url.split('?')[0];

        if (!quiet)
            console.log(`${(new Date()).toLocaleString('en-US', datetime_option)}, ${req.socket.remoteAddress}, ${req_url}`);

        let doc = fs.readFileSync(docs_path + file_path, 'utf8');
        let title = doc.match(/^# .*?(?=\r?\n)/);
        title = title ? title[0].substring(1).trim() : file_path;

        // 페이지 파라메터가 있으면 문서를 페이지로 나눈다
        if (page !== null) {
            const pages = doc.split('\n---\n');
            const pageIndex = parseInt(page);

            if (pageIndex >= 0 && pageIndex < pages.length) {
                doc = pages[pageIndex];
                // 페이지별 타이틀 추출 (각 페이지의 첫 번째 헤더 사용)
                const pageTitle = doc.match(/^# .*?(?=\r?\n)/);
                if (pageTitle) {
                    title = pageTitle[0].substring(1).trim();
                }
            } else {
                // 유효하지 않은 페이지 인덱스인 경우 404 에러
                res.status(404).send('Page not found!');
                return;
            }
        }

        doc = doc
            .replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => `<pre><code="latex_math_2">${inner}</code></pre>`)
            .replace(/\$([^\n\r$]+?)\$/g, (_, inner) => `<pre><code="latex_math_1">${inner}</code></pre>`);

        marked.use({
            renderer: {
                code({ text, lang, escaped }) {
                    if (lang === 'mermaid')
                        return `<div class="text-center"><pre class="mermaid">${text}</pre></div>`;
                    else
                        return `<pre><code class="${lang}">${text}</code></pre>`;
                }
            }
        });

        doc = marked(doc, { "mangle": false, headerIds: false });

        doc = doc
            .replace(/<pre><code="latex_math_1">([^\n\r$]+?)<\/code><\/pre>/g, (_, inner) => `$${inner}$`)
            .replace(/<pre><code="latex_math_2">([\s\S]+?)<\/code><\/pre>/g, (_, inner) => `$$${inner}$$`)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        let dict_params = {};
        params.forEach((value, key) => {
            dict_params[key] = value;
        });

        res.render('template.ejs',
            {
                "title": title,
                "content": doc,
                "page": page,
                "params": dict_params
            });
    } catch (error) {
        if (!quiet)
            console.log(error);
        res.status(500).send('Internal error!');
    }
}

function datetime_handler(req, res) {
    try {
        const req_url = decodeURIComponent(req.url);
        const file_path = req_url.substring(0, req_url.length - '.__datetime__'.length);

        fs.stat(docs_path + file_path, function (err, stats) {
            if (err) {
                res.status(400).send('Bad request!');
            } else {
                res.send(stats.mtime.toLocaleString());
            }
        });
    } catch (error) {
        if (!quiet)
            console.log(error);
        res.status(500).send('Internal error!');
    }
}

function search_handler(req, res) {
    try {
        const req_url = decodeURIComponent(req.url);
        const query = new URL('http://127.0.0.1' + req_url).searchParams.get('q');
        let file_list = (query == null) ? [] : search_files(docs_path, query);

        res.render('search.ejs', { "title": query, "content": file_list });
    } catch (error) {
        if (!quiet)
            console.log(error);
        res.status(500).send('Internal error!');
    }
}

function search_files(directory, query) {
    const files_matching = [];
    const prefix_length = directory.length;
    const search_string = query.toLowerCase()

    function search(directory) {
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const file_path = path.join(directory, file);

            if (fs.statSync(file_path).isDirectory()) {
                search(file_path);
            } else {
                const extension = path.extname(file_path).toLowerCase();

                if (extension !== '.md' && extension !== '.html')
                    continue;

                const content = fs.readFileSync(file_path, 'utf8').toLowerCase();
                if (!content.includes(search_string))
                    continue;

                files_matching.push(file_path.substring(prefix_length).replace(/\\/g, '/'));
            }
        }
    }

    search(directory);

    return files_matching;
}

function mp4_handler(req, res) {
    try {
        const req_url = decodeURIComponent(req.url);
        if (!quiet)
            console.log(`${(new Date()).toLocaleString('en-US', datetime_option)}, ${req.socket.remoteAddress}, ${req_url}`);

        const video_path = docs_path + req_url;
        const video_size = fs.statSync(video_path).size;
        const range = req.headers.range;
        const CHUNK_SIZE = 10 ** 6;  // 1MB

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'inline');

        if (range) {
            const [start, end] = range.replace(/bytes=/, '').split('-');
            const start_pos = parseInt(start);
            let end_pos = parseInt(end);
            end_pos = isNaN(end_pos) ? video_size - 1 : end_pos;
            const content_length = end_pos - start_pos + 1;

            res.status(206).header({
                'Content-Range': `bytes ${start_pos}-${end_pos}/${video_size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': content_length,
            });

            const video_stream = fs.createReadStream(video_path, { start: start_pos, end: end_pos });
            video_stream.pipe(res);
        } else {
            res.status(200).header({
                'Content-Length': video_size,
            });

            const video_stream = fs.createReadStream(video_path, { highWaterMark: CHUNK_SIZE });
            video_stream.pipe(res);
        }
    } catch (error) {
        if (!quiet)
            console.log(error);
        res.status(500).send(`Internal error!: ${error}.`);
    }
}

function default_handler(req, res) {
    const req_url = decodeURIComponent(req.url);
    const postfix = [".md", "index.md", "/index.md"]

    for (let i = 0; i < postfix.length; i++) {
        try {
            fs.accessSync(docs_path + req_url + postfix[i], fs.constants.F_OK);
            res.redirect(req_url + postfix[i]);
            return;
        } catch (error) {
        }
    }

    res.status(404).send('404 Not Found!');
}

function get_ip_address() {
    const networkInterfaces = os.networkInterfaces();
    const ipAddresses = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (!iface.internal && iface.family === 'IPv4') {
                ipAddresses.push(iface.address);
            }
        }
    });

    return ipAddresses.length >= 1 ? ipAddresses[0] : '127.0.0.1';
}
