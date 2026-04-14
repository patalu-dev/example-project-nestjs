import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'example_project_nestjs',
  entities: [User, Role, Permission],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('📦 Data Source has been initialized!');

  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  // 1. Kiểm tra hoặc tạo Role Admin
  let adminRole = await roleRepo.findOneBy({ name: 'admin' });
  if (!adminRole) {
    adminRole = await roleRepo.save(roleRepo.create({
      name: 'admin',
      description: 'Quản trị viên toàn quyền'
    }));
    console.log('✅ Created Admin role');
  }

  // 2. Kiểm tra hoặc tạo User Admin
  const adminUsername = 'admin';
  const existingAdmin = await userRepo.findOneBy({ username: adminUsername });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = userRepo.create({
      name: 'Admin',
      username: adminUsername,
      password: hashedPassword,
      isActive: true,
      roles: [adminRole]
    });

    await userRepo.save(adminUser);
    console.log('✅ Created Admin user (username: admin, password: 123456)');
  } else {
    console.log('⏭️  Admin user already exists');
  }

  console.log('\n🎉 User Seed completed successfully!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ User Seed failed:', error);
  process.exit(1);
});
