
document.getElementById('edit-task-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('status').value;
    const dueDate = document.getElementById('dueDate').value;
    const assignedTo = document.getElementById('assignedTo').value;
   // const changeDescription = document.getElementById('changeDescription').value;
    const modifiedById = 1; 

  //validation
  
    if (!title || title.length < 5 || title.length > 20) {
      errors.push("Le titre doit contenir entre 5 et 20 caractères.");
  }
  if (!description || description.length < 5 || description.length > 100) {
      errors.push("La description doit contenir entre 5 et 100 caractères.");
  }
  if (!priority) {
      errors.push("La priorité est obligatoire.");
  }
  if (!status) {
      errors.push("Le statut est obligatoire.");
  }
  if (!dueDate) {
      errors.push("La date d'échéance est obligatoire.");
  } else if (isNaN(Date.parse(dueDate))) {
      errors.push("La date d'échéance n'est pas valide.");
  }
  if (!assignedTo) {
      errors.push("L'attribution est obligatoire.");
  }

    const taskData = {
        id: taskId,
        title: title,
        description: description,
        priorityId: parseInt(priority),
        statusId: parseInt(status),
        dueDate: dueDate,
        assignedToId: parseInt(assignedTo),
        changeDescription: "Mise à jour",
        modifiedById: modifiedById,
    };

    console.log('Données envoyées :', taskData);

    try {
        const response = await fetch(`/api/task?id=${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        const result = await response.json();
        if (response.ok) {
          console.log("Tâche mise à jour :", result);
          window.location.href = "/Profil"; 
        } else {
          console.error("Erreur serveur :", result);
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    });