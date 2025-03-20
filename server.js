//Doit etre en debut de fichier pour charger les variables d'environnement
import "dotenv/config";

// Importer les routes
import routerExterne from "./routes.js";

// Importation des fichiers et librairies
//import { engine } from "express-handlebars";
import express, { json } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cspOption from "./csp-options.js";
import { create } from "express-handlebars";
import moment from "moment";

// Configuration de Handlebars
const hbs = create({
    helpers: {
        formatDate: (date, format = "DD/MM/YYYY HH:mm") => {
            if (typeof format !== 'string') {
                format = "DD/MM/YYYY HH:mm"; 
            }
            return moment(date).format(format);
        },
        eq: function (a, b) {
            return a === b;
          }
    }
});

// Création du serveur express
const app = express();
app.engine("handlebars",  hbs.engine);
app.set("view engine", "handlebars"); 
app.set("views", "./views"); 

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());


// Le dossier 'public' est la partie statique de notre serveur
app.use(express.static("public"));

// Ajout des routes
app.use(routerExterne);

// Renvoyer une erreur 404 pour les routes non définies
app.use((request, response) => {
    // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
    response.status(404).send(`${request.originalUrl} Route introuvable.`);
});

//Démarrage du serveur
app.listen(process.env.PORT);
console.info("Serveur démarré :");
console.info(`http://localhost:${process.env.PORT}`);
