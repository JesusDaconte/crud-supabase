
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginDiv = document.getElementById('login-form');
    const registerDiv = document.getElementById('register-form');

    // Alternar entre formularios
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginDiv.classList.add('hidden');
        registerDiv.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerDiv.classList.add('hidden');
        loginDiv.classList.remove('hidden');
    });

    // Manejar registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const { error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            alert(error.message);
        } else {
            alert('Registro exitoso! Revisa tu email para confirmar tu cuenta.');
            registerDiv.classList.add('hidden');
            loginDiv.classList.remove('hidden');
        }
    });

    // Manejar login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message);
        } else {
            window.location.href = 'index.html';
        }
    });

    // Verificar si el usuario ya está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'index.html';
        }
    });
});