// Seed script for MongoDB
require('dotenv').config({ path: './database_env.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Law = require('./src/models/Law');
const MarketplaceItem = require('./src/models/MarketplaceItem');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Law.deleteMany({});
        await MarketplaceItem.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const lawyer = await User.create({
            name: 'Ali Khan',
            email: 'lawyer@test.com',
            password: hashedPassword,
            role: 'LAWYER',
            phone: '03001234567',
            lawyerProfile: {
                specialization: 'Criminal',
                experience: 10,
                bio: 'Experienced criminal lawyer with 10 years of practice',
                location: 'Lahore',
                hourlyRate: 5000,
                rating: 4.5,
                reviewCount: 25
            }
        });
        console.log('Created lawyer:', lawyer.email);

        const lawyer2 = await User.create({
            name: 'Sara Ahmed',
            email: 'lawyer2@test.com',
            password: hashedPassword,
            role: 'LAWYER',
            phone: '03009876543',
            lawyerProfile: {
                specialization: 'Family',
                experience: 8,
                bio: 'Family law specialist helping families resolve disputes',
                location: 'Karachi',
                hourlyRate: 4000,
                rating: 4.8,
                reviewCount: 42
            }
        });
        console.log('Created lawyer:', lawyer2.email);

        const client = await User.create({
            name: 'Ahmed Hassan',
            email: 'client@test.com',
            password: hashedPassword,
            role: 'LITIGANT',
            phone: '03111234567'
        });
        console.log('Created client:', client.email);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'SYSTEM_ADMIN',
            phone: '03211234567'
        });
        console.log('Created admin:', admin.email);

        // Seed laws
        await Law.insertMany([
            {
                title: 'Pakistan Penal Code (PPC)',
                description: 'The primary criminal code of Pakistan.',
                category: 'Criminal',
                content: 'The Pakistan Penal Code (PPC) is a penal code for all offences charged in Pakistan. It was originally prepared by Lord Macaulay in 1860.'
            },
            {
                title: 'Code of Civil Procedure (CPC)',
                description: 'Procedural law for administration of civil proceedings.',
                category: 'Civil',
                content: 'The Code of Civil Procedure, 1908 is a procedural law related to the administration of civil proceedings in Pakistan.'
            },
            {
                title: 'Companies Act 2017',
                description: 'Law governing companies in Pakistan.',
                category: 'Corporate',
                content: 'An Act to reform and re-enact the law relating to companies and for matters connected therewith.'
            },
            {
                title: 'Family Courts Act 1964',
                description: 'Law relating to Family Courts.',
                category: 'Family',
                content: 'An Act to make provision for the establishment of Family Courts for the expeditious settlement of family disputes.'
            }
        ]);
        console.log('Seeded 4 laws');

        // Seed marketplace items
        await MarketplaceItem.insertMany([
            {
                name: 'Legal Document Templates Bundle',
                description: 'Complete set of legal document templates for lawyers',
                price: 2500,
                imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
                status: 'AVAILABLE',
                sellerId: lawyer._id
            },
            {
                name: 'Law Books Collection',
                description: 'Essential law books for Pakistani legal system',
                price: 8000,
                imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
                status: 'AVAILABLE',
                sellerId: lawyer._id
            },
            {
                name: 'Lawyer Briefcase',
                description: 'Premium leather briefcase for professionals',
                price: 15000,
                imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                status: 'AVAILABLE',
                sellerId: lawyer2._id
            }
        ]);
        console.log('Seeded 3 marketplace items');

        console.log('\n✅ Database seeded successfully!');
        console.log('\n--- Test Credentials ---');
        console.log('Lawyer: lawyer@test.com / password123');
        console.log('Lawyer 2: lawyer2@test.com / password123');
        console.log('Client: client@test.com / password123');
        console.log('Admin: admin@test.com / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
