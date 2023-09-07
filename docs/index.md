# Tiny Markdown Server

<form action="/search">
    <input type="text" name="q" />
    <input type="submit" value="Search" />
</form>

## Header 2

- [Subdir](subdir)
- [Subdir without postfix](subdir/index)
- [Subdir with full name](subdir/index.md)

### Header 3

- Math expression:
$$
1 \over \pi \tag*{Eq. 1.}
$$
- Inline math: $1 \over \pi$.

#### Header 4

```javascript
// This is javascript

import express from 'express';

const app = express();

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
```

```text
// This is text

import express from 'express';

const app = express();

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
```

##### Header 5

- Inline code: `ENTER`.

##### Header 6

| Table Caption |
| ------------- |

| Header 1 | Header 2 | Header 3 | Header 4 | Header 5 |
| -------- | -------- | -------- | -------- | -------- |
| Text 1   | Text 2   | Text 3   | Text 4   | Text 5   |
| Text 1   | Text 2   | Text 3   | Text 4   | Text 5   |
