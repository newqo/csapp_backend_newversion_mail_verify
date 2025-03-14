const express = require('express');
const app = express();
const { PrismaClient } = require('./prisma/prisma/generated/prisma-client-js');
const prisma = new PrismaClient();
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/auth');
const {jwt, secretKey} = require('./utils/jwt');
const {domain , port} = require('./utils/domain');
const cors = require('cors');

app.use(cors({
    origin: `http://${domain}:81`,
    methods: ['GET', 'POST'], 
}));

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World! Q');
  console.log('Received a request to the root endpoint');
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.$queryRaw`
            SELECT 
            Title, 
            Message, 
            type, 
            DATE_FORMAT(PostDate, '%d/%m/%Y') as PostDate
            FROM post
        `;
        
        const cleanMessagePosts = posts.map(post => {
            return {
              ...post,
              Message: post.Message
                ? post.Message
                    .replace(/<\/?[^>]+(>|$)/g, "")
                    .replace(/&nbsp;/g, " ")
                    .replace(/\r\n|\r|\n/g, " ")
                    .trim()
                : post.Message,
              img_url: `http://${domain}/DATA_From_Chiab/Image/IMG_SHOW/${post.Title}`,
            };
        });

        res.json(cleanMessagePosts);

        // res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts', detail: error.message });
    }
});

app.get('/user', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username: req.user.username }, // Use username instead of id
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/users/:username', async (req, res) => {
    let username = req.params.username;
    try {
        const user = await prisma.$queryRaw`SELECT * FROM user WHERE username=${username}`;
        
        res.json(user);
    }catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/verify/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const decoded = jwt.verify(token, secretKey);
        const { username, email } = decoded;
        console.log(decoded);

        const user = await prisma.user.findFirst({
            where: { username, email }
        });

        if (user) {
            await prisma.user.update({
                where: { username },
                data: { Isverify: true },
            });

            res.status(200).json({ message: 'Email verified successfully.' });
        } else {
            res.status(404).json({ message: 'User not found or email mismatch' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});


app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});