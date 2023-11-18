async function signup() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const email = document.getElementById('email');

    // Verificar a disponibilidade do nome de usuário antes de fazer o cadastro
    const availabilityResponse = await fetch(`http://localhost:3000/check-availability?username=${username.value}`);
    const availabilityData = await availabilityResponse.json();

    if (!availabilityData.available) {
        alert('Nome de usuário já está em uso. Por favor, escolha outro.');
        return;
    }

    // Se o nome de usuário estiver disponível, continuar com o cadastro
    const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.value, password: password.value, email: email.value }),
    });

    const data = await response.json();

    if (response.ok) {
        alert('Sucesso! Seu cadastro foi realizado.');
        window.location.href = 'esmaltes.html'; // Redireciona para esmaltes.html após o cadastro bem-sucedido
    } else {
        alert('Erro ao cadastrar. Verifique o email, o usuario e tente novamente');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Função para realizar o login
    
    async function login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Sucesso! Seu login foi bem-sucedido.');
            const clientUsername = data.username;
            localStorage.setItem('username', clientUsername);
            window.location.href = 'esmaltes.html';
        } else {
            const createAccount = confirm('Login mal sucedido. Criar uma conta?');
    
            if (createAccount) {
                window.location.href = 'signup.html';
            }
        }
    }
    

    // Função para verificar a disponibilidade do nome de usuário
    
    async function checkUsernameAvailability() {
        const usernameInput = document.getElementById('username');
        const availabilityMessage = document.getElementById('availability-message');
        const username = usernameInput.value;
    
        if (username.trim() === '') {
            setAvailabilityMessage('Digite um nome de usuário válido.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/check-availability?username=${username}`);
    
            if (!response.ok) {
                throw new Error(`Erro ao verificar a disponibilidade do nome de usuário. Status: ${response.status}`);
            }
    
            const availabilityData = await response.json();
    
            if (availabilityData.available) {
                setAvailabilityMessage('Nome de usuário disponível!');
            } else {
                setAvailabilityMessage('Nome de usuário já está em uso. Por favor, escolha outro.');
            }
        } catch (error) {
            console.error(`Erro ao verificar a disponibilidade do nome de usuário: ${error.message}`);
            setAvailabilityMessage('Erro ao verificar a disponibilidade. Tente novamente.');
        }
    }
    
    function setAvailabilityMessage(message) {
        const availabilityMessage = document.getElementById('availability-message');
        if (availabilityMessage) {
            availabilityMessage.textContent = message;
        } else {
            console.error('Elemento com o ID "availability-message" não encontrado no DOM.');
        }
    }
    
    // Adiciona um ouvinte de eventos para a entrada do nome de usuário (input)
    const usernameInput = document.getElementById('username');
    
    if (usernameInput) {
        usernameInput.addEventListener('input', checkUsernameAvailability);
    } else {
        console.error('Elemento com o ID "username" não encontrado no DOM.');
    }
    // Função para realizar o cadastro

    

    // ... (código existente)

    // Adiciona ouvintes de eventos para os formulários de login e signup
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            login(); // Chame a função login() quando o formulário for enviado
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
            event.preventDefault();
            signup(); // Chame a função signup() quando o formulário for enviado
        });
    }

let carrinho = [];

// Função para adicionar produtos ao carrinho
window.adicionarAoCarrinho = function (produto, preco) {
    carrinho.push({ produto, preco });
    exibirCarrinho();
    calcularTotal();
};

// Função para exibir o carrinho
function exibirCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    listaCarrinho.innerHTML = '';

    carrinho.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.produto} - R$${item.preco.toFixed(2)}`;
        listaCarrinho.appendChild(listItem);
    });
}

// Função para calcular o valor total
window.calcularTotal = function () {
    const totalValorElement = document.getElementById('total-valor');
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    totalValorElement.textContent = total.toFixed(2);
    return total; // Retornar o total para ser utilizado em outras partes do código
};

// Função para pagar e enviar mensagem via WhatsApp
window.pagar = function () {
    const username = localStorage.getItem('username');
    console.log('Nome de usuário recuperado:', username);
    const produtos = carrinho.map(item => `${item.produto} - R$${item.preco.toFixed(2)}`).join('%0A');
    const mensagem = `Olá, meu nome é ${username} e gostaria de comprar os seguintes produtos:%0A${produtos}%0ATotal: R$${calcularTotal().toFixed(2)}`;
    const linkWhatsapp = `https://api.whatsapp.com/send/?phone=556293771153&text=${mensagem}&type=phone_number&app_absent=0`;

    window.open(linkWhatsapp, '_blank');
};

    // ... (código existente)
});
// ... (código existente)

