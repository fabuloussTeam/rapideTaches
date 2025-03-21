import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { addTask, deleteTask, getTaskDetails, getTasks, updateStatus, updateTask } from './model/tasks.js';
const prisma = new PrismaClient();

// Page d'accueil
router.get('/', async (req, res) => {
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
router.post('/add', async (req, res) => {
 
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
        const currentTask = await prisma.task.findUnique({
            where: { id: taskId },
        });

        // Mettre à jour la tâche
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                priority,
                dueDate: new Date(dueDate),
                userId: parseInt(userId),
                status,
            },
        });

        // Enregistrer les modifications dans l'historique
        const changes = [];
        if (currentTask.title !== updatedTask.title) {
            changes.push({
                taskId,
                userId: updatedTask.userId,
                field: "title",
                oldValue: currentTask.title,
                newValue: updatedTask.title,
            });
        }
        if (currentTask.description !== updatedTask.description) {
            changes.push({
                taskId,
                userId: updatedTask.userId,
                field: "description",
                oldValue: currentTask.description,
                newValue: updatedTask.description,
            });
        }
        if (currentTask.priority !== updatedTask.priority) {
            changes.push({
                taskId,
                userId: updatedTask.userId,
                field: "priority",
                oldValue: currentTask.priority,
                newValue: updatedTask.priority,
            });
        }
        if (currentTask.dueDate.toISOString() !== updatedTask.dueDate.toISOString()) {
            changes.push({
                taskId,
                userId: updatedTask.userId,
                field: "dueDate",
                oldValue: currentTask.dueDate.toISOString(),
                newValue: updatedTask.dueDate.toISOString(),
            });
        }
        if (currentTask.status !== updatedTask.status) {
            changes.push({
                taskId,
                userId: updatedTask.userId,
                field: "status",
                oldValue: currentTask.status,
                newValue: updatedTask.status,
            });
        }

        // Enregistrer chaque modification individuellement
        for (const change of changes) {
            await prisma.history.create({
                data: change,
            });
        }

        res.redirect('/'); // Rediriger vers la page d'accueil après la mise à jour
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche:", error);
        res.status(500).send("Erreur lors de la mise à jour de la tâche.");
    }
});





// Afficher les détails d'une tâche
router.get('/task/:id', async (req, res) => {
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
router.get('/addtask', async (request, response) => {
    const users = await prisma.user.findMany();
    response.render("add-task", {
        titre: "add a task ",
        styles: ["add-task.css"],
        scripts: ["add-task.js"],
        users
    });
});

//page de creation de compte
router.get('/adduser', async (request, response) => {
    response.render("add-user", {
        titre: "add a user",
        styles: ["add-user.css"],
        scripts: ["add-user.js"],
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


export default router;
