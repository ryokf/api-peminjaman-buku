import { faker } from '@faker-js/faker';
import { prisma } from '../prisma/client.js';

async function main() {
    console.log('🌱 Starting seeding...');

    // Clean up existing data
    await prisma.reservation.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.writer.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleaned up existing data');

    // Create Writers
    const writers = await Promise.all(
        Array(20).fill().map(() =>
            prisma.writer.create({
                data: {
                    name: faker.person.fullName(),
                }
            })
        )
    );
    console.log('Created writers:', writers.length);

    // Create Categories with icons (using emoji as placeholders)
    const categoryData = [
        { category: 'Fiction', icon: '📚' },
        { category: 'Non-Fiction', icon: '📖' },
        { category: 'Science', icon: '🔬' },
        { category: 'Technology', icon: '💻' },
        { category: 'History', icon: '🏛️' },
        { category: 'Biography', icon: '👤' },
        { category: 'Children', icon: '🧸' },
        { category: 'Romance', icon: '💝' },
        { category: 'Mystery', icon: '🔍' },
        { category: 'Self-Help', icon: '🌟' }
    ];

    const categories = await Promise.all(
        categoryData.map(cat =>
            prisma.category.create({
                data: cat
            })
        )
    );
    console.log('Created categories:', categories.length);

    // Create Users (mix of staff and members)
    const users = await Promise.all(
        Array(50).fill().map((_, index) =>
            prisma.user.create({
                data: {
                    username: faker.person.firstName() + faker.number.int(1000),
                    email: faker.internet.email(),
                    password: faker.internet.password(), // In real app, this should be hashed
                    photo: faker.image.avatarGitHub(),
                    status: index < 10 ? 'staff' : 'member', // First 10 are staff
                    isBlacklist: Math.random() < 0.1, // 10% chance of being blacklisted,
                }
            })
        )
    );
    console.log('Created users:', users.length);

    // Create Books
    const languages = ['English', 'Indonesian', 'Spanish', 'French', 'German'];
    const books = await Promise.all(
        Array(200).fill().map(() => {
            const isAvailable = Math.random() < 0.7; // 70% chance of being available
            return prisma.book.create({
                data: {
                    title: faker.word.words(3), // Using 3 random words for titles
                    description: faker.lorem.paragraphs(2),
                    language: faker.helpers.arrayElement(languages),
                    photo: faker.image.url(),
                    isAvailable,
                    writerId: faker.helpers.arrayElement(writers).id,
                    categoryId: faker.helpers.arrayElement(categories).id,
                    ownerId: faker.helpers.arrayElement(users.filter(u => u.status === 'staff')).id,
                }
            });
        })
    );
    console.log('Created books:', books.length);

    // Create Loans (for books that are not available)
    const unavailableBooks = books.filter(b => !b.isAvailable);
    const loans = await Promise.all(
        unavailableBooks.map(book =>
            prisma.loan.create({
                data: {
                    bookId: book.id,
                    borrowerId: faker.helpers.arrayElement(users.filter(u => u.status === 'member')).id,
                    isDone: Math.random() < 0.3, // 30% chance of being done
                    isLate: Math.random() < 0.2, // 20% chance of being late
                    returnDate: faker.date.future(),
                    photo: Math.random() < 0.5 ? faker.image.url() : null,
                    isDamaged: Math.random() < 0.15, // 15% chance of being damaged
                }
            })
        )
    );
    console.log('Created loans:', loans.length);

    // Create Reservations (for some available books)
    const availableBooks = books.filter(b => b.isAvailable);
    const reservations = await Promise.all(
        Array(50).fill().map((_, index) =>
            prisma.reservation.create({
                data: {
                    bookId: faker.helpers.arrayElement(availableBooks).id,
                    borrowerId: faker.helpers.arrayElement(users.filter(u => u.status === 'member')).id,
                    queue: index % 3 + 1, // Queue numbers 1-3
                    status: faker.helpers.arrayElement(['queue', 'done', 'cancel']),
                }
            })
        )
    );
    console.log('Created reservations:', reservations.length);

    console.log('🌱 Seeding finished');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });