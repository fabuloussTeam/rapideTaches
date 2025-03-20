import { Router } from "express";
import {addTask,getTasks,updateTask,deleteTask,getTaskById,getTaskByUser, getTaskHistory,} from "./model/Tasks.js";
import { isIdValid, validateTitre, validateDescription } from "./validation.js";
import { getuserById } from "./model/Profil.js";

const router = Router();

//Definition des routes
/*  ............. */


router.get("/", async (request, response) => {
  try {
    const tasks = await getTasks(); // Récupérer les tâches
    //console.log("Tasks récupérées:", tasks);
    const columns = {
      aFaire: [],
      enCours: [],
      enRevision: [],
      terminee: [],
    };
    const statusMapping = {
      "à faire": "aFaire",
      "en cours": "enCours",
      "en révision": "enRevision",
      "terminé": "terminee",
    };
    tasks.forEach((task) => {
      const statusName = task.status.name?.toLowerCase().trim();
      const columnKey = statusMapping[statusName];
      if (columnKey) {
        columns[columnKey].push(task);
      } else {
        console.warn(`Statut non reconnu : ${task.status.name}`);
      }
    });
    //console.log("Colonnes organisées:", columns);
    response.render("home", {
      columns: columns,
      titre: "Accueil des tâches | Gestion des tâches",
      styles: ["/css/home.css"],
    });
  } catch (err) {
    console.error("Erreur lors du chargement des tâches :", err);
    response.status(500).send("Erreur serveur");
  }
});




// Route pour afficher les détails d'une tâche

router.get("/details/:id", async (request, response) => {
  try {
    const taskId = parseInt(request.params.id);
    // Validation de l'ID
    if (!isIdValid(taskId)) {
      console.error("ID invalide :", taskId);
      return response.status(400).json({ error: "ID invalide" });
    }
    // Récupérer la tâche par son ID
    const task = await getTaskById(taskId);
    if (!task) {
      return response.status(404).json({ error: "Tâche non trouvée" });
    }
    // Afficher la vue avec les détails de la tâche
    response.render("details", {
      titre: "Détail d'un tâche | Gestion des tâches",
      styles: ["/css/detail.css"],
      task: task,
    });
  } catch (error) {
    console.error("Erreur :", error);
    response.status(500).json({ error: "Une erreur s'est produite" });
  }
});

// Route pour afficher le profil d'un utilisateur

router.get("/Profil", async (request, response) => {
  try {
    // Appel de la fonction pour récupérer l'utilisateur
    const user = await getuserById(1);
    // Vérifier si l'utilisateur existe
    if (!user) {
      return response.status(404).send("Utilisateur non trouvé");
    }
    // Rendre la vue "Profil" avec les données de l'utilisateur et ses tâches
    response.render("Profil", {
      titre: "Profil | Gestion des tâches",
      styles: ["/css/profil.css"],
      scripts: ["/js/Profil.js"],
      nom: user.username,
      tasks: await getTaskByUser(1),
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du profil ou des tâches :",
      error
    );
    response.status(500).send("Erreur interne du serveur");
  }
});

router.get("/task", async (request, response) => {
  response.render("create-task", {
    titre: "Créer une tâche | Gestion des tâches",
    styles: ["/css/create.css"],
    scripts: ["/js/create-task.js"],
  });
});

router.get("/edit/:id", async (request, response) => {
  try {
    const id = parseInt(request.params.id);

    // Validation de l'ID
    if (!isIdValid(id)) {
      console.error("ID invalide :", id);
      return response.status(400).json({ error: "ID invalide" });
    }
    // Récupérer la tâche par son ID
    const task = await getTaskById(id);
    if (!task) {
      return response.status(404).json({ error: "Tâche non trouvée" });
    }
    // Récupérer l'utilisateur authentifié (si disponible)
    const user = request.user;
    // Afficher la vue de modification avec les infos de la tâche
    response.render("edit", {
      titre: "Modifier une tâche | Gestion des tâches",
      scripts: ["/js/edit.js"],
      styles: ["/css/edit.css"],
      task: task,
      user: user,
    });
  } catch (error) {
    console.error("Erreur :", error);
    response.status(500).json({ error: "Une erreur s'est produite" });
  }
});

// Route pour afficher la page de l'historique des tâches

router.get("/historique", async (request, response) => {
  try {
    // Récupérer l'historique des tâches
    const taskHistory = await getTaskHistory();

    response.render("historique", {
      titre: "historique | Gestion des tâches",
      styles: ["/css/historique.css"],
      taskHistory: taskHistory,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l’historique:", error);
    response.status(500).send("Erreur serveur");
  }
});

/*  ............. */

/*  ............. */

// Route pour obtenir la liste des tâches
router.get("/api/tasks", async (request, response) => {
  try {
    const { assignedToId, statusId, priorityId } = request.query;

    // Appeler la fonction getTasks avec les filtres optionnels
    const tasks = await getTasks(
      assignedToId ? parseInt(assignedToId) : undefined,
      statusId ? parseInt(statusId) : undefined,
      priorityId ? parseInt(priorityId) : undefined
    );

    return response.status(200).json(tasks);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

// Route pour ajouter une tâche
router.post("/api/task", async (request, response) => {
  try {
    const { title, description, priorityId, statusId, assignedToId, dueDate } =
      request.body;
       // Validations
    if (!validateTitre(title)) {
      return response.status(400).json({ error: "Le titre invalide." });
    }

    if (!validateDescription(description)) {
      return response.status(400).json({ error: "La description invalide." });
    }
    if (!priorityId || !statusId || !assignedToId ) {
      return response
        .status(400)
        .json({ error: "Certains champs obligatoires sont manquants" });
    }
    // Appeler la fonction addTask
    const newTask = await addTask(
      title,
      description,
      priorityId,
      statusId,
      assignedToId,
      new Date(dueDate)
    );
    return response
      .status(201)
      .json({ task: newTask, message: "Tâche ajoutée avec succès" });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

// Route pour mettre à jour une tâche en utilisant la méthode PUT avec query


router.put("/api/task", async (request, response) => {
  try {
    const id = parseInt(request.query.id);
    if (isNaN(id)) {
      return response.status(400).json({ error: "ID invalide" });
    }

    const {
      title,
      description,
      priorityId,
      statusId,
      assignedToId,
      dueDate,
      modifiedById,
      changeDescription,
    } = request.body;

    // Validations
    if (!validateTitre(title)) {
      return response
        .status(400)
        .json({ error: "Le titre invalide." });
    }

    if (!validateDescription(description)) {
      return response
        .status(400)
        .json({ error: "La description invalide." });
    }

    if (!priorityId || !statusId || !assignedToId || !dueDate || !modifiedById) {
      return response
        .status(400)
        .json({ error: "Certains champs obligatoires sont manquants" });
    }

    // Mise à jour de la tâche
    const updatedTask = await updateTask(
      id,
      {
        title,
        description,
        priorityId,
        statusId,
        assignedToId,
        dueDate: new Date(dueDate),
      },
      modifiedById,
      changeDescription
    );

    return response.status(200).json({
      task: updatedTask,
      message: "Tâche mise à jour avec succès",
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});



router.delete("/api/task/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (!isIdValid(id)) {
      return res.status(400).json({ error: "ID invalide" });
  }
  const deletedTask = await deleteTask(id);
  return res.status(200).json({ task: deletedTask, message: "Tâche supprimée avec succès" });
});

export default router;
