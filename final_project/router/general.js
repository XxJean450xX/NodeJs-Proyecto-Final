const express = require('express');
let books = require("./booksdb.js"); // Base de datos de libros
let isValid = require("./auth_users.js").isValid; // Validación de usuario
let users = require("./auth_users.js").users; // Usuarios registrados
const public_users = express.Router();

// 📌 Tarea 6: Registrar un nuevo usuario
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Se requiere nombre de usuario y contraseña" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "Usuario registrado con éxito" });
});

// 📌 Tarea 10: Obtener todos los libros disponibles usando async/await
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo los libros", error: error.message });
    }
});

// 📌 Tarea 11: Obtener detalles de un libro por ISBN usando async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        if (books[isbn]) {
            return res.status(200).json(books[isbn]);
        } else {
            return res.status(404).json({ message: "Libro no encontrado" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo el libro", error: error.message });
    }
});

// 📌 Tarea 12: Obtener libros por autor usando async/await
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params.toLowerCase();
    try {
        let booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);
        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No se encontraron libros de este autor" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo los libros", error: error.message });
    }
});

// 📌 Tarea 13: Obtener libros por título usando async/await
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params.toLowerCase();
    try {
        let booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);
        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No se encontraron libros con este título" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo los libros", error: error.message });
    }
});

// 📌 Tarea 5: Obtener reseñas de un libro por ISBN
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No se encontraron reseñas para este libro" });
    }
});

module.exports.general = public_users;
