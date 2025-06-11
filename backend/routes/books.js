const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadImage = require('../middleware/uploadImage')
const booksCtrl = require('../controllers/books');

router.post('/', auth, uploadImage, booksCtrl.createBook);
router.post('/:id/rating', auth, booksCtrl.rateBook);
router.put('/:id', auth, uploadImage,  booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);

module.exports = router;
