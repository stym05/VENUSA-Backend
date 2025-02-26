

const isEmailValid = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

const validatePhonetNumber = (input) => {
    const str = input.toString();
    const regex = /^\d{10}$/;
    return regex.test(str);  
};


module.exports = {isEmailValid, validatePhonetNumber};