 import   express from 'express';
 import   multer  from 'multer';
 import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
 import { fileURLToPath } from 'url';
 import { dirname, join } from 'path';
 import { v4 as uuidv4  } from 'uuid';

 import './_config.js'

  const __filename  =  fileURLToPath(import.meta.url);
  const __dirname   =  dirname(__filename);

    var DATA_FOLDER =    process.FVARS.DATA_FOLDER
    var DATA_FOLDER =    DATA_FOLDER.replace( /{ProjectDir}\/?/, join(__dirname, '../../')) 
  const dataPath    = `${DATA_FOLDER}/documents.json`;
  const sourcesPath = `${DATA_FOLDER}/sources`;
                         process.FVARS.SOURCES_DIR = sourcesPath

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sourcesPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

export const router = express.Router();

// Helper functions
const readDocuments = () => {
  try {
    return JSON.parse(readFileSync(dataPath, 'utf8'));
  } catch {
    return [];
  }
};

const writeDocuments = (docs) => {
  writeFileSync(dataPath, JSON.stringify(docs, null, 2));
};

// GET /api/docs - List all documents
router.get('/', (req, res) => {
  try {
    const documents = readDocuments();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read documents' });
  }
});

// GET /api/docs/:id - Get specific document
router.get('/:id', (req, res) => {
  try {
    const documents = readDocuments();
    const doc = documents.find(d => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read document' });
  }
});

// POST /api/docs - Upload new document
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documents = readDocuments();
    const newDoc = {
      id: uuidv4(),
      title: req.file.originalname,
      type: req.file.originalname.split('.').pop().toLowerCase(),
      filepath: `sources/${req.file.filename}`,
      dateUploaded: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    documents.push(newDoc);
    writeDocuments(documents);
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// DELETE /api/docs/:id - Delete document
router.delete('/:id', (req, res) => {
  try {
    const documents = readDocuments();
    const docIndex = documents.findIndex(d => d.id === req.params.id);
    
    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const doc = documents[docIndex];
    const filePath = join(__dirname, '../../', doc.filepath);
    
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    documents.splice(docIndex, 1);
    writeDocuments(documents);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});