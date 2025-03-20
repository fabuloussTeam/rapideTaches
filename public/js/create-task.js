document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-task-form');
    const inputs = form.querySelectorAll('input[type=text], textarea, select');

    function isFormulaireValid() {
        let erreur = false;

        // Validation du champ titre
        if (form.elements['title'].validity.valueMissing || 
            form.elements['title'].validity.tooShort ||
            form.elements['title'].validity.tooLong
        ) {
            erreur = true;
            form.elements['title'].classList.add('erreur');
        } else {
            form.elements['title'].classList.remove('erreur');
        }

        // Validation du champ date limite
        if (form.elements['dueDate'].validity.valueMissing) {
            erreur = true;
            form.elements['dueDate'].classList.add('erreur');
        } else {
            form.elements['dueDate'].classList.remove('erreur');
        }

        return !erreur;
    }

    function prepareDonnee() {
        const title = form.elements['title'].value;
        const description = form.elements['description'].value;
        const priorityId = parseInt(form.elements['priority'].value); 
        const statusId = parseInt(form.elements['status'].value);    
        const dueDate = form.elements['dueDate'].value;
        const assignedToId = parseInt(form.elements['assignedTo'].value);

        return {
            title,
            description,
            priorityId,
            statusId,
            assignedToId,
            dueDate: new Date(dueDate), // Convertir en objet Date
        };
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validation du formulaire
        if (!isFormulaireValid()) {
            return;
        }

        // Préparer les données
        const data = prepareDonnee();

        // Envoyer la requête au serveur
        try {
            const response = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            // Redirection à la page d'accueil si tout a bien fonctionné
            if (response.ok) {
                location.href = '/';
            } else {
                const errorData = await response.json();
                console.error("Erreur du serveur :", errorData.error);
                alert("Erreur lors de l'ajout de la tâche : " + errorData.error);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de la requête :", error);
            alert("Une erreur s'est produite lors de l'envoi de la requête.");
        }
    });
});