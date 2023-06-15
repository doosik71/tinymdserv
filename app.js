import express from 'express';
import path from 'path';
import { marked } from 'marked';
import * as fs from 'node:fs';

const app = express();
const port = 80;
const __dirname = path.resolve();
const root_dir = __dirname;
const views_dir = root_dir + '/views';
const docs_dir = root_dir + '/docs';
const public_dir = root_dir + '/public';

app.set('views', views_dir);
app.set('view engine', 'ejs');

app.use(express.static(public_dir))

app.get('/', (req, res) => {
    res.render('home.ejs', {title:'EJS : EXPRESS TEMPLATE ENGINE'});
});

app.get(['/docs/:filename', '/docs/:category/:filename'], doc_handler);

app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});

function doc_handler(req, res) {

    var md = function (url) {
       var filepath = docs_dir + "/" + url;
       var content = fs.readFileSync(filepath, 'utf8');
       var html = marked(content, {"mangle": false, headerIds: false});
       return html;
    };
 
    if (req.params.category)
        var docpath = req.params.category + '/' + req.params.filename;
    else
        var docpath = req.params.filename;

    res.render('docs.ejs', {"md": md,
                            "docpath": docpath,
                            mangle:false});
 }
 