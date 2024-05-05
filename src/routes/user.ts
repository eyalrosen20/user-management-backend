import express, { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User, UserStatus } from "../entity/User";

// Define an interface for the update status payload
interface UpdateStatus {
    id: number;
    status: UserStatus;
}

const userRouter = express.Router();

// Get all users with pagination
userRouter.get("/", async (req: Request, res: Response) => {
    const { limit = 10, offset = 0 } = req.query;
    const userRepository = getRepository(User);
    const [users, total] = await userRepository.findAndCount({
        skip: Number(offset),
        take: Number(limit),
        relations: ["group"]
    });
    res.json({ total, users });
});

// Filter users by name using exact match
userRouter.get("/filter/name/:name", async (req: Request, res: Response) => {
    const { name } = req.params;
    const userRepository = getRepository(User);
    const users = await userRepository.find({ where: { name } });
    res.json(users);
});

// Filter users by email using exact match
userRouter.get("/filter/email/:email", async (req: Request, res: Response) => {
    const { email } = req.params;
    const userRepository = getRepository(User);
    const users = await userRepository.find({ where: { email } });
    res.json(users);
});

// Update multiple users' statuses
userRouter.put("/status", async (req: Request, res: Response) => {
    const { updates }: { updates: UpdateStatus[] } = req.body;
    const userRepository = getRepository(User);

    // Use Promise.all for efficient parallel processing
    await Promise.all(
        updates.map(async ({ id, status }) => {
            // Check for valid status before update
            if (Object.values(UserStatus).includes(status)) {
                await userRepository.update(id, { status });
            }
        })
    );

    res.sendStatus(204); // No Content indicates successful update without returning data
});

export { userRouter };
