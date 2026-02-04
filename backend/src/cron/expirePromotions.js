import cron from "node-cron";
import { JobPromotion } from "../models/jobPromotion.model.js";

// Run every 10 minutes
cron.schedule("*/10 * * * *", async () => {
    try {
        const result = await JobPromotion.updateMany(
            {
                status: "ACTIVE",
                endAt: { $lt: new Date() }
            },
            {
                status: "EXPIRED"
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`[CRON] Expired ${result.modifiedCount} job promotions.`);
        }
    } catch (error) {
        console.error("[CRON] Error expiring promotions:", error);
    }
});
