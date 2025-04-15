import express from 'express';
import expressHandlebars from 'express-handlebars';
import { PrismaClient } from '@prisma/client';
import cspOption from "./csp-options.js";
import helmet from 'helmet';
import session from 'express-session';
import https from 'https';
import fs from 'fs';
import cspOptions from './csp-options.js'; // Importer les options CSP
const prisma = new PrismaClient();

const app = express(); // Initialize the app
// Charger les certificats SSL
const sslOptions = {
    key: fs.readFileSync('./certs/server.key'), // Chemin vers la clé privée
    cert: fs.readFileSync('./certs/server.cert') // Chemin vers le certificat
};

// Démarrer le serveur HTTPS
https.createServer(sslOptions, app).listen(443, () => {
    console.log('Serveur démarré en HTTPS sur https://localhost:443');
});

// Démarrer un serveur HTTP pour rediriger vers HTTPS
app.listen(80, () => {
    console.log('Serveur HTTP démarré sur http://localhost:80');
    console.log('Redirection vers HTTPS activée.');
});

app.use((req, res, next) => {
    if (!req.secure) {
        // Rediriger les requêtes HTTP vers HTTPS
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});
// Importer les routes
import routerExterne from "./routes.js";


// Configuration de Handlebars
const handlebars = expressHandlebars.create({
    extname: '.handlebars',
    helpers: {
        formatDate: function (date) {
            return new Date(date).toLocaleString(); // Formater la date
        },
        eq: function (a, b) {
            return a === b; // Helper pour comparer des valeurs
        },
    },
});

app.engine('.handlebars', handlebars.engine);
app.set('view engine', '.handlebars');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set("views", "./views");

// Middleware pour les fichiers statiques
app.use(helmet(cspOptions)); // Utiliser Helmet avec les options CSP
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Middleware pour passer l'état de connexion à toutes les vues
app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.session.user; // Vérifie si l'utilisateur est connecté
    res.locals.user = req.session.user || null; // Passe les informations de l'utilisateur si connecté
    next();
});
// Ajout des routes
app.use(routerExterne);

/* // Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur https://localhost:${PORT}`);
}); */