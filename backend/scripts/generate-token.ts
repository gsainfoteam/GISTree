import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function generateToken() {
  const prisma = new PrismaClient();

  try {
    // 1. Get the first user from the database
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('No users found in the database. Please create a user first.');
      return;
    }

    console.log(`Generating token for user: ${user.name} (${user.studentId})`);

    // 2. Create payload (matching AuthService.login)
    const payload = {
      username: user.name,
      sub: user.id,
      studentId: user.studentId
    };

    // 3. Sign token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in .env file.');
      return;
    }

    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    console.log('\nAccess Token:');
    console.log(token);
    console.log('\nUse this token in the Authorization header: Bearer <token>');

  } catch (error) {
    console.error('Error generating token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();
