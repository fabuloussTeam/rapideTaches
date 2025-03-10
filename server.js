import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import cspOption from "./csp-options.js";
import helmet from 'helmet';
const prisma = new PrismaClient();

const app = express(); // Initialize the app

// Importer les routes
import routerExterne from "./routes.js";

// Configuration de Handlebars
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
app.set('view engine', 'hbs');
app.set("views", "./views");

// Middleware pour les fichiers statiques
app.use(helmet(cspOption));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Ajout des routes
app.use(routerExterne);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});