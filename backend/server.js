const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

//initialize Express
const app = express();
let port = 5000; //starting port..

//set-up CORS for multiple frontend ports (in case Next.js isn't on 3000)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy blocked this request.'));
    }
  },
  methods: ['POST'],
  credentials: true,
}));

// Handle larger payloads, but keep reasonable limits
app.use(express.json({ limit: '50mb' })); // Reduced from 800MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    try {
      // Create uploads folder if it doesn't exist
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Only accept PDFs and images
    const validTypes = /pdf|png|jpg|jpeg/;
    const extValid = validTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = validTypes.test(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs and images (PNG, JPG, JPEG) are allowed.'));
    }
  },
});

// Calculate age (years and months) from dob
const getAge = (dob) => {
  const birthDate = new Date(dob);
  const now = new Date();
  
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  // Adjust if the current date is before the birth date in the current year
  if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
    years--;
    months += 12; 
  }
    if (months < 0) {
    months += 12;
    years--;
  }
  
  return `${years} years, ${months} months`;
};



const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') //remove spaces
    .trim()
    .slice(0, 50000); // Limit to 50k chars 
};


// Endpoint for file uploads
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { firstName, lastName, dob } = req.body;
   
    //check for required fields
    if (!firstName || !lastName || !dob || !req.file) {
      return res.status(400).json({
        error: 'Error: Please provide first name, last name, date of birth, and a file.',
      });
    }

    //validate date of birth
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      return res.status(400).json({ error: 'Invalid or future date of birth.' });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const age = getAge(dob);
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    // process the file
    try {
      if (fileExt === '.pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(dataBuffer, { max: 50 }); // Limit to 50 pages
        extractedText = cleanText(pdfData.text);
      } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
          logger: (m) => console.log(m), // Debug 
        });
        extractedText = cleanText(text);
      } else {
        await fs.unlink(filePath).catch(() => {});
        return res.status(400).json({
          error: 'Please upload a PDF or image (PNG, JPG, JPEG).',
        });
      }
    } catch (fileError) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(200).json({
        fullName,
        age,
        error: 'Error: Couldn’t read the file. Try a different one.',
      });
    }

    // clean up uploaded file
    await fs.unlink(filePath).catch(() => {});
    res.json({ fullName, age, extractedText });
  } catch (err) {
    await fs.unlink(req.file?.path).catch(() => {});
    console.error('File processing error:', err.message);
    res.status(500).json({ error: 'Oops Something went wrong. Please try again.' });
  }
});


//endpoint to display processed data
app.post('/display', (req, res) => {
  try {
    const { fullName, age, extractedText } = req.body;
    if (!fullName || age === undefined || !extractedText) {
      return res.status(400).json({
        error: 'Need fullName, age, and extractedText to proceed.',
      });
    }
    res.json({ fullName, age, extractedText });
  } catch (err) {
    console.error('Display endpoint error:', err.message);
    res.status(500).json({ error: 'Failed to display data. Try again.' });
  }
});

// middleware-errors
app.use((err, req, res, next) => {
  // handle Multer file size limit errors
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(431).json({
      error: 'File is too large. Please upload a file under 10MB.',
    });
  }

  //handle express payload too large  (JSON)
  if (err.type === 'entity.too.large') {
    return res.status(431).json({
      error: 'Request data is too large. Please reduce the size and try again.',
    });
  }

  //handle generic 431 errors (e.g., oversized headers)
  if (err.status === 431) {
    return res.status(431).json({
      error: 'Request headers are too large. Please simplify your request.',
    });
  }

  //handle file type errors from Multer
  if (err.message === 'Only PDFs and images (PNG, JPG, JPEG) are allowed.') {
    return res.status(400).json({
      error: err.message,
    });
  }

  
  //handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Request blocked by CORS policy.',
    });
  }

  //Log errors and return error
  console.error('Unexpected error:', err.message);
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again later.',
  });
});

//start server, retry on other ports if 5000 is busy
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`File_upload server running on : http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is taken, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server startup failed:', err.message);
    }
  });
};


//Start file_upload server
startServer(port);