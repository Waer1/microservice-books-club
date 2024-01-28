import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDB1671445944422 implements MigrationInterface {
  name = 'InitDB1671445944422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('InitDB1671445944422');
    // await queryRunner.query(`
    //     CREATE TABLE "user" (
    //         "id" SERIAL PRIMARY KEY,
    //         "firstName" VARCHAR NOT NULL,
    //         "lastName" VARCHAR NOT NULL,
    //         "email" VARCHAR UNIQUE NOT NULL,
    //         "password" VARCHAR NOT NULL,
    //         "city" VARCHAR,
    //         "latitude" NUMERIC(10, 6),
    //         "longitude" NUMERIC(10, 6),
    //         "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //       );
    //     `);
    // await queryRunner.query(`
    //   CREATE TABLE "book" (
    //     "id" SERIAL PRIMARY KEY,
    //     "title" VARCHAR NOT NULL,
    //     "description" VARCHAR NOT NULL,
    //     "authorId" INTEGER,
    //     FOREIGN KEY ("authorId") REFERENCES "User"("id") ON UPDATE CASCADE
    //   );
    //   `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "book"`);
  }
}
