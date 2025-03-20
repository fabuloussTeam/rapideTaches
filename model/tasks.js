
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
 * @param {string} changeDescription -
 * @returns {Promise<Object>} 
 */
export const updateTask = async (
  id,
  updateData,
  modifiedById,
  changeDescription
) => {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) {
      throw new Error("Tâche non trouvée");
    }

   // Vérification que modifiedById n'est pas null et est un nombre valide
   if (!modifiedById || isNaN(modifiedById)) {
    throw new Error("L'ID de l'utilisateur modificateur est invalide");
  }

    // Mettre à jour la tâche
    const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data: updateData,
    });

    // Ajouter une entrée dans l'historique des tâches
  await prisma.taskHistory.create({
      data: {
        taskId: id,
        modifiedById: parseInt(modifiedById),
        changeDescription,
      },
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


// Fonction pour récupérer l'historique des tâches
export const getTaskHistory = async () => {
  try {
    // Récupérer l'historique des tâches
    const taskHistory = await prisma.taskHistory.findMany({
      include: {
        task: {
          include: {
            priority: true,
            status: true,
            assignedTo: {
              select: {
                username: true,
              },
            },
          },
        },
        modifiedBy: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        modifiedAt: 'desc', 
      },
    });

    return taskHistory;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des tâches:", error);
    throw new Error("Impossible de récupérer l'historique des tâches");
  }
};


