import Cookies from 'universal-cookie';

export const getCookie = (name) => {
    const cookies = new Cookies();
    return cookies.get(name);
};