const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Lista de usuarios registrados

// Verifica si el nombre de usuario ya está registrado
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Verifica si el usuario y la contraseña son correctos
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Ruta para registrar un nuevo usuario
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Faltan credenciales" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "El usuario ya está registrado" });
    }

    users.push({ username, password });

    return res.status(201).json({ message: "Usuario registrado con éxito" });
});

// Ruta para iniciar sesión
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Faltan credenciales" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT y guardarlo en la sesión
    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
    req.session.token = token;

    return res.status(200).json({ message: "Inicio de sesión exitoso", token });
});

// Ruta para agregar o modificar una reseña de un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    
    // Obtener el usuario desde la sesión
    jwt.verify(req.session.token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido." });
        }

        const username = decoded.username;

        if (!review) {
            return res.status(400).json({ message: "Debe proporcionar una reseña" });
        }

        // Verificar si el libro existe
        if (!books[isbn]) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        // Si el libro no tiene reseñas, inicializar el objeto
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // Guardar o actualizar la reseña del usuario
        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: "Reseña agregada/modificada exitosamente", reviews: books[isbn].reviews });
    });
});

// Ruta para eliminar una reseña de un libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Obtener el usuario desde la sesión
    jwt.verify(req.session.token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido." });
        }

        const username = decoded.username;

        // Verificar si el libro existe
        if (!books[isbn]) {
            return res.status(404).json({ message: "Libro no encontrado" });
        }

        // Verificar si el usuario tiene una reseña en este libro
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "No hay reseña para eliminar" });
        }

        // Eliminar la reseña del usuario
        delete books[isbn].reviews[username];

        return res.status(200).json({ message: "Reseña eliminada exitosamente", reviews: books[isbn].reviews });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
