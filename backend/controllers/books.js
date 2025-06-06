const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');


exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const filename = `${Date.now()}-${bookObject.title || 'livre'}.webp`;
    const outputPath = path.join(__dirname, '../images/', filename);

    await sharp(req.file.buffer)
      .resize(300, 400, {
        fit: sharp.fit.cover,
        position: sharp.strategy.center
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré' });
    
  } catch (error) {
    res.status(400).json({ error })
  }
};


exports.modifyBook = async (req, res) => {
  try {
    let filename;

    // On récupère le livre d'abord
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    if (book.userId != req.auth.userId) return res.status(403).json({ message: 'Non autorisé' });

    // S'il y a une nouvelle image
    if (req.file) {
      const parsedBook = JSON.parse(req.body.book);
      filename = `${Date.now()}-${parsedBook.title || 'livre'}.webp`;
      const outputPath = path.join(__dirname, '../images', filename);

      // Supprimer l’ancienne image
      const oldFilename = book.imageUrl.split('/images/')[1];
      fs.unlink(path.join(__dirname, '../images', oldFilename), err => {
        if (err) console.error('Erreur suppression ancienne image :', err);
      });

      // Traitement sharp
      await sharp(req.file.buffer)
        .resize(300, 400, {
          fit: sharp.fit.cover,
          position: sharp.strategy.center
        })
        .webp({ quality: 80 })
        .toFile(outputPath);
    }

    // Construction de l'objet à enregistrer
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
        }
      : { ...req.body };

    delete bookObject._userId;

    // Mise à jour du livre
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
};


exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json ({ message: 'Non autorisé' })
      } else {
        const filename = book.imageUrl.split('/images/')[1];

        fs.unlink(path.join(__dirname, '../images', filename), err => {
          if (err) console.error('Erreur suppression image :', err);

          Book.deleteOne({_id: req.params.id})
            .then(() => { res.status(200).json({ message: 'Livre supprimé' })})
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};


exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }));
};


exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
