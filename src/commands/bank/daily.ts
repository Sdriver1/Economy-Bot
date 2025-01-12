import {
  updateUserBalance,
  getCoinName,
  getCoinEmote,
} from "../../database/db";
import db from "../../database/db";

module.exports = {
  name: "daily",
  description: "Claim your daily reward!",
  execute(message: any) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const userDaily = db
      .prepare(
        "SELECT streak, last_claim FROM daily WHERE user_id = ? AND server_id = ?"
      )
      .get(userId, serverId) as
      | { streak: number; last_claim: string }
      | undefined;

    let streak = 0;
    let baseReward = 100;

    if (userDaily) {
      const lastClaim = new Date(userDaily.last_claim);
      const diffDays = Math.floor(
        (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak = userDaily.streak + 1;
      } else if (diffDays > 1) {
        streak = 0;
      } else {
        return message.reply(
          `You already claimed your daily reward today! Come back tomorrow.`
        );
      }
    }

    const reward = baseReward + streak * 10;

    updateUserBalance(userId, serverId, reward);
    db.prepare(
      `INSERT INTO daily (user_id, server_id, streak, last_claim)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, server_id) DO UPDATE SET
         streak = ?, last_claim = ?`
    ).run(userId, serverId, streak, today, streak, today);

    return message.reply(
      `You claimed **${reward} ${coinEmote} ${coinName}**! Your current streak is **${streak} days**. Keep it up to earn more ${coinName}s!`
    );
  },
};
