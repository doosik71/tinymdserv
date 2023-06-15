import express from 'express';
import path from 'path';
import { marked } from 'marked';
import * as fs from 'node:fs';

///////////////
// Variables //
///////////////

const app = express();
const port = 80;
const __dirname = path.resolve();
const root_dir = __dirname;
const views_dir = root_dir + '/views';
const docs_dir = root_dir + '/docs';

app.set('views', views_dir);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/index.md');
});

app.get('*.md', doc_handler);

app.use(express.static(docs_dir))

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
        var doc = fs.readFileSync(docs_dir + req.url, 'utf8');
        var title = doc.match(/^# .*?(?=\r?\n)/);
        var content = marked(doc, {"mangle": false, headerIds: false});

        title = title ? title[0].substring(1).trim() : req.url;

        res.render('template.ejs', {"title": title, "content": content});
    } catch (error) {
        res.status(500).send('Internal error!');
    }
}