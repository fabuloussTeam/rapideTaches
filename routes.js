import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Page d'accueil
router.get('/', async (req, res) => {
    const tasks = await prisma.task.findMany({
        include: { user: true }, // Inclure les informations de l'utilisateur
    });
    const users = await prisma.user.findMany(); // Récupérer tous les utilisateurs
    res.render('index', { 
        titre: "Gestion de taches",
        styles: ["/css/style.css"],
        scripts: ["/js/main.js", "/js/ajouter-tache.js"],
        tasks,
        users,
    });
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

// Ajouter une tâche
router.post('/add', async (req, res) => {
    const { title, description, priority, dueDate, userId } = req.body;
    await prisma.task.create({
        data: {
            title,
            description,
            priority,
            dueDate: new Date(dueDate),
            userId: parseInt(userId),
            status: "À faire", // Statut par défaut
        },
    });
    res.redirect('/');
});

// Mettre à jour le statut d'une tâche
router.post('/update-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: { status },
    });
    res.json({ status: updatedTask.status }); // Renvoyer le nouveau statut
});

// Supprimer une tâche
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.task.delete({
        where: { id: parseInt(id) },
    });
    res.redirect('/');
});

export default router;