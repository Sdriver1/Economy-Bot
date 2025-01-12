import { EmbedBuilder } from "discord.js";
import { getCoinName, getCoinEmote } from "../../database/db";

module.exports = {
  name: "leaderboard",
  aliases: ["lb"],
  description: "Show the top 10 richest users in the server.",
  async execute(message: any) {
    const serverId = message.guild.id;
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    const db = require("../../database/db").default;
    const topUsers = db
      .prepare(
        `
        SELECT id, balance
        FROM users
        WHERE server_id = ?
        ORDER BY balance DESC
        LIMIT 10
      `
      )
      .all(serverId);

    if (topUsers.length === 0) {
      return message.reply("No one in this server has coins yet.");
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("Leaderboard - Top 10 Richest Users")
      .setDescription(
        topUsers
          .map(
            (user: any, index: number) =>
              `**#${index + 1}** <@${
                user.id
              }>: **${user.balance.toLocaleString()} ${coinEmote} ${coinName}**`
          )
          .join("\n")
      )
      .setFooter({
        text: `Server: ${
          message.guild.name
        } | ${new Date().toLocaleDateString()}`,
      });

    message.reply({ embeds: [embed] });
  },
};
