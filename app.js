#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { marked } from 'marked';
import * as fs from 'node:fs';

///////////////
// Variables //
///////////////

const app = express();

// Get port number from command line arguments.
var argnum = parseInt(process.argv.slice(2)[0]);
const port = isNaN(argnum) ? 80 : argnum;

// Set root path and docs path.
const root_path = path.resolve();
const docs_path = root_path + '/docs';

app.set('views', docs_path);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/index.md');
});

app.get('*.md', doc_handler);

app.get('*.mp4', mp4_handler);

app.use(express.static(docs_path))

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

app.get('*', (req, res) => {
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
});

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
        console.log(`${(new Date()).toLocaleString('en-US', datetime_option)}, ${req.socket.remoteAddress}, ${req_url}`);

        var doc = fs.readFileSync(docs_path + req_url, 'utf8');
        var title = doc.match(/^# .*?(?=\r?\n)/);
        title = title ? title[0].substring(1).trim() : req_url;
        var content = marked(doc, { "mangle": false, headerIds: false });
        res.render('template.ejs', { "title": title, "content": content });
    } catch (error) {
        res.status(500).send('Internal error!');
    }
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
            var end_pos = parseInt(end);
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
        res.status(500).send(`Internal error!: ${error}.`);
    }
}