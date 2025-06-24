import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTableMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "email", type: "varchar", isUnique: true, isNullable: true },
          { name: "password", type: "varchar", isNullable: true },
          { name: "phone", type: "varchar", isUnique: true, isNullable: true },
          { name: "otp", type: "varchar", isNullable: true },
          { name: "mfaEnabled", type: "boolean", default: false },
          { name: "mfaSecret", type: "varchar", isNullable: true },
          { name: "createdAt", type: "timestamp", default: "now()" },
          { name: "updatedAt", type: "timestamp", default: "now()" },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("user");
  }
}
