import "reflect-metadata";
import express from "express";
import { createConnection, getRepository } from "typeorm";
import { userRouter } from "./routes/user";
import { groupRouter } from "./routes/group";
import { User, UserStatus } from "./entity/User";
import { Group, GroupStatus } from "./entity/Group";

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use("/groups", groupRouter);

// Seed database with mock data if empty
async function seedDatabase() {
  const userRepository = getRepository(User);
  const groupRepository = getRepository(Group);

  // Check if data already exists
  const userCount = await userRepository.count();
  const groupCount = await groupRepository.count();

  if (userCount === 0 && groupCount === 0) {
    // Create some mock groups
    const group1 = groupRepository.create({ name: "Admins", status: GroupStatus.NOT_EMPTY });
    const group2 = groupRepository.create({ name: "Users", status: GroupStatus.NOT_EMPTY });
    const savedGroup1 = await groupRepository.save(group1);
    const savedGroup2 = await groupRepository.save(group2);

    // Create some mock users and associate them with the groups
    const user1 = userRepository.create({ name: "Alice", email: "alice@example.com", status: UserStatus.ACTIVE, group: savedGroup1 });
    const user2 = userRepository.create({ name: "Bob", email: "bob@example.com", status: UserStatus.PENDING, group: savedGroup2 });
    const user3 = userRepository.create({ name: "Charlie", email: "charlie@example.com", status: UserStatus.BLOCKED, group: savedGroup1 });

    await userRepository.save([user1, user2, user3]);

    console.log("Mock data added to groups and users tables");
  } else {
    console.log("Database already contains data, skipping mock data population.");
  }
}

// Initialize the database connection and start the server
createConnection().then(async () => {
  // Seed the database
  await seedDatabase();

  // Start the server
  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}).catch(error => console.log(error));
