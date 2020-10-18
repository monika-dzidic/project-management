exports.isValidEmail = (email) => {
    if (!email) {
        return false;
    }
    return /\S+@\S+\.\S+/.test(email);
}

exports.isValidPassword = (password) => {
    return password.trim() && password.trim().length >= 5 ? true : false;
}
