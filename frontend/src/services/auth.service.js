import axios from './root.service.js';
import cookies from 'js-cookie';
// Small local JWT decoder to avoid ESM interop issues with the jwt-decode package
function decodeJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode JWT', e);
        return null;
    }
}
import { convertirMinusculas } from '@helpers/formatData.js';

export async function login(dataUser) {
    try {
        const response = await axios.post('/auth/login', {
            email: dataUser.email, 
            password: dataUser.password
        });
        const httpStatus = response?.status;
        const respData = response?.data;
        if (httpStatus === 200) {
            // backend returns { status: 'Success', message, data: { token } }
            const token = respData?.data?.token;
            if (token) {
                const payload = decodeJwt(token);
                const { nombreCompleto, email, rut, rol } = payload || {};
                const userData = { nombreCompleto, email, rut, rol };
                sessionStorage.setItem('usuario', JSON.stringify(userData));
                // set default Authorization header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                // also store token in cookie for backend that expects it
                cookies.set('jwt-auth', token, { path: '/' });
            }
            return respData;
        }
    } catch (error) {
        return (error && error.response && error.response.data) || { status: 'Server error', message: error.message };
    }
}

export async function register(data) {
    try {
        const dataRegister = convertirMinusculas(data);
        const { nombreCompleto, email, rut, password } = dataRegister
        const response = await axios.post('/auth/register', {
            nombreCompleto,
            email,
            rut,
            password
        });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

export async function logout() {
    try {
        await axios.post('/auth/logout');
        sessionStorage.removeItem('usuario');
        cookies.remove('jwt');
        cookies.remove('jwt-auth');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}