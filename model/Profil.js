import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fonction pour valider l'ID
const isIdValid = (id) => !isNaN(id) && id > 0;

// Fonction pour récupérer l'utilisateur par ID
export const getuserById = async (id) => {
    try {
        // Validation de l'ID
        if (!isIdValid(id)) {
            throw new Error("ID invalide");
        }

        // Récupération de l'utilisateur depuis la base de données (exemple avec Prisma)
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });

        // Si aucun utilisateur n'est trouvé
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        return user;

    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        throw new Error("Impossible de récupérer l'utilisateur");
    }
};





