const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Determine a origem com base no ambiente
const allowedOrigins = ['*']; // Adapte para o seu domínio Ngrok
const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const dbPath = path.join(__dirname, 'public', 'database.db');
const db = new sqlite3.Database(dbPath);
const saltRounds = 10;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Remova a linha "let carrinho = [];" do início do arquivo.
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INT, username TEXT, password TEXT)");
  
    // Restante do código...
  
    // Exemplo de consulta para verificar se a tabela de usuários existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
      if (!row) {
        console.error('Tabela de usuários não encontrada no banco de dados.');
      } else {
        console.log('Tabela de usuários encontrada no banco de dados.');
      }
    });
})

function generateToken(userId) {
 const payload = { userId };
 const secret = 'your_jwt_secret';
 const options = { expiresIn: '1h' };

 return jwt.sign(payload, secret, options);
}
app.get('/check-email-availability', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'O parâmetro "email" é obrigatório.' });
    }

    try {
        const existingEmail = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        // Se o email existir, não está disponível; caso contrário, está disponível
        const available = !existingEmail;

        res.json({ available });
    } catch (error) {
        console.error('Erro ao verificar a disponibilidade do email:', error.message);
        res.status(500).json({ error: 'Erro interno ao verificar a disponibilidade do email.' });
    }
});

// Rota de cadastro de usuário
app.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    try {
        // Verificar se o nome de usuário já existe
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        // Verificar se o email já existe
        const existingEmail = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Nome de usuário já está sendo usado por outra pessoa.' });
        }

        if (existingEmail) {
            return res.status(400).json({ error: 'Email já está sendo usado por outra pessoa.' });
        }

        // Hash da senha e inserção no banco de dados
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.run('INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err) => {
            if (err) {
                console.error('Erro ao criar usuário:', err.message);
                return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
            }

            console.log('Usuário criado com sucesso!');
            res.json({ success: true });
        });
    } catch (error) {
        console.error('Erro ao criar usuário (catch):', error.message);
        return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/adicionar-ao-carrinho', (req, res) => {
    const { produto, preco } = req.body;
    carrinho.push({ produto, preco });
    res.json({ sucesso: true });
});

app.get('/carrinho', (req, res) => {
    res.json(carrinho);
});



// Rota para fazer login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    db.get('SELECT * FROM usuarios WHERE username = ?', [username], async (err, row) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao fazer login.' });
        }

        if (!row) {
            return res.status(401).json({ erro: 'Usuário não encontrado.' });
        }

        const match = await bcrypt.compare(password, row.password);

        if (!match) {
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        const token = generateToken(username);
        
        res.json({ sucesso: true, mensagem: 'Login realizado com sucesso.', token, username });

    });
});

app.get('/check-availability', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'O parâmetro "username" é obrigatório.' });
    }

    try {
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        // Se o usuário existir, não está disponível; caso contrário, está disponível
        const available = !existingUser;

        res.json({ available });
    } catch (error) {
        console.error('Erro ao verificar a disponibilidade do nome de usuário:', error.message);
        res.status(500).json({ error: 'Erro interno ao verificar a disponibilidade do nome de usuário.' });
    }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});