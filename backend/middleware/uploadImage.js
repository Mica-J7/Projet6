const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

module.exports = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: 'Erreur lors de l’upload' });

    if (!req.file) {
      return next(); // Aucun fichier => on continue (utile pour les PUT sans image)
    }

    try {
      // Nom de fichier unique
      const filename = `${Date.now()}-${req.file.originalname.split(' ').join('_')}.webp`;
      const outputPath = path.join(__dirname, '../images', filename);

      // Créer dossier s'il n'existe pas
      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      }

      // Traitement avec sharp
      await sharp(req.file.buffer)
        .resize(300, 400, {
          fit: sharp.fit.cover,
          position: sharp.strategy.center
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Ajout du nom de fichier traité à la requête
      req.processedImageFilename = filename;
      next();

    } catch (error) {
      console.error('Erreur Sharp :', error);
      res.status(500).json({ error: 'Erreur lors du traitement de l’image' });
    }
  });
};
