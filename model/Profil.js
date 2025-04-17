import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import bcrypt from "bcrypt";

// Fonction pour valider l'ID
const isIdValid = (id) => !isNaN(id) && id > 0;

// Fonction pour récupérer l'utilisateur par ID
export const getuserById = async (id) => {
    try {
        // Validation de l'ID
        if (!isIdValid(id)) {
            throw new Error("ID invalide");
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
            },
        });
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }

        return user;

    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        throw new Error("Impossible de récupérer l'utilisateur");
    }
};

// Pour recuperer un utilisateur par son email
export const getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    return user;
};

//Pour ajouter un utilisateur avec email, mot de passe et nom
export const addUser = async (email, password, username, type) => {
    const user = await prisma.user.create({
        data: {
            email,
            password: await bcrypt.hash(password, 10),
            username,
            type,
        },
    });
    return user;
};





