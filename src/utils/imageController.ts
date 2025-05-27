import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { controllerWrapper } from './controllerWrapper';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const MEMES_DIR = path.join(UPLOADS_DIR, 'memes');

const DEFAULT_AVATAR = path.join(process.cwd(), 'public', 'default-avatar.png');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(AVATARS_DIR)) fs.mkdirSync(AVATARS_DIR, { recursive: true });
if (!fs.existsSync(MEMES_DIR)) fs.mkdirSync(MEMES_DIR, { recursive: true });

const isPathSafe = (filePath: string): boolean => {
  const normalized = path.normalize(filePath);
  return (
    normalized.startsWith(UPLOADS_DIR) || 
    normalized.startsWith(AVATARS_DIR) || 
    normalized.startsWith(MEMES_DIR)
  );
};

/**
 * Controller to serve avatar images
 */
export const getAvatar = controllerWrapper(async (req, res) => {
  const filename = req.params.filename;
  
  if (!filename) {
    return {
      status: 400,
      message: 'Filename is required'
    };
  }
  
  const imagePath = path.join(AVATARS_DIR, filename);
  
  if (!isPathSafe(imagePath)) {
    return {
      status: 403,
      message: 'Access denied'
    };
  }
  
  try {
    if (fs.existsSync(imagePath)) {
      const buffer = fs.readFileSync(imagePath);
      
      // Determine content type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.gif') contentType = 'image/gif';
      if (ext === '.webp') contentType = 'image/webp';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(buffer);
      return null;
    } else {
      if (fs.existsSync(DEFAULT_AVATAR)) {
        const buffer = fs.readFileSync(DEFAULT_AVATAR);
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(buffer);
        return null;
      } else {
        return {
          status: 404,
          message: 'Image not found'
        };
      }
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return {
      status: 500,
      message: 'Error serving image'
    };
  }
});

/**
 * Controller to serve meme images
 */
export const getMeme = controllerWrapper(async (req, res) => {
  const filename = req.params.filename;
  
  if (!filename) {
    return {
      status: 400,
      message: 'Filename is required'
    };
  }
  
  const imagePath = path.join(MEMES_DIR, filename);
  
  if (!isPathSafe(imagePath)) {
    return {
      status: 403,
      message: 'Access denied'
    };
  }
  
  try {
    if (fs.existsSync(imagePath)) {
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.gif') contentType = 'image/gif';
      if (ext === '.webp') contentType = 'image/webp';
      
      const buffer = fs.readFileSync(imagePath);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(buffer);
      return null;
    } else {
      return {
        status: 404,
        message: 'Image not found'
      };
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return {
      status: 500,
      message: 'Error serving image'
    };
  }
});

export const getImage = controllerWrapper(async (req, res) => {
  const { directory, filename } = req.params;
  
  if (!directory || !filename) {
    return {
      status: 400,
      message: 'Directory and filename are required'
    };
  }
  
  // Prevent directory traversal
  if (directory.includes('..') || filename.includes('..')) {
    return {
      status: 403,
      message: 'Access denied'
    };
  }
  
  const imagePath = path.join(UPLOADS_DIR, directory, filename);
  
  if (!isPathSafe(imagePath)) {
    return {
      status: 403,
      message: 'Access denied'
    };
  }
  
  try {
    if (fs.existsSync(imagePath)) {
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.gif') contentType = 'image/gif';
      if (ext === '.webp') contentType = 'image/webp';
      
      const buffer = fs.readFileSync(imagePath);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(buffer);
      return null;
    } else {
      return {
        status: 404,
        message: 'Image not found'
      };
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return {
      status: 500,
      message: 'Error serving image'
    };
  }
});

export default {
  getAvatar,
  getMeme,
  getImage
};