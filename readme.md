# TinyMDServ

## Install

```
npm install -g tinymdserv
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
tinymdserv 80
```
