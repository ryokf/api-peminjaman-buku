import { faker } from '@faker-js/faker';
import { prisma } from '../prisma/client.js';

// This seeder ensures each model's id starts from 1 by explicitly inserting
// ids for the seed data, then attempts to reset the database auto-increment
// / sequences so future inserts continue from the next id.

async function resetSequencesForCommonDBs(tables) {
    const dbUrl = process.env.DATABASE_URL || '';

    // Try Postgres
    if (dbUrl.includes('postgres')) {
        for (const t of tables) {
            try {
                // set sequence to max(id) + 1 (false -> next call will use the value)
                await prisma.$executeRawUnsafe(
                    `SELECT setval(pg_get_serial_sequence('\"${t}\"','id'), (SELECT COALESCE(MAX(id),0) FROM \"${t}\") + 1, false);`
                );
            } catch (e) {
                // ignore and continue to next table
            }
        }
    }

    // Try MySQL / MariaDB
    if (dbUrl.includes('mysql') || dbUrl.includes('mariadb')) {
        for (const t of tables) {
            try {
                // MySQL: compute next auto_increment and set it
                // We run a prepared statement via a single raw call to be safe.
                await prisma.$executeRawUnsafe(
                    `SET @next := (SELECT COALESCE(MAX(id),0) + 1 FROM \\\`${t}\\\`); SET @s := CONCAT('ALTER TABLE \\\`${t}\\\` AUTO_INCREMENT = ', @next); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;`
                );
            } catch (e) {
                // ignore
            }
        }
    }

    // Try SQLite
    if (dbUrl.includes('file:') || dbUrl.includes('sqlite')) {
        for (const t of tables) {
            try {
                // Update sqlite_sequence table or insert if necessary
                await prisma.$executeRawUnsafe(
                    `UPDATE sqlite_sequence SET seq = (SELECT COALESCE(MAX(id),0) FROM \\\"${t}\\\") WHERE name = '${t}';`
                );
            } catch (e) {
                try {
                    // If update fails, insert row
                    await prisma.$executeRawUnsafe(
                        `INSERT OR REPLACE INTO sqlite_sequence(name, seq) VALUES('${t}', (SELECT COALESCE(MAX(id),0) FROM \\\"${t}\\'));`
                    );
                } catch (err) {
                    // ignore
                }
            }
        }
    }
}

async function main() {
    console.log('🌱 Starting seeding...');

    // Clean up existing data (order matters for FK)
    await prisma.reservation.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.writer.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleaned up existing data');

    // --- Create Writers with explicit ids starting at 1 ---
    const writersData = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: faker.person.fullName(),
    }));
    await prisma.writer.createMany({ data: writersData });
    console.log('Created writers:', writersData.length);

    // --- Create Categories with explicit ids ---
    const categoryData = [
        { id: 1, category: 'Fiction', icon: '📚' },
        { id: 2, category: 'Non-Fiction', icon: '📖' },
        { id: 3, category: 'Science', icon: '🔬' },
        { id: 4, category: 'Technology', icon: '💻' },
        { id: 5, category: 'History', icon: '🏛️' },
        { id: 6, category: 'Biography', icon: '👤' },
        { id: 7, category: 'Children', icon: '🧸' },
        { id: 8, category: 'Romance', icon: '💝' },
        { id: 9, category: 'Mystery', icon: '🔍' },
        { id: 10, category: 'Self-Help', icon: '🌟' }
    ];
    await prisma.category.createMany({ data: categoryData });
    console.log('Created categories:', categoryData.length);

    // --- Create Users (first 10 staff, rest members) with explicit ids ---
    const usersData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        username: faker.person.firstName() + faker.number.int(1000),
        email: faker.internet.email(),
        password: faker.internet.password(), // NOTE: in production, hash this
        photo: faker.image.avatarGitHub(),
        status: i < 10 ? 'staff' : 'member',
        isBlacklist: Math.random() < 0.1,
    }));
    await prisma.user.createMany({ data: usersData });
    console.log('Created users:', usersData.length);

    // Helper to pick random element
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // --- Create Books with explicit ids and keep the array for later relations ---
    const languages = ['English', 'Indonesian', 'Spanish', 'French', 'German'];
    const booksData = Array.from({ length: 200 }, (_, i) => {
        const isAvailable = Math.random() < 0.7;
        const writerId = faker.number.int({ min: 1, max: writersData.length });
        const categoryId = faker.number.int({ min: 1, max: categoryData.length });
        const ownerId = faker.number.int({ min: 1, max: 10 }); // staff ids are 1..10
        return {
            id: i + 1,
            title: faker.word.words(3),
            description: faker.lorem.paragraphs(2),
            language: rand(languages),
            photo: faker.image.url(),
            isAvailable,
            writerId,
            categoryId,
            ownerId,
        };
    });
    // Use createMany for speed
    await prisma.book.createMany({ data: booksData });
    console.log('Created books:', booksData.length);

    // --- Create Loans for books that are not available (explicit ids) ---
    const unavailable = booksData.filter(b => !b.isAvailable);
    const loansData = unavailable.map((book, idx) => ({
        id: idx + 1,
        bookId: book.id,
        borrowerId: faker.number.int({ min: 11, max: usersData.length }), // members start at id 11
        isDone: Math.random() < 0.3,
        isLate: Math.random() < 0.2,
        returnDate: faker.date.future(),
        photo: Math.random() < 0.5 ? faker.image.url() : null,
        isDamaged: Math.random() < 0.15,
    }));
    if (loansData.length) {
        await prisma.loan.createMany({ data: loansData });
    }
    console.log('Created loans:', loansData.length);

    // --- Create Reservations for some available books (explicit ids) ---
    const available = booksData.filter(b => b.isAvailable);
    const reservationsData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        bookId: rand(available).id,
        borrowerId: faker.number.int({ min: 11, max: usersData.length }),
        queue: (i % 3) + 1,
        status: rand(['queue', 'done', 'cancel']),
    }));
    await prisma.reservation.createMany({ data: reservationsData });
    console.log('Created reservations:', reservationsData.length);

    // --- Reset DB sequences / auto-increment to continue from max(id)+1 ---
    const tables = ['writer', 'category', 'user', 'book', 'loan', 'reservation'];
    await resetSequencesForCommonDBs(tables);

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