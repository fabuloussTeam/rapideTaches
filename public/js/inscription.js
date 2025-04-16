const form = document.getElementById('new-compte');
const inputNom = document.getElementById('input-nom');
const inputCourriel = document.getElementById('input-courriel');
const inputMotDePasse = document.getElementById('input-motdepasse');
const inputType = document.getElementById('type');
const erreurAuth = document.getElementById('erreur-auth');

// Validation du formulaire
function isFormulaireValid() {
    let erreur = false;

    // Validation courriel
    if (inputCourriel.validity.valueMissing || inputCourriel.validity.typeMismatch) {
        erreur = true;
        inputCourriel.classList.add('erreur');
    } else {
        inputCourriel.classList.remove('erreur');
    }

    // Validation mot de passe
    if (inputMotDePasse.value.length < 8) {
        erreur = true;
        inputMotDePasse.classList.add('erreur');
    } else {
        inputMotDePasse.classList.remove('erreur');
    }

    // Validation nom
    if (inputNom.value.trim() === '') {
        erreur = true;
        inputNom.classList.add('erreur');
    } else {
        inputNom.classList.remove('erreur');
    }

    // Validation type
    if (inputType.value === '') {
        erreur = true;
        inputType.classList.add('erreur');
    } else {
        inputType.classList.remove('erreur');
    }

    return !erreur;
}

// Gestion soumission
async function inscription(event) {
    event.preventDefault();

    if (!isFormulaireValid()) {
        erreurAuth.innerText = "Veuillez corriger les erreurs du formulaire.";
        return;
    }

    const data = {
        username: inputNom.value,
        email: inputCourriel.value,
        password: inputMotDePasse.value,
        type: inputType.value
    };

    try {
        const response = await fetch("/inscription", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Si l'authentification est réussi, on
           // redirige vers une autre page
            location.href = '/connexion';
        } else if (response.status === 409) {
            erreurAuth.innerText = 'Un compte avec ce courriel existe déjà.';
        } else {
            erreurAuth.innerText = 'Une erreur est survenue. Veuillez réessayer.';
        }
    } catch (err) {
        console.error(err);
        erreurAuth.innerText = 'Erreur de connexion au serveur.';
    }
}

form.addEventListener('submit', inscription);
