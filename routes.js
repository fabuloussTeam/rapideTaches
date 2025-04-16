import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { addTask, 
    deleteTask,
     getTaskDetails,
      getTasks,
       updateStatus,
        updateTask,
        saveTask
     } from './model/tasks.js';

import { validateDescription,isEmailValid,isPasswordValid } from './validation.js';
const prisma = new PrismaClient();

// Page d'accueil
router.get('/',isAuthenticated, async (req, res) => {
   const gettasksandusers = await getTasks();
    const tasks = gettasksandusers.tasks;
    const users = gettasksandusers.users; 
    
    // Récupérer tous les utilisateurs
    res.render('index', { 
        titre: "Gestion de taches",
        styles: ["/css/style.css"],
        scripts: ["/js/main.js", "/js/ajouter-tache.js"],
        tasks,
        users,
    });
});


// Ajouter une tâche
router.post('/add',isAuthenticated, async (req, res) => {
 
    try {
        const { title, description, priority, dueDate, userId } = req.body;
        const task = addTask(title, description, priority, dueDate, userId);
        return res.status(200).redirect('/');
    } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche:", error);
    }
});

// Mettre à jour le statut d'une tâche
router.post('/update-status/:id', async (req, res) => {
      
    try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedTask = await updateStatus(parseInt(id), status);

    console.log("Statut mis à jour:", updatedTask.status); // Log pour vérifier le statut
    return res.status(200).json({ status: updatedTask.status, message: "Livre mis à jour avec succès" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la tâche:", error);
        res.status(500).send("Erreur lors de la mise à jour du statut de la tâche.");
    }
});


// Supprimer une tâche
router.post('/delete/:id', async (req, res) => {

    try {
        const taskId = parseInt(req.params.id);
         const task = await deleteTask(taskId);
        return res.redirect('/'); 
    } catch (error) {
        console.error("Erreur lors de la suppression de la tâche:", error);
        res.status(500).send("Erreur lors de la suppression de la tâche.");
    }
});


// modification d'une tâche
router.get('/edit/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
         const taskUser = await updateTask(taskId);
        const task = taskUser.task;
        const users = taskUser.users
        res.render('edit', { task, users });
    } catch (error) {
        console.error("Erreur lors de la récupération de la tâche:", error);
        res.status(500).send("Erreur lors de la récupération de la tâche.");
    }
});


// Mettre à jour une tâche
router.post('/update/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, priority, dueDate, userId, status } = req.body;

    try {
        // Récupérer la tâche actuelle pour comparer les valeurs
       await saveTask(taskId, title, description, priority, dueDate, userId, status);
        res.redirect('/'); // Rediriger vers la page d'accueil après la mise à jour
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche:", error);
        res.status(500).send("Erreur lors de la mise à jour de la tâche.");
    }
});





// Afficher les détails d'une tâche
router.get('/task/:id',isAuthenticated, async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
       
        const taskdetails = await getTaskDetails(taskId);
        const task = taskdetails.task;
        const history = taskdetails.history;

        if (task) {
            res.render('task-details', { task, history }); // Afficher la page de détails avec l'historique
        } else {
            res.status(404).send("Tâche non trouvée.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de la tâche:", error);
        res.status(500).send("Erreur lors de la récupération de la tâche.");
    }
});


//page de creation de compte
router.get('/addtask',isAuthenticated, async (request, response) => {
    const users = await prisma.user.findMany();
    response.render("add-task", {
        titre: "add a task ",
        styles: ["add-task.css"],
        scripts: ["add-task.js"],
        users
    });
});

//page de creation de compte
router.get('/adduser',isAuthenticated, async (request, response) => {
    response.render("add-user", {
        titre: "add a user",
        styles: ["add-user.css"],
        scripts: ["add-user.js"],
    });
});
// Middleware pour vérifier si l'utilisateur est connecté
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}


//page d'inscription
router.get('/inscription', async (request, response) => {
    response.render("inscription", {
        titre: "Inscription",
        styles: ["inscription.css"],
        scripts: ["inscription.js"],
    });
});

//page d'inscription post
router.post('/inscription', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    // Validation des données
    if (!name || !email || !password || !confirm_password) {
        return res.status(400).send("Tous les champs sont obligatoires.");
    }
    if (!isEmailValid(email)) {
        return res.status(400).send("Email invalide.");
    }
    if (!isPasswordValid(password)) {
        return res.status(400).send("Le mot de passe doit contenir entre 8 et 16 caractères.");
    }
    if (password !== confirm_password) {
        return res.status(400).send("Les mots de passe ne correspondent pas.");
    }

    try {
        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).send("Cet email est déjà utilisé.");
        }
        const hashedPassword = await bcrypt.hash(password, 10); // Hachage du mot de passe
        // Créer l'utilisateur
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, // Utiliser le mot de passe haché
            },
        });

        // Rediriger vers la page d'inscription réussie
        res.redirect('/inscriptionReussie');
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).send("Erreur lors de l'inscription.");
    }
});

//page de connexion
router.get('/login', async (request, response) => {
    response.render("login", {
        titre: "Login",
        styles: ["login.css"],
        scripts: ["login.js"],
    });
});


// Route de connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("L'email et le mot de passe sont obligatoires.");
    }

    

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).send("Utilisateur non trouvé.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(user.password, password);

            return res.status(400).send("Mot de passe incorrect.");
        }

        // Stocker l'utilisateur dans la session
        req.session.user = { id: user.id, email: user.email, name: user.name };

        res.redirect('/');
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).send("Erreur lors de la connexion.");
    }
});

// Page de inscription reussie
router.get('/inscriptionReussie', async (request, response) => {
    response.render("inscriptionReussie", {
        titre: "Inscription réussie",
        styles: ["inscription.css"],
        scripts: ["inscription.js"],
    });
});

// Route de déconnexion
router.get('/logout', (req, res) => {
    // Détruire la session
    req.session.destroy((err) => {
        if (err) {
            console.error("Erreur lors de la déconnexion :", err);
            return res.status(500).send("Erreur lors de la déconnexion.");
        }
        // Rediriger vers la page de connexion
        res.redirect('/login');
    });
});

//Route pour get historique
router.get('/historique/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const taskdetails = await getTaskDetails(taskId);
        const task = taskdetails.task;
        const history = taskdetails.history;

        if (task) {
            res.render('historique', { task, historique:history }); // Afficher la page de détails avec l'historique
        } else {
            res.status(404).send("Tâche non trouvée.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
        res.status(500).send("Erreur lors de la récupération de l'historique.");
    }
});

// Créer un utilisateur
router.post('/user/add', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send("Le nom et l'email sont obligatoires.");
    }
    try {
        await prisma.user.create({
            data: {
                name,
                email,
            },
        });
        res.redirect('/');
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        res.status(500).send("Erreur lors de la création de l'utilisateur.");
    }
});


export default router;
