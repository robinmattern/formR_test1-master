 import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
 import { fileURLToPath } from 'url';
 import { dirname, join } from 'path';
 import   dotenv          from 'dotenv'
 import { v4 as uuidv4 }  from 'uuid';
 import   express    from 'express';
 import   formidable from 'formidable';

 import './_config.js'

  const __filename  =  fileURLToPath(import.meta.url);
  const __dirname   =  dirname(__filename);
        dotenv.config( { path: join( __dirname, '.env' ), quiet: true } );

    var DATA_FOLDER =    process.FVARS.DATA_FOLDER
    var DATA_FOLDER =    DATA_FOLDER.replace( /{ProjectDir}\/?/, join(__dirname, '../../')) 
  const dataPath    = `${DATA_FOLDER}/documents.json`;
  const sourcesPath = `${DATA_FOLDER}/sources`;
                         process.FVARS.SOURCES_DIR = sourcesPath

export const router =  express.Router();

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
router.post('/', (req, res) => {
  const form = formidable({
    uploadDir: sourcesPath,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Upload failed' });
    }

    const file = files.file[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const documents = readDocuments();
      const newDoc = {
        id: uuidv4(),
        title: file.originalFilename,
        type: file.originalFilename.split('.').pop().toLowerCase(),
        filepath: `sources/${file.newFilename}`,
        dateUploaded: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      documents.push(newDoc);
      writeDocuments(documents);
      res.status(201).json(newDoc);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save document' });
    }
  });
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