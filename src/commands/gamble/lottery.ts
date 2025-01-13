import {
  addToLotteryPool,
  getLotteryPool,
  getUserBalance,
  updateUserBalance,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

import db from "../../database/db";

module.exports = {
  name: "lottery",
  aliases: ["l", "lot"],
  description: "Enter the lottery or check the status.",
  execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    if (args[0] && !isNaN(Number(args[0]))) {
      const amount = parseInt(args[0], 10);

      if (amount <= 0) {
        return message.reply("The amount must be greater than 0.");
      }

      const balance = getUserBalance(userId, serverId);
      if (balance < amount) {
        return message.reply(
          "You don't have enough coins to enter the lottery."
        );
      }

      addToLotteryPool(serverId, amount);
      updateUserBalance(userId, serverId, -amount);

      db.prepare(
        `
          INSERT INTO lottery_entries (id, server_id, amount, last_entry)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id, server_id) DO UPDATE SET amount = amount + excluded.amount, last_entry = CURRENT_TIMESTAMP
        `
      ).run(userId, serverId, amount);

      return message.reply(
        `You entered the lottery with **${amount} ${coinEmote} ${coinName}**.`
      );
    }

    if (args[0] === "status") {
      const pool = getLotteryPool(serverId);
      return message.reply(
        `Lottery pool: **${pool} ${coinEmote} ${coinName}**.`
      );
    }

    message.reply("Usage: `.lottery <amount>` or `.lottery status`");
  },
};
