import {
  addToLotteryPool,
  getLotteryPool,
  getUserBalance,
  updateUserBalance,
  getCoinName,
  getCoinEmote,
  drawLotteryWinner,
} from "../../database/db";

import db from "../../database/db";
import { scheduleJob } from "node-schedule";
import { Client, TextChannel } from "discord.js";

module.exports = {
  name: "lottery",
  aliases: ["l", "lot"],
  description: "Enter the lottery or check the status.",
  execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    const existingEntry = db
      .prepare(`SELECT id FROM lottery_entries WHERE id = ? AND server_id = ?`)
      .get(userId, serverId);

    if (args[0] && !isNaN(Number(args[0]))) {
      if (existingEntry) {
        return message.reply("You have already entered the lottery.");
      }

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

// Schedule daily lottery draw
module.exports.init = (client: Client) => {
  scheduleJob("0 0 * * *", async () => {
    const serverId = "your-server-id"; // Replace with your server ID
    const channelId = "1327776592566681610";

    const result = drawLotteryWinner(serverId);

    if (!result) {
      const channel = client.channels.cache.get(channelId) as TextChannel;
      if (channel) {
        channel.send("No participants in the lottery today.");
      }
      return;
    }

    const { winnerId, pool } = result;

    const participants = db
      .prepare(
        `
        SELECT id, amount FROM lottery_entries WHERE server_id = ?
      `
      )
      .all(serverId) as Array<{ id: string; amount: number }>;

    const participantList = participants
      .map((p) => `<@${p.id}>: ${p.amount.toLocaleString()} ${getCoinEmote()}`)
      .join("\n");

    const channel = client.channels.cache.get(channelId) as TextChannel;
    if (channel) {
      channel.send({
        embeds: [
          {
            color: 0x00ff00,
            title: "🎉 Lottery Results",
            description: `The lottery has concluded! Here are the results:`,
            fields: [
              { name: "Winner", value: `<@${winnerId}>`, inline: true },
              {
                name: "Prize Pool",
                value: `${pool.toLocaleString()} ${getCoinEmote()}`,
                inline: true,
              },
              {
                name: "Participants",
                value: participantList || "No participants",
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  });
};
