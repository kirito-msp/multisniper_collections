const express = require('express');
const { ethers } = require('ethers');
const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('../config.json');
const router = express.Router();

// MongoDB Schema for Wallets
const walletSchema = new mongoose.Schema({
    apiKey: { type: String, required: true, unique: true },
    wallets: [{
        address: { type: String, required: true },
        encryptedPrivateKey: { type: String, required: true },
        mnemonic: { type: String }, // Optional: consider not storing it
    }]
});

const Wallet = mongoose.model('Wallet', walletSchema);

// Middleware to check API key
const checkApiKey = (req, res, next) => {
    const { apikey } = req.query;
    if (!config.api.apikey.includes(apikey)) {
        return res.status(403).json({
            success: false,
            message: 'INVALID API KEY',
        });
    }
    req.apiKey = apikey;
    next();
};

// Helper functions to encrypt and decrypt the private key
const encryptPrivateKey = (privateKey, password) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32); // Derive a key from the password
    const iv = crypto.randomBytes(16); // Initialization vector

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV with the encrypted data for storage
    return iv.toString('hex') + ':' + encrypted;
};

const decryptPrivateKey = (encryptedPrivateKey, password) => {
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);

        // Split the IV and the encrypted data
        const [ivHex, encrypted] = encryptedPrivateKey.split(':');
        const iv = Buffer.from(ivHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error('Invalid password or decryption failed');
    }
};

// Create a new Ethereum wallet with password encryption for the private key
router.post('/create', checkApiKey, async (req, res) => {
    const { password } = req.query;
    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required to create a wallet',
        });
    }

    try {
        const wallet = ethers.Wallet.createRandom();
        const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey, password);
        
        // Store wallet in MongoDB under the user's API key
        const existingWalletRecord = await Wallet.findOne({ apiKey: req.apiKey });

        const walletData = {
            address: wallet.address,
            encryptedPrivateKey,
            mnemonic: wallet.mnemonic.phrase, // Optional, consider not storing for security
        };

        if (existingWalletRecord) {
            // Add to the existing wallets for the API key
            existingWalletRecord.wallets.push(walletData);
            await existingWalletRecord.save();
        } else {
            // Create a new wallet record for the API key
            const newWalletRecord = new Wallet({
                apiKey: req.apiKey,
                wallets: [walletData]
            });
            await newWalletRecord.save();
        }

        res.status(201).json({
            success: true,
            message: 'Wallet created successfully',
            data: {
                address: wallet.address,
                mnemonic: wallet.mnemonic.phrase, // Optional, consider removing this for security
            }
        });
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({
            success: false,
            message: 'SERVER ERROR',
            error: error.message,
        });
    }
});

// Delete a wallet (requires confirmation)
router.delete('/delete', checkApiKey, async (req, res) => {
    const { address, confirmation } = req.query;

    if (!confirmation || confirmation !== 'CONFIRM_DELETE') {
        return res.status(400).json({
            success: false,
            message: 'Confirmation required to delete wallet',
        });
    }

    try {
        const walletRecord = await Wallet.findOne({ apiKey: req.apiKey });
        if (!walletRecord) {
            return res.status(404).json({
                success: false,
                message: 'Wallet record not found',
            });
        }

        // Filter out the wallet with the provided address
        walletRecord.wallets = walletRecord.wallets.filter(wallet => wallet.address !== address);

        await walletRecord.save();

        res.status(200).json({
            success: true,
            message: `Wallet ${address} deleted successfully`,
        });
    } catch (error) {
        console.error('Error deleting wallet:', error);
        res.status(500).json({
            success: false,
            message: 'SERVER ERROR',
            error: error.message,
        });
    }
});

// Get wallet balance
router.get('/balance', checkApiKey, async (req, res) => {
    const { address, network } = req.query;
    
    try {
        const walletRecord = await Wallet.findOne({ apiKey: req.apiKey });
        if (!walletRecord || !walletRecord.wallets.some(wallet => wallet.address === address)) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found',
            });
        }

        const provider = new ethers.providers.JsonRpcProvider(config.rpcUrls[network] || config.rpcUrls.default);
        const balance = await provider.getBalance(address);

        res.status(200).json({
            success: true,
            message: 'Balance fetched successfully',
            data: {
                address,
                balance: ethers.utils.formatEther(balance),
            }
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({
            success: false,
            message: 'SERVER ERROR',
            error: error.message,
        });
    }
});

// Execute a transaction (send Ether)
router.post('/execute', checkApiKey, async (req, res) => {
    const { from, to, amount, password, network } = req.query;

    try {
        const walletRecord = await Wallet.findOne({ apiKey: req.apiKey });
        const walletData = walletRecord.wallets.find(wallet => wallet.address === from);

        if (!walletData) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found',
            });
        }

        // Decrypt the private key using the provided password
        const privateKey = decryptPrivateKey(walletData.encryptedPrivateKey, password);
        const provider = new ethers.providers.JsonRpcProvider(config.rpcUrls[network] || config.rpcUrls.default);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Create and send transaction
        const tx = {
            to,
            value: ethers.utils.parseEther(amount),
            gasLimit: 21000, // Standard for sending Ether
        };
        const transaction = await wallet.sendTransaction(tx);
        await transaction.wait();

        res.status(200).json({
            success: true,
            message: 'Transaction executed successfully',
            data: {
                txHash: transaction.hash,
            }
        });
    } catch (error) {
        console.error('Error executing transaction:', error);
        res.status(500).json({
            success: false,
            message: 'SERVER ERROR',
            error: error.message,
        });
    }
});

// Show private key (requires password)
router.post('/showPrivateKey', checkApiKey, async (req, res) => {
    const { address, password } = req.query;

    try {
        const walletRecord = await Wallet.findOne({ apiKey: req.apiKey });
        const walletData = walletRecord.wallets.find(wallet => wallet.address === address);

        if (!walletData) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found',
            });
        }

        // Decrypt the private key using the provided password
        const privateKey = decryptPrivateKey(walletData.encryptedPrivateKey, password);

        res.status(200).json({
            success: true,
            message: 'Private key fetched successfully',
            data: {
                privateKey,
            }
        });
    } catch (error) {
        console.error('Error showing private key:', error);
        res.status(400).json({
            success: false,
            message: 'Invalid password or other error',
            error: error.message,
        });
    }
});

router.post('/showAllWallets', checkApiKey, async (req, res) => {
    try {
        // Find the wallet record using the API key
        const walletsRecord = await Wallet.findOne({ apiKey: req.apiKey });

        // Check if there are any wallets for this API key
        if (!walletsRecord || walletsRecord.wallets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No wallets found for this API key',
            });
        }

        // Extract all wallet addresses
        const walletAddresses = walletsRecord.wallets.map(wallet => wallet.address);

        // Return the list of wallet addresses
        return res.status(200).json({
            success: true,
            message: 'Wallet addresses retrieved successfully',
            data: {
                addresses: walletAddresses
            }
        });
    } catch (error) {
        console.error('Error fetching wallet addresses:', error);
        return res.status(500).json({
            success: false,
            message: 'SERVER ERROR',
            error: error.message
        });
    }
});


module.exports = router;
