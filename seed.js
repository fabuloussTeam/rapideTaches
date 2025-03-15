import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const statuses = [
        { name: "À faire" },
        { name: "En cours" },
        { name: "En révision" },
        { name: "Terminée" },
    ];

    for (const status of statuses) {
        await prisma.status.upsert({
            where: { name: status.name },
            update: {},
            create: status,
        });
    }

    console.log("Statuts par défaut insérés avec succès.");
}

main()
    .catch((e) => {
        console.error("Erreur lors de l'insertion des statuts:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });