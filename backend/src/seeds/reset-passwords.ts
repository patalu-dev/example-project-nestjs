import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';

/**
 * Script to reset all user passwords to '123456'
 * 
 * Usage: npx ts-node src/seeds/reset-passwords.ts
 */

const dataSource = new DataSource({
  type: 'mysql',
  host: '10.10.10.101',
  port: 3306,
  username: 'srv-dev',
  password: 'P@ssw0rd@2012',
  database: 'example_project_nestjs',
  entities: [User, Permission, Role],
  synchronize: false, // We don't want to change the schema
});

async function resetPasswords() {
  console.log('🔄 Connecting to database...');
  await dataSource.initialize();
  console.log('✅ Connected.');

  const userRepository = dataSource.getRepository(User);
  const users = await userRepository.find();

  if (users.length === 0) {
    console.log('⚠️ No users found in database.');
    await dataSource.destroy();
    return;
  }

  console.log(`🔍 Found ${users.length} users. Generating hash for "123456"...`);
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('123456', salt);

  console.log('⚙️ Updating passwords...');
  for (const user of users) {
    user.password = hashedPassword;
    await userRepository.save(user);
    console.log(`✅ Updated password for user: ${user.username}`);
  }

  console.log('\n🎉 All passwords have been reset to "123456"');
  await dataSource.destroy();
}

resetPasswords().catch((error) => {
  console.error('❌ Reset failed:', error);
  process.exit(1);
});
