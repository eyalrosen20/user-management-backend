import express from "express";
import { getRepository, getConnection } from "typeorm";
import { Group, GroupStatus } from "../entity/Group";
import { User } from "../entity/User";

const groupRouter = express.Router();

// Remove a user from a group
groupRouter.put("/remove-user", async (req, res) => {
  const { userId } = req.body;

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
 
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const userRepository = queryRunner.manager.getRepository(User);
    const groupRepository = queryRunner.manager.getRepository(Group);

    // Find the user and their associated group
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["group"]
    });

    if (user && user.group) {
      const group = user.group;
      // Remove the user from the group
      user.group = null;
      await userRepository.save(user);

      // Count remaining users in the group
      const remainingUsers = await userRepository.count({
        where: { group: { id: group.id } }
      });

      // Update group status if no users remain
      if (remainingUsers === 0) {
        group.status = GroupStatus.EMPTY;
        await groupRepository.save(group);
      }

      // Commit the transaction if everything succeeds
      await queryRunner.commitTransaction();
      res.sendStatus(204); // No Content
    } else {
      // Roll back the transaction and return a 404 error
      await queryRunner.rollbackTransaction();
      res.status(404).json({ message: "User or group not found" });
    }
  } catch (error) {
    // If any error occurs, roll back the transaction
    await queryRunner.rollbackTransaction();
    console.error("Error in transaction:", error);
    res.status(500).json({ message: "Transaction failed", error });
  } finally {
    // Release the query runner (returns the database connection to the pool)
    await queryRunner.release();
  }
});

export { groupRouter };
