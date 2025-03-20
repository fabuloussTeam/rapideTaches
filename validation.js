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