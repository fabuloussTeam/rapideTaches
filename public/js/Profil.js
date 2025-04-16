/*window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="button"]').forEach(bouton => {
        bouton.addEventListener('click', async function(event) {
            const taskId = event.currentTarget.dataset.id;
            console.log(`ID de la tâche à supprimer: ${taskId}`);

            if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                const response = await fetch(`/api/task/${taskId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    // Ici ça va marcher car le bouton est bien dans un <li>
                    const parentLi = event.currentTarget.closest('li');

                    if (parentLi) {
                        parentLi.remove();
                        alert('Tâche supprimée avec succès!');
                    } else {
                        console.warn('Aucun <li> parent trouvé');
                    }
                } else {
                    alert('Erreur lors de la suppression.');
                }
            }
        });
    });
});*/

window.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('ul');

    // Écouteur délégué sur le parent <ul>
    taskList.addEventListener('click', async function(event) {
        if (event.target.matches('input[type="button"]')) {
            const taskId = event.target.dataset.id;
            console.log(`ID de la tâche à supprimer: ${taskId}`);

            if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                const response = await fetch(`/api/task/${taskId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    const parentLi = event.target.closest('li');
                    if (parentLi) {
                        // Ajout d'une classe pour l'effet fade-out
                        parentLi.classList.add('fade-out');
                        setTimeout(() => {
                            parentLi.remove();
                        }, 500); 
                    }
                } else {
                    alert('Erreur lors de la suppression.');
                }
            }
        }
    });
});
