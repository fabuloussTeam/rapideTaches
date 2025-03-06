const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const routes = require('./routes');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express(); // Initialize the app


// Configuration de Handlebars
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); // Chemin absolu vers le répertoire views
// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        formatDate: function (date) {
            return new Date(date).toLocaleString(); // Formater la date
        },
        eq: function (a, b) {
            return a === b; // Helper pour comparer des valeurs
        },
    },
});

app.engine('hbs', hbs.engine);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});