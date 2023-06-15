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

///////////////////////
// Handler functions //
///////////////////////

function doc_handler(req, res) {
    var md = function(url) {
       var content = fs.readFileSync(docs_dir + url, 'utf8');
       var html = marked(content, {"mangle": false, headerIds: false});
       return html;
    };
 
    var title = get_title(req.url);
    console.log(title);

    res.render('template.ejs', {"md": md, "title": title, "docpath": req.url});
 }
 
 function get_title(url) {
    var content = fs.readFileSync(docs_dir + url, 'utf8');
    var metadata = get_metadata(content);

    return metadata["title"];
 }

 function get_metadata(markdown) {
    const metadataRegex = /^---([\s\S]*?)---/;
    const metadataMatch = markdown.match(metadataRegex);
  
    if (!metadataMatch) {
      return {};
    }

    const metadataLines = metadataMatch[1].split("\n");
  
    const metadata = metadataLines.reduce((acc, line) => {
      const [key, value] = line.split(":").map(part => part.trim());
      if (key)
        acc[key] = value;
      return acc;
    }, {});
  
    return metadata;
}