import { EmbedBuilder } from "discord.js";
import { getUserBalance, getCoinName, getCoinEmote } from "../../database/db";

module.exports = {
  name: "bal",
  aliases: ["balance", "b"],
  description: "Check your balance and server ranking.",
  async execute(message: any, args: string[]) {
    const target =
      message.mentions.users.first() ||
      (args[0] && message.guild.members.cache.get(args[0])?.user) ||
      message.author;

    const userId = target.id;
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
      .setTitle(`${target.username}'s Balance`)
      .addFields(
        {
          name: "Balance",
          value: `${balance.toLocaleString()} ${coinEmote} ${coinName}`,
          inline: true,
        },
        { name: "Ranking", value: `#${rank}`, inline: true }
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Server: ${message.guild.name}` });

    message.reply({ embeds: [embed] });
  },
};
