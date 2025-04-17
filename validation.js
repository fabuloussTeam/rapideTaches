export const isIdValid = (id) =>
    typeof id === 'number' &&
    Number.isFinite(id); 
     
export const validateDescription = (description) =>
        description &&
        typeof description === "string" &&
        description.length >= 5 &&
        description.length <= 100;

export const validateTitre = (  title ) =>
            title  &&
            typeof   title  === "string" &&
            title .length >= 5 &&
            title .length <= 20;   

            // verifier si l'email est valide
export const isEmailValid = (email) =>
    email &&
    typeof email === "string" &&
    email.length >= 5 &&
    email.length <= 50 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 
// verifier si le password est valide
export const isPasswordValid = (password) =>
    password &&
    typeof password === "string" &&
    password.length >= 4 &&
    password.length <= 16;