import { EmbedBuilder } from "discord.js";
import { getRobProtection } from "../../database/db";

module.exports = {
  name: "robstatus",
  aliases: ["rs"],
  description: "Check your rob status.",
  async execute(message: any) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const robProtection = getRobProtection(userId, serverId);

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("Rob Status")
      .setDescription(
        robProtection
          ? `Your rob protection will expire at <t:${Math.floor(
              robProtection / 1000
            )}:F> or <t:${Math.floor(robProtection / 1000)}:R>.`
          : "You do not have rob protection. You can get some from the shop (.shop buy 4 <time>)."
      );

    message.reply({ embeds: [embed] });
  },
};
