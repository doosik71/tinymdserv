# TinyMDServ

TinyMDServ is a lightweight Markdown server designed for rapid deployment of Markdown-based documentation.
It allows you to host your Markdown files with minimal configuration and includes simple templating capabilities.

## Features

- **Markdown Rendering**: Automatically converts .md files into HTML, making it easy to host documentation.
- **Custom Templates**: Supports custom templates using EJS to style your content.
- **Search Functionality**: Basic search template for navigating between different documentation pages.
- **Port Customization**: Allows specifying a custom port and document root directory.
- **Cross-Platform Support**: Works seamlessly across Windows, macOS, and Linux environments.

## Installation

- Install TinyMDServ globally via npm:

    ```bash
    npm install -g tinymdserv
    ```

## Usage

1. **Create a Homepage**: Create a `docs/index.md` file as your homepage.

    ```markdown
    # Home

    Hello
    ```

3. **Create Custom Templates**: Define templates using EJS for your document pages.
    - **Main Template**: `docs/template.ejs`

      ```html
      <html>
      <head>
        <meta charset="utf-8" />
        <meta lang="en" />
        <title><%=title %></title>
      </head>
      <body>
        <%-content %>
      </body>
      </html>
      ```

    - **Search Template**: `docs/search.ejs`

      ```html
      <html>
      <head>
      <meta charset="utf-8" />
      <meta lang="en" />
      <title><%=title %></title>
      </head>
      <body>
        <ul>
        <% content.forEach(path => { %>
          <li><a href='<%-path %>'><%-path %></a></li>
        <% }) %>
        </ul>
      </body>
      </html>
      ```

3. **Run the Server**: Start the server by specifying an optional port number and document root path.

    ```bash
    tinymdserv [<port_number>] [<docs_full_path>]
    ```

    - Default port number is `80`.
    - Default document path is `./docs`.

### Examples

- Run on port 80 (default port):

    ```bash
    tinymdserv 80
    ```

- Run on port 80 with a specific document directory:

    ```bash
    tinymdserv 80 C:\docs
    ```

- Run using `node` directly (alternative method):

    ```bash
    node app.js 8080 ./docs
    ```

## Release Notes

- v1.0.23
  - Fix math expression escaping for backtick and quote.
- v1.0.22
  - Fix math expression escaping for backslash and underscore.
- v1.0.13
  - Add pagination for presentation mode.
- v1.0.9
  - Add page auto-update.
- v1.0.0
  - Initial release.
