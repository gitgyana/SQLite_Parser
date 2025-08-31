
# SQLite Parser

A modern, full-stack web application for parsing SQLite database files and exporting data to CSV format. Built with Node.js, Express, and a sleek glassmorphism UI with animated particle backgrounds.

![License](https://img.shields.io/badge/license-License%201.0-blue)
![Node.js](https://img.shields.io/badge/node.js-18%2B-green)
![Express](https://img.shields.io/badge/express-5.1.0-lightgrey)

---

## Features

- **File Upload**: Drag-and-drop or browse SQLite database files (`.db`, `.sqlite3`)
- **Table Discovery**: Automatically list all tables in uploaded databases
- **CSV Export**: Export individual tables or all tables to CSV format
- **Serverless Ready**: Deploy on Vercel with zero configuration
- **Local Development**: Full Express.js server for local development
- **Auto Cleanup**: Automatic cleanup of temporary uploaded files
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Installation

1. **Clone the repository**
```
git clone https://github.com/gitgyana/SQLite_Parser.git
cd SQLite_Parser
```

2. **Install dependencies**
```
npm install
```

3. **Start the development server**
```
npm start
```

4. **Open your browser**
```
http://localhost:3000
```

---

## Deployment

### Vercel (Recommended)

1. **Fork/Clone this repository**

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy with default settings

3. **Environment Setup**
   - No additional environment variables required
   - Vercel automatically handles the serverless functions

### Manual Deployment

For other platforms (Railway, Heroku, etc.):

```
npm install
npm start
```

---

## Usage

### Web Interface

1. **Upload Database**: Click "Choose File" and select your SQLite database
2. **Select Tables**: Choose specific tables or "All Tables" from the dropdown
3. **Export**: Click "Export to CSV" to download your data

### API Endpoints

#### `POST /api/tables`

Upload a database file and get list of tables.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `dbFile` (SQLite database file)

**Response:**
```
{
"tables": ["users", "products", "orders"]
}
```

#### `POST /api/export`

Export table data to CSV format.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `dbFile` (SQLite database file)
  - `table` (table name or "ALL")

**Response:**
- CSV file download

---

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database driver
- **Multer** - File upload middleware
- **CSV-Writer** - CSV generation

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript** - Interactive functionality
- **Canvas API** - Particle animation system

### Deployment
- **Vercel** - Serverless hosting platform
- **GitHub** - Version control and CI/CD

---

## Project Structure

```
SQLite_Parser/
├── api/                   # Vercel serverless functions
│   ├── tables.js          # Table listing endpoint
│   └── export.js          # CSV export endpoint
├── public/                # Static frontend files
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styling and CSS variables
│   └── script.js          # Frontend JavaScript
├── uploads/               # Temporary file storage (local)
├── output/                # Generated CSV files (local)
├── index.js               # Express server for local development
├── package.json           # Dependencies and scripts
├── LICENSE                # License 1.0
└── README.md              # Project documentation
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
```
git checkout -b feature/your-feature-name
```
3. **Make your changes**
4. **Commit with conventional commits**
```
git commit -m "feat: add new feature"
```
5. **Push to your branch**
```
git push origin feature/your-feature-name
```
6. **Open a Pull Request**

### Code Style

- Use ESLint and Prettier for code formatting
- Follow conventional commit messages
- Add tests for new features
- Update documentation as needed

---

## Troubleshooting

### Common Issues

**"Failed to open DB" error**
- Ensure the uploaded file is a valid SQLite database
- Check file permissions and format

**"Table is empty" error**
- Verify the selected table contains data
- Try selecting "All Tables" to see available options

**Local server won't start**
- Check if port 3000 is available
- Run `npm install` to ensure dependencies are installed
- Verify Node.js version (18+ required)

---

## License

This project is licensed under the **License 1.0 (2025)**.

```
Copyright (c) 2025 Gyana Priyadarshi

Permission is hereby granted, free of charge, to use, copy, modify, and to permit others to do so, subject to the following conditions:
- The above copyright notice must be included in all copies or substantial portions of the Software.
- You must provide appropriate attribution for any modifications or derived works.
- This software is provided "as is", without warranty of any kind, express or implied.
- This license may be terminated if the terms are violated.
```

---

## Author

**Gyana Priyadarshi**
- GitHub: [@gitgyana](https://github.com/gitgyana)

---

## Acknowledgments

- Thanks to the open-source community for the amazing libraries
- Inspired by modern web design trends and glassmorphism
- Built with performance and user experience in mind

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[Report Bug](https://github.com/gitgyana/SQLite_Parser/issues) · [Request Feature](https://github.com/gitgyana/SQLite_Parser/issues) · [Documentation](https://github.com/gitgyana/SQLite_Parser/wiki)

</div>