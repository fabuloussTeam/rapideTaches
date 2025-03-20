
Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('formatDate', function (date) {
    if (!date) return '';
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return formattedDate;
});

// Fonction pour afficher les tâches
async function displayTasks() {
    try {
        // Compiler le template Handlebars
        const templateSource = document.getElementById('task-template').innerHTML;
        const template = Handlebars.compile(templateSource);

        // Passer les données au template
        const html = template({ tasks: window.tasks }); // Utilisez les tâches transmises par le serveur

        // Afficher le template dans l'interface utilisateur
        const taskBoard = document.getElementById('task-board');
        taskBoard.innerHTML = html;
    } catch (error) {
        console.error("Erreur lors de l'affichage des tâches :", error);
        alert("Une erreur s'est produite lors de la récupération des tâches.");
    }
}

// Appeler la fonction pour afficher les tâches au chargement de la page
document.addEventListener('DOMContentLoaded', displayTasks);