const todoInput = document.getElementById("todo-input");
const errorInput = document.getElementById("error-input");

export const validateDescription = () => {
    if (todoInput.validity.valid) {
        errorInput.innerText = "";
        return true;
    } else {
        if (todoInput.validity.valueMissing) {
            errorInput.innerText = "Champ obligatoire";
            return false;
        } else {
            if (todoInput.validity.tooShort) {
                errorInput.innerText =
                    "La description doit contenir au moins 5 caractères";
                return false;
            }
        }
    }
};

export const isEmailValid = (email) =>{
    const emailInput = document.getElementById("email-input");
    const errorEmail = document.getElementById("error-email");

    if (emailInput.validity.valid) {
        errorEmail.innerText = "";
        return true;
    } else {
        if (emailInput.validity.valueMissing) {
            errorEmail.innerText = "Champ obligatoire";
            return false;
        } else {
            if (emailInput.validity.typeMismatch) {
                errorEmail.innerText = "Adresse email invalide";
                return false;
            }
        }
    }
    return true;
}

export const isPasswordValid = (password) => {
    const passwordInput = document.getElementById("password-input");
    const errorPassword = document.getElementById("error-password");

    if (passwordInput.validity.valid) {
        errorPassword.innerText = "";
        return true;
    } else {
        if (passwordInput.validity.valueMissing) {
            errorPassword.innerText = "Champ obligatoire";
            return false;
        } else {
            if (passwordInput.validity.tooShort) {
                errorPassword.innerText =
                    "Le mot de passe doit contenir au moins 8 caractères";
                return false;
            }
        }
    }
};
