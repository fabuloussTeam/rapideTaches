import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // Insérer un utilisateur
        const user = await prisma.user.create({
            data: {
                username: "nana",
                email: "nana@example.com",
                password: "nana123",
            },
        });
        console.log("Utilisateur créé :", user);

        // Insérer les statuts
        const statuses = await prisma.status.createMany({
            data: [
                { name: "À faire" },
                { name: "En cours" },
                { name: "En révision" },
                { name: "Terminé" },
            ],
        });
        console.log("Statuts créés :", statuses);

        // Insérer les priorités
        const priorities = await prisma.priority.createMany({
            data: [
                { name: "Faible" },
                { name: "Moyen" },
                { name: "Élevé" },
            ],
        });
        console.log("Priorités créées :", priorities);

        // Insérer une tâche (optionnel)
        const task = await prisma.task.create({
            data: {
                title: "Première tâche",
                description: "Ceci est une description de tâche.",
                priorityId: 1, 
                statusId: 1,   
                assignedToId: user.id, 
                dueDate: new Date("2023-12-31"),
            },
        });
        console.log("Tâche créée :", task);
    } catch (error) {
        console.error("Erreur lors de l'insertion des données :", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();