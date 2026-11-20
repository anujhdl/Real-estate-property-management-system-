import { Router } from 'express';
import {
  handleEmailServiceStatus,
  handleSendInquiryEmail,
} from '../controllers/inquiryController.ts';
import { inquiryRateLimiter } from '../middleware/security.ts';

const router = Router();

router.get('/email-status', handleEmailServiceStatus);
router.post('/send-email', inquiryRateLimiter, handleSendInquiryEmail);

export default router;
