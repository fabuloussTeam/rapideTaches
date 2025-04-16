import { Router } from "express";
import {addTask,getTasks,updateTask,deleteTask,getTaskById,getTaskByUser,getTaskHistoryByTaskId,} from "./model/Tasks.js";
import { isIdValid, validateTitre, validateDescription,isEmailValid,isPasswordValid } from "./validation.js";
import { getuserById, addUser } from "./model/Profil.js";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
const prisma = new PrismaClient();



const router = Router();

//Definition des routes client
/*  ............. */


// Route pour la page Accueil
router.get("/", (request, response) => {
  response.render("accueil", {
      titre: "Accueil | Gestion des tâches ",
      styles: ["./css/style.css","./css/accueil.css"],
  });
});


// Route pour la page inscription
router.get("/inscription", (request, response) => {
  response.render("inscription", {
      titre: "Inscription | Gestion des tâches ",
      styles: ["./css/inscription.css"],
      scripts: ["./js/inscription.js"],
  
  });
});


// Route pour la page de connexion
router.get("/connexion", (request, response) => {
  response.render("connexion", {
      titre: "Connexion | Gestion des tâches",
      styles: ["./css/connexion.css"],
      scripts: ["./js/connexion.js"],
     
  });
});


router.get("/allTasks", async (request, response) => {
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
    response.render("allTasks", {
      columns: columns,
      titre: "Accueil des tâches | Gestion des tâches",
      styles: ["/css/allTasks.css"],
      user:request.user,
    });
  } catch (err) {
    console.error("Erreur lors du chargement des tâches :", err);
    response.status(500).send("Erreur serveur");
  }
});


// Route pour afficher les détails d'une tâche avec son historique
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

    // Récupérer l'historique de la tâche
    const taskHistory = await getTaskHistoryByTaskId(taskId);
    console.log(taskHistory);
    // Afficher la vue avec les détails de la tâche et son historique
    response.render("details", {
      titre: "Détail d'une tâche | Gestion des tâches",
      styles: ["/css/detail.css", "/css/historique.css"],
      task: task,
      taskHistory: taskHistory, 
      user:request.user,
    });
  } catch (error) {
    console.error("Erreur :", error);
    response.status(500).json({ error: "Une erreur s'est produite" });
  }
});

// Middleware pour enregistrer l'historique des tâches
prisma.$use(async (params, next) => {
  if (params.model === 'Task' && (params.action === 'update' || params.action === 'updateMany')) {
    const { modifiedById } = params.args.data;
    if (modifiedById) {
      await prisma.taskHistory.create({
        data: {
          taskId: params.args.where.id,
          modifiedById,
          changeDescription: "Modification de la tâche",
        },
      });
    } else {
      console.error("Erreur : ID de l'utilisateur modificateur manquant");
    }
  }
  return next(params);
});


// Route pour afficher le profil d'un utilisateur

router.get("/Profil", async (request, response) => {
  try {

    const id = request.user?.id;
    if (!id) {
      return response.status(401).send("Utilisateur non authentifié");
    }
    // Appel de la fonction pour récupérer l'utilisateur
    const user = await getuserById(id);
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
      user:request.user,
      tasks: await getTaskByUser(id),
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
  const user = request.user;
  response.render("create-task", {
    titre: "Créer une tâche | Gestion des tâches",
    styles: ["/css/create.css"],
    scripts: ["/js/create-task.js"],
    user: request.user,
    user: user,
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
      user:request.user,
      userId: request.user.id,
    });
  } catch (error) {
    console.error("Erreur :", error);
    response.status(500).json({ error: "Une erreur s'est produite" });
  }
});


/*  ............. */
//Definition des routes serveur
/*  ............. */

//Route pour la connexion
router.post("/connexion", (request, response, next) => {
  // On vérifie le le courriel et le mot de passe
  // envoyé sont valides
  if (
      isEmailValid(request.body.email) &&
      isPasswordValid(request.body.password)
  ) {
      // On lance l'authentification avec passport.js
      passport.authenticate("local", (erreur, user, info) => {
          if (erreur) {
              // S'il y a une erreur, on la passe
              // au serveur
              next(erreur);
          } else if (!user) {
              // Si la connexion échoue, on envoit
              // l'information au client avec un code
              // 401 (Unauthorized)
              response.status(401).json(info);
          } else {
              // Si tout fonctionne, on ajoute
              // l'utilisateur dans la session et
              // on retourne un code 200 (OK)
              request.logIn(user, (erreur) => {
                  if (erreur) {
                      next(erreur);
                  }
                  // On ajoute l'utilisateur dans la session
                  if (!request.session.user) {
                      request.session.user = user;
                  }
                  response.status(200).json({
                      message: "Connexion réussie",
                      user,
                  });
              });
          }
      })(request, response, next);
  } else {
      response.status(400).json({
          error: "Email ou mot de passe invalide",
      });
  }
});

//Route pour ajouter un utilisateur
router.post("/inscription", async (request, response) => {
  try {
      const { email, password, username, type} = request.body;
      const user = await addUser(email, password, username, type);
      return response.status(200).json({
          user,
          message: "Utilisateur ajouté avec succès",
      });
  } catch (error) {
    console.error("Erreur d'inscription :", error);
      if (error.code === "P2002") {
          return response.status(400).json({
              error: "L'email existe déjà.",
          });
      }
      return response.status(400).json({ error: error.message });
  }
});


//Route deconnexion
router.post("/deconnexion", (request, response) => {
  //Protection de la route
  if (!request.session.user) {
      response.status(401).end();
      return;
  }
  // Déconnecter l'utilisateur
  request.logOut((erreur) => {
      if (erreur) {
          next(erreur);
      }
      // Rediriger l'utilisateur vers une autre page
      response.redirect("/");
  });
});


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
