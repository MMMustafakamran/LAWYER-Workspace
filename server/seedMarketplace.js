const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyItems = [
    {
        name: "Professional Legal Template Pack",
        description: "A comprehensive collection of 50+ legal templates for contracts, NDAs, and agreements.",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=300",
        status: "AVAILABLE"
    },
    {
        name: "Starting a Law Firm Guide",
        description: "Step-by-step ebook on how to start and scale your own law practice.",
        price: 24.50,
        imageUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=300&h=300",
        status: "AVAILABLE"
    },
    {
        name: "Civil Procedure Code Commentary",
        description: "Detailed commentary and case law references for Civil Procedure Code.",
        price: 89.00,
        imageUrl: "https://images.unsplash.com/photo-1589578527966-8178aed78309?auto=format&fit=crop&q=80&w=300&h=300",
        status: "AVAILABLE"
    },
    {
        name: "Legal Office Stationery Set",
        description: "Premium quality letterheads, envelopes, and business cards template.",
        price: 35.00,
        imageUrl: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&q=80&w=300&h=300",
        status: "AVAILABLE"
    },
    {
        name: "Corporate Law Handbook",
        description: "Essential handbook for corporate lawyers covering mergers, acquisitions, and compliance.",
        price: 55.00,
        imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=300&h=300",
        status: "AVAILABLE"
    }
];

async function main() {
    console.log('Seeding marketplace...');

    // Find a seller to associate items with (e.g., Mustafa - userId 1)
    const seller = await prisma.user.findFirst({
        where: { role: 'LAWYER' }
    });

    if (!seller) {
        console.error('No lawyer found to assign dummy items to.');
        return;
    }

    console.log(`Assigning items to seller: ${seller.name}`);

    for (const item of dummyItems) {
        await prisma.marketplaceItem.create({
            data: {
                ...item,
                sellerId: seller.id
            }
        });
    }

    console.log('Dummy items added successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
