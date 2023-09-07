# TinyMDServ

## Install

```bash
npm install -g tinymdserv
```

## Edit

- Create home page docs/index.md

```markdown
# Home

Hello
```

- Create template docs/template.ejs

```html
<html>
<head>
<meta charset="utf-8" />
<meta lang="en" />
<title>
<%=title %>
</title>
</head>
<body>
<%-content %>
</body>
</html>
```

- Create template docs/search.ejs

```html
<html>
<head>
<meta charset="utf-8" />
<meta lang="en" />
<title>
<%=title %>
</title>
</head>
<body>
<ul>
<% content.forEach(path => { %><li><a href='<%-path %>'><%-path %></a></li>
<% }) %></ul>
</body>
</html>
```

## Run

```bash
tinymdserv [<port_number>] [<docs_full_path>]
```

- Default port number is 80.
- Default document path is docs under current path.

### Example

```bash
tinymdserv 80
```

```bash
tinymdserv 80 C:\docs
```
