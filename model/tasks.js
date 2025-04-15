// importer ler client prisma
import { PrismaClient } from "@prisma/client";
//Creer une instance de prisma
const prisma = new PrismaClient();

// Afficher la liste des taches
export const getTasks = async () => {
    const tasks = await prisma.task.findMany({
        include: { user: true },
    });
    const users = await prisma.user.findMany(); 
   return { tasks, users };
}   

// ajouter une tache
export const addTask = async (title, description, priority, dueDate, userId) => {
    const newTask = await prisma.task.create({
        data: {
            title,
            description,
            priority,
            dueDate: new Date(dueDate),
            userId: parseInt(userId),
            status: "À faire", // Statut par défaut
        },
    });
    return newTask;
}

// Mettre à jour le statut d'une tâche
export const updateStatus = async (taskId, status) => {
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status },
    });
    return updatedTask;
}

// Supprimer une tâche
export const deleteTask = async (taskId) => {
     // Supprimer les enregistrements liés dans la table History
    const history = await prisma.history.deleteMany({
        where: { taskId },
    });

     // Supprimer la tâche
    const deletedTask =  await prisma.task.delete({
        where: { id: taskId },
    });

    return deletedTask;
}

// Mettre à jour une tâche: Ouvrir la page de mise à jour
export const updateTask = async (taskId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { user: true }, // Inclure les informations de l'utilisateur assigné
    });
    const users = await prisma.user.findMany(); // 
    return { task, users };
}


// Mettre à jour une tâche: Enregistrer les modifications
export const saveTask = async (taskId, title, description, priority, dueDate, userId, status) => {
    const currentTask = await prisma.task.findUnique({
        where: { id: taskId },
    });

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

    for (const change of changes) {
        await prisma.history.create({
            data: change,
        });
    }

    return updatedTask;
}



// Afficher les détails d'une tâche
export const getTaskDetails = async (taskId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { user: true },
    });
    const history = await prisma.history.findMany({
        where: { taskId },
        include: { user: true },
        orderBy: { changedAt: "desc" },
    });
    return { task, history };
}

//cree un utilisateur
export const createeUser = async (name) => {
    const newUser = await prisma.user.create({
        data: { 
            name,
            email
         },
    });
    return newUser;
}

