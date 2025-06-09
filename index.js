// login/script.js

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Elementos do formulário de LOGIN
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginMessageElement = document.getElementById('loginMessage'); // Mensagens específicas para o login

// Elementos do formulário de REGISTRO
const registerForm = document.getElementById('registerForm');
const registerNameInput = document.getElementById('registerName');
const registerEmailInput = document.getElementById('registerEmail');
const cadCpfInput = document.getElementById('cad-cpf');
const cadDataNascInput = document.getElementById('cad-dataNasc');
const registerPasswordInput = document.getElementById('registerPassword');

const globalErrorMessage = document.getElementById('error-message'); // Mensagem global para o cadastro

// --- Funções Auxiliares para LocalStorage ---
// Obtém a lista de usuários do localStorage, ou um array vazio se não houver
const getRegisteredUsers = () => {
    try {
        const usersString = localStorage.getItem('registeredUsers');
        return usersString ? JSON.parse(usersString) : [];
    } catch (e) {
        console.error("Erro ao ler registeredUsers do localStorage:", e);
        return [];
    }
};

// Salva a lista de usuários no localStorage
const setRegisteredUsers = (usersArray) => {
    try {
        localStorage.setItem('registeredUsers', JSON.stringify(usersArray));
    } catch (e) {
        console.error("Erro ao salvar registeredUsers no localStorage:", e);
    }
};
// --- Fim das Funções Auxiliares ---


// Função para exibir mensagem de erro abaixo do input
function displayFieldError(inputElement, message) {
    const existingError = inputElement.nextElementSibling;
    if (existingError && existingError.classList.contains('field-error-message')) {
        existingError.remove();
    }

    if (message) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('field-error-message');
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
}

// Função para limpar todas as mensagens de erro de campo
function clearAllFieldErrors() {
    document.querySelectorAll('.field-error-message').forEach(el => el.remove());
    loginMessageElement.textContent = '';
    loginMessageElement.style.display = 'none';
    globalErrorMessage.textContent = '';
}

// (login/cadastro)
function showGeneralMessage(element, msg, type) {
    element.textContent = msg;
    element.className = type; 
    if (type === 'success') {
        element.style.color = 'green';
    } else if (type === 'error') {
        element.style.color = 'red';
    }
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}


// Função para validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

//validar CPF 
function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// Função para validar data de nascimento
function isValidDateOfBirth(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    // Verifica se a data é válida e não é futura
    return !isNaN(birthDate.getTime()) && birthDate < today;
}

// Event Listeners para alternar entre formulários
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
    clearAllFieldErrors(); 
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
    clearAllFieldErrors(); 
});

// --- Event Listener para o formulário de LOGIN ---
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão de recarregar a página

    clearAllFieldErrors(); // Limpa mensagens de erro anteriores

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    // Validações básicas para login
    if (!email || !password) {
        showGeneralMessage(loginMessageElement, 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showGeneralMessage(loginMessageElement, 'Por favor, insira um e-mail válido.', 'error');
        return;
    }

    // --- Autenticação contra usuários cadastrados no localStorage ---
    const registeredUsers = getRegisteredUsers(); // Obtém a lista de usuários do localStorage
    const foundUser = registeredUsers.find(user => user.email === email && user.password === password);

    if (foundUser) {
        
        localStorage.setItem('currentUser', JSON.stringify(foundUser.data));
        
        showGeneralMessage(loginMessageElement, 'Login bem-sucedido! Redirecionando...', 'success');
        
        
        setTimeout(() => {
            window.location.href = 'home.html'; 
        }, 500); 
        
    } else {
        showGeneralMessage(loginMessageElement, 'Email ou senha inválidos. Verifique seu email e senha e se você já fez o cadastro.', 'error');
    }
});


// Event Listener para o formulário de Cadastro
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    clearAllFieldErrors(); 

    let hasError = false;

    // Pega os valores dos campos de registro de novos cadastros!
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const cpf = cadCpfInput.value.trim();
    const dateOfBirth = cadDataNascInput.value.trim();
    const password = registerPasswordInput.value.trim();

    // Validação do campo Nome
    if (name === '') {
        displayFieldError(registerNameInput, 'O nome é obrigatório.');
        hasError = true;
    }

    // Validação de E-mail
    if (!isValidEmail(email)) {
        displayFieldError(registerEmailInput, 'Por favor, insira um e-mail válido.');
        hasError = true;
    }

    // Validação de CPF
    if (cpf === '') {
        displayFieldError(cadCpfInput, 'O CPF é obrigatório.');
        hasError = true;
    } else if (!isValidCPF(cpf)) {
        displayFieldError(cadCpfInput, 'Por favor, insira um CPF válido.');
        hasError = true;
    }

    // Validação de Data de Nascimento
    if (dateOfBirth === '') {
        displayFieldError(cadDataNascInput, 'A data de nascimento é obrigatória.');
        hasError = true;
    } else if (!isValidDateOfBirth(dateOfBirth)) {
        displayFieldError(cadDataNascInput, 'A data de nascimento não pode ser futura ou inválida.');
        hasError = true;
    }

    // Validação da Senha
    if (password === '') {
        displayFieldError(registerPasswordInput, 'A senha é obrigatória.');
        hasError = true;
    }

    // --- Verifica se o e-mail já está cadastrado antes de prosseguir com o novo cadastro ---
    const registeredUsers = getRegisteredUsers();
    const emailExists = registeredUsers.some(user => user.email === email);
    if (emailExists) {
        displayFieldError(registerEmailInput, 'Este e-mail já está cadastrado.');
        hasError = true;
    }

    if (hasError) {
        showGeneralMessage(globalErrorMessage, 'Por favor, corrija os erros nos campos.', 'error');
    } else {
        // Se todas as validações passarem e o e-mail não estiver em uso:
        const newUserData = {
            email: email,
            password: password,
            data: { // Salva os dados do perfil completo, similar ao exemplo anterior
                nome: name,
                email: email,
                cpf: cpf,
                dataNascimento: dateOfBirth,
                funcao: "Usuário", // Padrão para novos cadastros
                salario: "0.00"    // Padrão para novos cadastros
            }
        };

        registeredUsers.push(newUserData); // Adiciona o novo usuário à lista
        setRegisteredUsers(registeredUsers); // Salva a lista atualizada no localStorage

        showGeneralMessage(globalErrorMessage, 'Cadastro realizado com sucesso! Agora você pode fazer login.', 'success');
        
        // Opcional: Limpar campos após sucesso e/ou alternar para a aba de login
        registerNameInput.value = '';
        registerEmailInput.value = '';
        cadCpfInput.value = '';
        cadDataNascInput.value = '';
        registerPasswordInput.value = '';
        
        // Alterna para o painel de login após o cadastro bem-sucedido
        setTimeout(() => {
            container.classList.remove('active'); 
            clearAllFieldErrors(); // Limpa as mensagens após a transição
            showGeneralMessage(loginMessageElement, 'Faça login com seu novo usuário.', 'success');
        }, 1500); 
    }
});

// Adicionar máscaras para CPF e Data de Nascimento (opcional, mas melhora UX)
cadCpfInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    e.target.value = value;
});

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert("Login realizado com sucesso!");
        window.location.href = 'teste.html';
    } else {
        document.getElementById('loginMessage').style.display = 'block';
    }
});

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const cpf = document.getElementById('cad-cpf').value;
    const birthdate = document.getElementById('cad-dataNasc').value;
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
        document.getElementById('error-message').textContent = "Preencha todos os campos";
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userExists = users.some(u => u.email === email);

    if (userExists) {
        document.getElementById('error-message').textContent = "Este e-mail já está cadastrado.";
        return;
    }

    users.push({ name, email, cpf, birthdate, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert("Cadastro realizado com sucesso!");
    document.getElementById('error-message').textContent = "";
    document.getElementById('registerForm').reset();
});

//Sair da conta no perfil
localStorage.removeItem('currentUser');