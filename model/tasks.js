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

// Mettre à jour une tâche
export const updateTask = async (taskId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { user: true }, // Inclure les informations de l'utilisateur assigné
    });
    const users = await prisma.user.findMany(); // 
    return { task, users };
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
        orderBy: { createdAt: "desc" },
    });
    return { task, history };
}

