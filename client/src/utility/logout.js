import Cookies from 'universal-cookie';

export const logout = (name) => {
    const cookies = new Cookies();
    window.location.reload()
    return cookies.remove(name);

};
