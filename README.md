# File Uploads (pdf/images)

This project is a full-stack application designed to handle file uploads (PDFs and images), extract text from uploaded files, and display processed data. The backend is built with Node.js and Express uses, while the frontend is developed using Next.js with React.

## Technologies Used
### Backend
- Node.js - JavaScript runtime
- Express - web framework for building REST APIs
- Multer - middleware for handling uploads
- pdf-parse - library for extracting text from pdf files
- tesseract.js - for extracting text from images
- cors - middleware for cross-origins resource sharing

### Frontend
- Next.js - React framework for SSR and static site generation
- React - JavaScript library for building interfaces
- Axios - promise-based http client for making API requests

## Project structure
![image](https://github.com/user-attachments/assets/1a3d84ee-2b24-4450-85d5-582206942c60)

├── backend/                   # File-uploads backend (express.js)
│   ├── .gitignore             # Git ignore rules for backend
│   ├── eng.traineddata        # Tesseract OCR trained data
│   ├── package.json           # Backend dependencies and scripts
│   ├── package-lock.json      # Backend lockfile
│   └── server.js              # Express server entry point
│
├── frontend/                  # File Upload Next.js frontend
│
├── public/                    # Public assets
│
├── src/app/                   # Main frontend application logic
     ├── upload/page.js        # upload page
     ├── display/page.js       # display/results page
│
├── .gitignore                 # Git ignore rules for root/frontend
├── eslint.config.mjs         # ESLint configuration
├── jsconfig.json             # JavaScript path mapping config
├── next.config.mjs           # Next.js configuration
├── package.json              # Frontend dependencies and scripts
├── package-lock.json         # Frontend lockfile
├── screenshots/              # Application screenshots
├── README.md                 # Readme file (installation, folder structure etc)


## Installation

Use the package manager [npm].
 Navigate to folder
```bash
cd backend
```
Install packages

```bash
npm install
```

Run server 
```bash
npm run dev
```

 Navigate to folder
```bash
cd frontend
```
Install packages

```bash
npm install
```

Run server 
```bash
npm run dev
```

## Usage
- Open http://localhost:3000/upload in your browser.



- Fill in the form with your first name, last name, date of birth, and select a PDF or image file.



- Submit the form to upload the file and process the data.

- After successful submission, you will be redirected to the /display page, where the full name, age, and extracted text are shown.


- If an error occurs, an error message will be displayed with an option to return to the upload page.
