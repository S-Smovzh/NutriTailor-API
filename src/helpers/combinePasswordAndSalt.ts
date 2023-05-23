const combinePasswordAndSalt = (password: string, salt: string) => {
  let result = '';
  const maxLength = Math.max(password.length, salt.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < password.length) {
      result += password.charAt(i);
    }
    if (i < salt.length) {
      result += salt.charAt(i);
    }
  }

  return result;
};

export { combinePasswordAndSalt };
