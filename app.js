#!/usr/bin/env node

import express from 'express';
import os from 'os';
import path from 'path';
import { marked } from 'marked';
import * as fs from 'node:fs';
import mermaidAPI from 'mermaid';

//////////////////////
// Global variables //
//////////////////////

let docs_path;

///////////////////
// Main function //
///////////////////

function main() {
    const app = express();

    // Get port number from command line arguments.
    let argnum = parseInt(process.argv.slice(2)[0]);
    const port = isNaN(argnum) ? 80 : argnum;

    // Set root path and docs path.
    docs_path = process.argv.slice(3)[0];
    if (docs_path == undefined) {
        docs_path = path.resolve() + '/docs';
    }

    app.set('views', docs_path);
    app.set('view engine', 'ejs');

    app.get('/', (req, res) => {
        res.redirect('/index.md');
    });

    app.get('*.md', doc_handler);

    app.get('*.__datetime__', datetime_handler);

    app.get('/search', search_handler);

    app.get('*.mp4', mp4_handler);

    app.use(express.static(docs_path))

    app.get('*', default_handler);

    app.listen(port, () => {
        const address = 'http://' + get_ip_address() + (port == 80 ? '' : `:${port}`) + '/';
        console.log(`Server started on ${address} with docs_path=${docs_path}`);
    });
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

        console.log(`${(new Date()).toLocaleString('en-US', datetime_option)}, ${req.socket.remoteAddress}, ${req_url}`);

        let doc = fs.readFileSync(docs_path + file_path, 'utf8');
        let title = doc.match(/^# .*?(?=\r?\n)/);
        title = title ? title[0].substring(1).trim() : file_path;

        marked.use({
            renderer: {
                code(code, infostring) {
                    const lang = (infostring || '').match(/\S*/)[0];
                    if (lang === 'mermaid')
                        return `<div class="text-center"><div class="mermaid">${code}</div></div>`;
                    else
                        return `<pre><code>${escapeHtml(code)}</code></pre>`;
                }
            }
        });

        let content = marked(doc, { "mangle": false, headerIds: false });

        let dict_params = {};
        params.forEach((value, key) => {
            dict_params[key] = value;
        });

        res.render('template.ejs',
            {
                "title": title,
                "content": content,
                "page": page,
                "params": dict_params
            });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal error!');
    }
}

function escapeHtml(html) {
    return html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
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
