document.addEventListener('DOMContentLoaded', () => {
    const statusSelects = document.querySelectorAll('.status-select');

    statusSelects.forEach(select => {
        select.addEventListener('change', async (event) => {
            const taskId = event.target.dataset.taskId;
            const newStatus = event.target.value;
            const taskElement = event.target.closest('li'); 

            try {
                const response = await fetch(`/update-status/${taskId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const newColumn = document.querySelector(`#column-${data.status.toLowerCase().replace(/ /g, '-')}`);
                    if (newColumn) {
                        const taskList = newColumn.querySelector('ul');
                        taskList.appendChild(taskElement); // Déplacer la tâche
                    } else {
                        console.error('Colonne non trouvée pour le statut:', data.status);
                    }
                } else {
                    console.error('Erreur lors de la mise à jour du statut');
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        });
    });
});
