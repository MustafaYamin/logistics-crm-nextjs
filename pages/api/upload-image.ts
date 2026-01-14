import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for this route to handle multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse the form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      filename: (name, ext, part) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `email-image-${uniqueSuffix}${ext}`;
      },
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the filename from the new path
    const filename = path.basename(file.filepath);
    
    // Move file to public/uploads with the correct name
    const oldPath = file.filepath;
    const newPath = path.join(uploadDir, filename);
    
    if (oldPath !== newPath) {
      // Use copy + unlink to avoid EXDEV errors across partitions
      fs.copyFileSync(oldPath, newPath);
      try {
        fs.unlinkSync(oldPath);
      } catch (e) {
        console.warn('Failed to clean up temp file:', oldPath);
      }
    }

    // Return the public URL
    const url = `/uploads/${filename}`;
    
    console.log('[upload-image] Image uploaded:', url);
    
    res.status(200).json({ 
      success: true,
      url,
      filename,
      size: file.size,
      mimetype: file.mimetype
    });

  } catch (error) {
    console.error('[upload-image] Error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}