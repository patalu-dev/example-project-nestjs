import { DataSource } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

/**
 * Seed script to create default permissions and assign them to roles.
 * 
 * Run this script after the first deployment to populate initial permissions.
 * Usage: npx ts-node src/seeds/seed-permissions.ts
 * 
 * You can also call this from an API endpoint or a NestJS CLI command.
 */

const dataSource = new DataSource({
  type: 'mysql',
  host: '10.10.10.101',
  port: 3306,
  username: 'srv-dev',
  password: 'P@ssw0rd@2012',
  database: 'example_project_nestjs',
  entities: [Permission, Role, User],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);

  // Define default permissions
  const defaultPermissions = [
    // Admin full access
    { action: 'manage', subject: 'all', description: 'Toàn quyền quản lý hệ thống', inverted: false },

    // User module permissions
    { action: 'create', subject: 'User', description: 'Tạo người dùng mới', inverted: false },
    { action: 'read', subject: 'User', description: 'Xem thông tin người dùng', inverted: false },
    { action: 'update', subject: 'User', description: 'Cập nhật thông tin người dùng', inverted: false },
    { action: 'delete', subject: 'User', description: 'Xóa người dùng', inverted: false },

    // Role module permissions
    { action: 'create', subject: 'Role', description: 'Tạo vai trò mới', inverted: false },
    { action: 'read', subject: 'Role', description: 'Xem thông tin vai trò', inverted: false },
    { action: 'update', subject: 'Role', description: 'Cập nhật vai trò', inverted: false },
    { action: 'delete', subject: 'Role', description: 'Xóa vai trò', inverted: false },

    // Permission module permissions
    { action: 'create', subject: 'Permission', description: 'Tạo quyền mới', inverted: false },
    { action: 'read', subject: 'Permission', description: 'Xem thông tin quyền', inverted: false },
    { action: 'update', subject: 'Permission', description: 'Cập nhật quyền', inverted: false },
    { action: 'delete', subject: 'Permission', description: 'Xóa quyền', inverted: false },

    // General read-all permission
    { action: 'read', subject: 'all', description: 'Xem tất cả thông tin', inverted: false },
  ];

  // Insert permissions (skip if already exists)
  const savedPermissions: Permission[] = [];
  for (const perm of defaultPermissions) {
    let existing = await permissionRepo.findOneBy({
      action: perm.action,
      subject: perm.subject,
      inverted: perm.inverted,
    });

    if (!existing) {
      existing = await permissionRepo.save(permissionRepo.create(perm));
      console.log(`✅ Created permission: ${perm.action} ${perm.subject}`);
    } else {
      console.log(`⏭️  Permission already exists: ${perm.action} ${perm.subject}`);
    }
    savedPermissions.push(existing);
  }

  // Create/update Admin role with all permissions
  let adminRole = await roleRepo.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });

  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'admin', description: 'Quản trị viên - toàn quyền' });
  }

  // Admin gets the "manage all" permission
  const manageAll = savedPermissions.find((p) => p.action === 'manage' && p.subject === 'all');
  adminRole.permissions = manageAll ? [manageAll] : [];
  await roleRepo.save(adminRole);
  console.log(`✅ Admin role configured with "manage all" permission`);

  // Create/update User role with basic permissions
  let userRole = await roleRepo.findOne({
    where: { name: 'user' },
    relations: ['permissions'],
  });

  if (!userRole) {
    userRole = roleRepo.create({ name: 'user', description: 'Người dùng thông thường' });
  }

  // User gets read-all permission
  const readAll = savedPermissions.find((p) => p.action === 'read' && p.subject === 'all');
  userRole.permissions = readAll ? [readAll] : [];
  await roleRepo.save(userRole);
  console.log(`✅ User role configured with "read all" permission`);

  console.log('\n🎉 Seed completed successfully!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
