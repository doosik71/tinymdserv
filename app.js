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

app.use(express.static(docs_path))

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

app.get('*', (req, res) => {
    res.status(404).send('404 Not Found!');
});
  
///////////////////////
// Handler functions //
///////////////////////

function doc_handler(req, res) {
    try {
        var doc = fs.readFileSync(docs_path + req.url, 'utf8');
        // Get first caption starting with '#'.
        var title = doc.match(/^# .*?(?=\r?\n)/);
        var content = marked(doc, {"mangle": false, headerIds: false});

        title = title ? title[0].substring(1).trim() : req.url;

        res.render('template.ejs', {"title": title, "content": content});
    } catch (error) {
        res.status(500).send('Internal error!');
    }
}