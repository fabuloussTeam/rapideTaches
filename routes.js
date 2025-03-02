import { Router } from "express";
import { addTodo, getTodos, updateTodo } from "./model/todo.js";

const router = Router();

//Definition des routes

// Route pour la page d'accueil
router.get("/", async (request, response) => {
    response.render("index", {
        titre: "Accueil",
        styles: ["./css/style.css", "./css/index.css"],
        scripts: ["./js/main.js"],
        todos: await getTodos(),
    });
});

// Route pour la page de documentation
router.get("/documents", (request, response) => {
    response.render("documents", {
        titre: "Documents",
        styles: ["./css/style.css", "./css/documents.css"],
        scripts: ["./js/main.js"],
    });
});

// Route pour obtenir la liste des taches
router.get("/api/todos", async (request, response) => {
    try {
        const todos = await getTodos();
        return response.status(200).json(todos);
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

// Route pour ajouter une tache
router.post("/api/todo", async (request, response) => {
    try {
        const { description } = request.body;
        const todo = await addTodo(description);
        return response
            .status(200)
            .json({ todo, message: "Tache ajoutée avec succès" });
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

// Route pour mettre à jour une tache
router.patch("/api/todo/:id", async (request, response) => {
    try {
        const id = parseInt(request.params.id);
        const todo = await updateTodo(id);
        return response
            .status(200)
            .json({ todo, message: "Tache mise à jour avec succès" });
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

//Route pour mettre a jour une tache en utilisant la methode PUT avec query
router.put("/api/todo", async (request, response) => {
    try {
        const id = parseInt(request.query.id);
        const todo = await updateTodo(id);
        return response
            .status(200)
            .json({ todo, message: "Tache mise à jour avec succès" });
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
});

export default router;
