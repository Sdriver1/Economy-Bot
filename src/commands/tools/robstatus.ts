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

    if (!robProtection) {
      message.reply(
        "You do not have rob protection. \nYou can get some from the shop (`.shop buy 4 <time>`)."
      );
      return;
    }

    const expirationTimestamp = Math.floor(robProtection / 1000); 

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("Rob Status")
      .setDescription(
        robProtection
          ? `Your rob protection will expire at <t:${expirationTimestamp}:F> or <t:${expirationTimestamp}:R>.`
          : "You do not have rob protection. You can get some from the shop (.shop buy 4 <time>)."
      );

    message.reply({ embeds: [embed] });
  },
};
