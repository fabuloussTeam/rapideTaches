const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Page d'accueil
router.get('/', async (req, res) => {
    const tasks = await prisma.task.findMany({
        include: { user: true }, // Inclure les informations de l'utilisateur
    });
    const users = await prisma.user.findMany(); // Récupérer tous les utilisateurs
    res.render('index', { tasks, users });
});

// Créer un utilisateur
router.post('/user/add', async (req, res) => {
    const { name, email } = req.body;
    await prisma.user.create({
        data: {
            name,
            email,
        },
    });
    res.redirect('/');
});

// Supprimer une tâche
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.task.delete({
        where: { id: parseInt(id) },
    });
    res.redirect('/');
});


// Ajouter une tâche
router.post('/add', async (req, res) => {
    const { title, description, priority, dueDate, userId } = req.body;
    await prisma.task.create({
        data: {
            title,
            description,
            priority,
            dueDate: new Date(dueDate), // Convertir en objet Date
            userId: parseInt(userId),   // Assigner à l'utilisateur
        },
    });
    res.redirect('/');
});

// Afficher le formulaire de modification
router.get('/edit/:id', async (req, res) => {
    const task = await prisma.task.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { user: true }, // Inclure les informations de l'utilisateur
    });
    const users = await prisma.user.findMany(); // Récupérer tous les utilisateurs
    res.render('edit', { task, users });
});

// Mettre à jour une tâche
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, dueDate, userId } = req.body;
    await prisma.task.update({
        where: { id: parseInt(id) },
        data: {
            title,
            description,
            priority,
            dueDate: new Date(dueDate),
            userId: parseInt(userId),
        },
    });
    res.redirect('/');
});


module.exports = router;