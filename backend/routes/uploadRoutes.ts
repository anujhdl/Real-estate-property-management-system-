import { Router } from 'express';
import { handlePropertyImageUpload } from '../controllers/uploadController.ts';
import { uploadRateLimiter } from '../middleware/security.ts';
import { propertyImageUpload } from '../middleware/upload.ts';

const router = Router();

router.post(
  '/property-images',
  uploadRateLimiter,
  propertyImageUpload.array('images', 5),
  handlePropertyImageUpload
);

export default router;
