const express = require('express');
const { PrismaClient } = require('../prisma/prisma/generated/prisma-client-js');
const { generateToken , generateMailToken} = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/hash');
const {transporter} = require('../utils/mail');
const {domain, port} = require('../utils/domain');

const router = express.Router();
const prisma = new PrismaClient();

// Register route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await hashPassword(password);

    try {
        const mailToken = generateMailToken({ username, email });
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                role: 1, // Set role to 1 by default
                Isverify: false,
                verifyToken: mailToken,
            },
        });

        // const mailToken = generateMailToken(user);
        const verifyTokenURL = `http://${domain}:${port}/verify/${mailToken}`;

        const mailContext = {
            from: '"autoreply" <csappkmutnb@gmail.com>', // sender address
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
    // console.log(username,password);
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

// forgot password
router.post('/forgot-password', async (req, res) => {
    const { username, email } = req.body;

    try {
        // Find the user by both username and email
        const user = await prisma.user.findFirst({
            where: {
                username: username,
                email: email
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found or email mismatch' });
        }

        // Generate a password reset token
        const resetToken = generateMailToken({ username: user.username, email: user.email });

        // Update the user with the reset token
        await prisma.user.update({
            where: { username },
            data: { verifyToken: resetToken } // Save the token in the user's record
        });

        const resetURL = `http://${domain}:${81}/reset-password/${resetToken}`;

        // Send the email with the password reset link
        const mailContext = {
            from: '"autoreply" <dummy.forcsapp@hotmail.com>', // sender address
            to: email, // recipient address
            subject: "CS APP Reset your password", // Subject line
            text: "", // plain text body
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
                <p style="font-size: 24px; color: #333; font-weight: 500;">CS APP</p>
                <h1>Reset your password</h1>
                <p style="font-size: 14px; color: #333; font-weight: 400;">
                  You requested to reset your password. Please click the button below to reset your password.
                </p>
                <a href="${resetURL}" style="padding: 10px 20px; background-color:rgb(21, 62, 207); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
            `,
        };

        // Send the password reset email
        await transporter.sendMail(mailContext);

        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Error during password reset request:', error);
        res.status(400).json({ error: 'Password reset request failed', details: error.message });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // console.log(req.body);
    // console.log(newPassword);
    // console.log('----------------reset password-------------------');
    // console.log("reset-password token: " + token);
    try {
        // Find the user based on the reset token
        const user = await prisma.user.findFirst({
            where: { verifyToken: token }
        });
        // console.log(user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const {username} = user;
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        // Update the user's password and clear the reset token
        await prisma.user.update({
            where: { username },
            data: {
                password: hashedPassword,
            },
        });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        // console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Password reset failed', details: error.message });
    }
});



module.exports = router;