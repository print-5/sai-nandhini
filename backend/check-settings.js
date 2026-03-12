import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sainandhini';

console.log('Connecting to:', MONGODB_URI.split('@')[1] || MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        const settings = await Settings.findOne();
        
        if (settings) {
            console.log('\n=== Settings Document Found ===');
            console.log('Shop Name:', settings.shopName);
            console.log('Logo:', settings.logo || '(empty)');
            console.log('Logo length:', settings.logo ? settings.logo.length : 0);
            console.log('Favicon:', settings.favicon || '(empty)');
            console.log('\nFull document:');
            console.log(JSON.stringify(settings, null, 2));
        } else {
            console.log('\n=== No Settings Document Found ===');
            console.log('Creating default settings...');
            const newSettings = await Settings.create({
                shopName: 'Sai Nandhini Tasty World',
                contactEmail: 'info@sainandhini.com',
                contactPhone: '+91 96009 16065'
            });
            console.log('Created:', newSettings);
        }
        
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
