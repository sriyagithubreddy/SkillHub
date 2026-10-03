const express = require('express');
const { getCertificates, addCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getCertificates);
router.post('/', addCertificate);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

module.exports = router;
