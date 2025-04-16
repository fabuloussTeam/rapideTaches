import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ajouter une tâche
 * @param {string} title 
 * @param {string} description 
 * @param {number} priorityId 
 * @param {number} statusId 
 * @param {number} assignedToId 
 * @param {Date} dueDate 
 * @returns {Promise<Object>} 
 */
export const addTask = async (
  title,
  description,
  priorityId,
  statusId,
  assignedToId,
  dueDate
) => {
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priorityId,
        statusId,
        assignedToId,
        dueDate,
      },
    });
    return task;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tâche:", error);
    throw new Error("Impossible d'ajouter la tâche");
  }
};

/**
 * Obtenir la liste de toutes les tâches
 * @param {number} [assignedToId] 
 * @param {number} [statusId] 
 * @param {number} [priorityId] 
 * @returns {Promise<Array>} 
 */


export const getTasks = async (assignedToId, statusId, priorityId) => {
  try {
    const whereClause = {};
    if (assignedToId !== undefined) whereClause.assignedToId = assignedToId;
    if (statusId !== undefined) whereClause.statusId = statusId;
    if (priorityId !== undefined) whereClause.priorityId = priorityId;

    // Récupération des tâches avec la relation status et priority
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        priority: true, 
        status: true,  
        assignedTo: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc", 
      },
    });

    // Retourner les tâches pour un usage ultérieur
    return tasks;
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    throw new Error("Impossible de récupérer les tâches");
  }
};



/**
 * Mettre à jour une tâche
 * @param {number} id 
 * @param {Object} updateData 
 * @param {number} modifiedById 
 * @param {string} changeDescription 
 * @returns {Promise<Object>} 
 */

export const updateTask = async (id, updateData, modifiedById, changeDescription) => {
  try {
    // Vérifier si la tâche existe
    const existingTask = await prisma.task.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        status: { select: { name: true } },
        priority: { select: { name: true } }
      }
    });

    if (!existingTask) {
      throw new Error("Tâche non trouvée");
    }

    // Vérifier que l'ID de modification est valide
    if (!modifiedById || isNaN(modifiedById)) {
      throw new Error("L'ID de l'utilisateur modificateur est invalide");
    }

     // Ajouter une entrée dans l'historique avec les anciennes valeurs
     await prisma.taskHistory.create({
      data: {
        taskId: id,
        modifiedById,
        changeDescription,
        oldTitle: existingTask.title,
        oldDescription: existingTask.description,
        oldStatus: existingTask.status.name,
        oldPriority: existingTask.priority.name
      }
    });
    // Mettre à jour la tâche
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return updatedTask;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error);
    throw new Error("Impossible de mettre à jour la tâche");
  }
};



/**
 * Supprimer une tâche
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export const deleteTask = async (id) => {
  try {

    // Vérifier si l'ID est valide avant d'effectuer la suppression
    if (!id || isNaN(id)) {
      throw new Error("ID invalide");
    }
    // Supprimer la tâche à partir de l'ID
    const deletedTask = await prisma.task.delete({
      where: {
         id,
      },
    });
    return deletedTask;
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    throw new Error("Impossible de supprimer la tâche");
  }
};



// Fonction pour récupérer une tâche par son ID
const isIdValid = (id) => !isNaN(id) && id > 0;
export const getTaskById = async (id) => {
    try {

         // Validation de l'ID
         if (!isIdValid(id)) {
            throw new Error("ID invalide");
        }
        const task = await prisma.task.findUnique({
            where: { id,

            },
            include: {
                priority: true,
                status: true,
                assignedTo: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });

        return task;
    } catch (error) {
        console.error("Erreur lors de la récupération de la tâche :", error);
        throw new Error("Impossible de récupérer la tâche");
    }
};


export const getTaskByUser = async (id) => {
    try {
        // Validation de l'ID
        if (!isIdValid(id)) {
            throw new Error("ID invalide");
        }
        // Utilisation de Prisma pour récupérer les tâches assignées à l'utilisateur
        const tasks = await prisma.task.findMany({
            where: {
                assignedToId: id, 
            },
            include: {
                priority: true,   
                status: true,      
                assignedTo: {    
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
        });
       // console.log("Tâches récupérées :", tasks);
        // Vérification si des tâches sont trouvées
        if (!tasks || tasks.length === 0) {
            throw new Error("Aucune tâche trouvée pour cet utilisateur");
        }
        return tasks;
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches de l'utilisateur :", error);
        throw new Error("Impossible de récupérer les tâches de l'utilisateur");
    }
};

/**
 * Créer une entrée d'historique pour une tâche
 * @param {number} taskId 
 * @param {number} modifiedById 
 * @param {string} changeDescription 
 * @param {string} oldTitle 
 * @param {string} oldDescription 
 * @param {string} oldStatus 
 * @param {string} oldPriority 
 * @returns {Promise<void>}
 */
export const createTaskHistory = async (
  taskId,
  modifiedById,
  changeDescription,
  oldTitle,
  oldDescription,
  oldStatus,
  oldPriority
) => {
  try {
    await prisma.taskHistory.create({
      data: {
        taskId,
        modifiedById,
        changeDescription,
        modifiedAt: new Date(),
        oldTitle,
        oldDescription,
        oldStatus,
        oldPriority
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout à l'historique:", error);
  }
};

// Fonction pour récupérer l'historique des tâches par ID de tâche
export const getTaskHistoryByTaskId = async (taskId) => {
  try {
    // Validation de l'ID de la tâche
    if (!isIdValid(taskId)) {
      throw new Error("ID de tâche invalide");
    }

    // Récupérer l'historique des modifications de la tâche
    const taskHistory = await prisma.taskHistory.findMany({
      where: { taskId }, 
      include: {
        modifiedBy: { select: { username: true } }, 
        task: {  // Inclure les détails de la tâche
          select: {
            title: true,
            description: true,
            status: { select: { name: true } },  // Récupérer le nom du statut
            priority: { select: { name: true } } // Récupérer le nom de la priorité
          }
        }
      },
      orderBy: { modifiedAt: 'desc' }, // Trier par date, du plus récent au plus ancien
      
      take: 5, 
    });

    return taskHistory;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique de la tâche:", error);
    throw new Error("Impossible de récupérer l'historique de cette tâche");
  }
};




