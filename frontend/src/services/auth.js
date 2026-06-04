const USER_KEY = 'user';

export const getCurrentUser = () => {
  const storedUser = sessionStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user) => {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  sessionStorage.removeItem(USER_KEY);
};