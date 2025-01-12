import { EmbedBuilder } from "discord.js";
import { getUserBalance, getCoinName, getCoinEmote } from "../../database/db";

module.exports = {
  name: "bal",
  aliases: ["balance", "b"],
  description: "Check your balance and server ranking.",
  async execute(message: any) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const balance = getUserBalance(userId, serverId);

    const db = require("../../database/db").default;
    const rankings = db
      .prepare(
        `
        SELECT id, balance
        FROM users
        WHERE server_id = ?
        ORDER BY balance DESC
      `
      )
      .all(serverId);

    const rank = rankings.findIndex((user: any) => user.id === userId) + 1;
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle(`${message.author.username}'s Balance`)
      .addFields(
        {
          name: "Balance",
          value: `${balance.toLocaleString()} ${coinEmote} ${coinName}`,
          inline: true,
        },
        { name: "Ranking", value: `#${rank}`, inline: true }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Server: ${message.guild.name}` });

    message.reply({ embeds: [embed] });
  },
};
