import type { Request, Response } from 'express';

export function handlePropertyImageUpload(req: Request, res: Response): void {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No image files were provided.' });
    return;
  }

  const urls = files.map((file) => `/uploads/${file.filename}`);
  res.status(201).json({
    urls,
    count: urls.length,
  });
}
