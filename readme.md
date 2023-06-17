# PaperBook

## Install

1. Install node
2. Install required package

```
npm install ejs express marked
```

## Edit

1. Create home page docs/index.md

```
# Home

Hello
```

2. Create template docs/template.ejs

```
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

## Run

```
node app.js 80
```
