const express = require('express');
const { PrismaClient } = require('./prisma/prisma/generated/prisma-client-js');
const { generateToken , generateMailToken} = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/hash');
const {transporter} = require('../utils/mail');
const {domain} = require('../utils/domain');

const router = express.Router();
const prisma = new PrismaClient();

// Register route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                role: 1, // Set role to 1 by default
                Isverify: false,
                verifyToken: null,
            },
        });

        const mailToken = generateMailToken(user);
        const verifyTokenURL = `http://${domain}/verify/${mailToken}`;

        const mailContext = {
            from: '"autoreply" <example@email.com>', // sender address
            to: email, // list of receivers
            subject: "CS APP Verify your email", // Subject line
            text: "", // plain text body
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
                <p style="font-size: 24px; color: #333; font-weight: 500;">CS APP</p>
                <h1 style="">Verify your email</h1>
                <p style="font-size: 14px; color: #333; font-weight: 400;">
                  Verify your email before using CSAPP. Please click the button below to confirm your email address.
                </p>
                <a href="${verifyTokenURL}" style="padding: 10px 20px; background-color:rgb(21, 62, 207); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Confirm Email
                </a>
              </div>
            `,
        };

        await transporter.sendMail(mailContext);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(400).json({ error: 'User registration failed', details: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username,password);
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (user && await comparePassword(password, user.password)) {
            const token = generateToken(user);
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Login failed'});
    }
});

module.exports = router;