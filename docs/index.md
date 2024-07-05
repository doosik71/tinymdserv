# Tiny Markdown Server

<form action="/search">
    <input type="text" name="q" />
    <input type="submit" value="Search" />
</form>

## Header 2

### Header 3

#### Header 4

##### Header 5

##### Header 6

## Text

- This is *emphasis*, **bold**, ***emphasis with bold***.
- This is _emphasis_, __bold__, ___emphasis with bold___.

## Links

- [Subdir](subdir)
- [Subdir without postfix](subdir/index)
- [Subdir with full name](subdir/index.md)

## Mathjax

- Math expression:

$$
1 \over \pi \tag{1}
$$

$$
x_i + y_j = a_i + b_j
$$

- Inline math: $1 \over 2$.

## Code Block

- Code

```javascript
import express from 'express';

const app = express();

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
```

- Text

```text
import express from 'express';

const app = express();

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
```

- Inline code: `ENTER`.

## Table

| Table Caption |
| ------------- |

| Header 1 | Header 2 | Header 3 | Header 4 | Header 5 |
| -------- | -------- | -------- | -------- | -------- |
| Text 1   | Text 2   | Text 3   | Text 4   | Text 5   |
| Text 1   | Text 2   | Text 3   | Text 4   | Text 5   |

## Mermaid

```mermaid
  graph TD;
      A-->B;
      A-->C;
      B-->D;
      C-->D;
```
