// importer ler client prisma
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Afficher la liste des taches
export const getTasks = async () => {
    const tasks = await prisma.task.findMany({
        include: { user: true }, // Inclure les informations de l'utilisateur
    });
    const users = await prisma.user.findMany(); // Récupérer tous les utilisateurs
    res.render('index', { tasks, users });
};
