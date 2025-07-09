# TinyMDServ Project Memory

## Project Overview

TinyMDServ is a lightweight Markdown server for rapid deployment of Markdown-based documentation. It's designed to be minimal, fast, and easy to use.

## Current Status

- **Version**: 1.0.27
- **Main Branch**: master
- **Language**: JavaScript (ES6 modules)
- **Author**: Doosik Kim
- **License**: ISC

## Architecture

### Core Components

- **app.js**: Main server application (Express.js based)
- **docs/**: Default document directory containing:
  - `index.md`: Homepage
  - `template.ejs`: Main HTML template
  - `search.ejs`: Search page template
  - `css/theme/`: CSS themes (common.css, mkdocs.css, slide.css)
  - `js/autoupdate.js`: Auto-update functionality

### Key Dependencies

- **express**: ^5.1.0 (Web framework)
- **marked**: ^16.0.0 (Markdown parser)
- **ejs**: ^3.1.10 (Templating engine)
- **mermaid**: ^11.4.1 (Diagram generation)
- **yargs**: ^18.0.0 (Command-line argument parser)

## Features

- Markdown to HTML conversion
- Custom EJS templates
- Search functionality
- Port customization
- Document root customization
- Auto-update capability
- SSL/HTTPS support (if certificates present)
- Cross-platform support
- Math expression support ($ and $$)
- Mermaid diagram support
- Presentation mode with pagination

## Command Line Interface

```bash
tinymdserv [options]

Options:
  -p, --port     Set port number [default: 80 or 443 for HTTPS]
  -d, --dir      Set document path [default: "./docs"]
  -f, --file     Set document default name [default: "index.md"]
  -q, --quiet    Activate quiet mode
  --version      Show version number
  --help         Show help
```

## Recent Changes (Last 5 commits)

1. **24bc073**: Fix search script
2. **b3a6693**: Add mermaid.js to the input path
3. **12130d6**: Change command argument syntax
4. **12489be**: Update example page and default style
5. **76e2d5b**: Fix math expression. Separate '$' and '$$'

## Development Notes

- Uses ES6 modules (`"type": "module"` in package.json)
- Supports both HTTP and HTTPS (auto-detects SSL certificates)
- Global npm installation supported via `bin` field
- No test framework currently configured

## Common Tasks

- **Start server**: `npm start` or `node app.js`
- **Development**: `npm run mon` (uses nodemon)
- **Test**: No tests configured yet

## File Structure

```text
tinymdserv/
    L app.js              # Main server application
    L package.json        # Project configuration
    L package-lock.json   # Dependency lock file
    L readme.md          # Project documentation
    L CLAUDE.md          # This file
    L docs/              # Default document directory
        L index.md       # Homepage
        L template.ejs   # Main template
        L search.ejs     # Search template
        L css/theme/     # CSS themes
        L js/            # JavaScript files
    L images/            # Static images
```

## Repository

- GitHub: <https://github.com/doosik71/tinymdserv.git>
- Published as npm package: `tinymdserv`
