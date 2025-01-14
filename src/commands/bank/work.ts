import { EmbedBuilder } from "discord.js";
import { updateUserBalance, getCoinEmote } from "../../database/db";

const cooldowns: Map<string, number> = new Map();

module.exports = {
  name: "work",
  aliases: ["job", "w"],
  description: "Work to earn coins!",
  async execute(message: any) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const cooldownKey = `${serverId}-${userId}`;
    const now = Date.now();
    const cooldownTime = 5 * 60 * 1000;
    const lastUsed = cooldowns.get(cooldownKey);

    if (lastUsed && now - lastUsed < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

      return message.reply(
        `⏳ You need to wait ${minutes}m ${seconds}s before working again.`
      );
    }

    const workAmount = Math.floor(Math.random() * 2000) + 1;
    const workMessage = [
      "You worked as a cashier at McDonald's and earned",
      "You worked as a cashier at Walmart and earned",
      "You worked as a cashier at Target and earned",
      "You worked as a cashier at Best Buy and earned",
      "You worked as a cashier at Starbucks and earned",
      "You worked as a cashier at Amazon and earned",
      "You worked as a cashier at Apple and earned",
      "You worked as a cashier at Google and earned",
      "You worked as a cashier at Facebook and earned",
      "You worked as a cashier at Twitter and earned",
      "You worked as a cashier at Instagram and earned",
      "You worked as a cashier at Snapchat and earned",
      "You worked as a cashier at TikTok and earned",
      "You worked as a cashier at Discord and earned",
      "You worked as a cashier at Reddit and earned",
      "You worked as a cashier at Twitch and earned",
      "You worked as a cashier at YouTube and earned",
      "You worked as a cashier at Netflix and earned",
      "You worked as a cashier at Spotify and earned",
      "You worked as a cashier at Hulu and earned",
      "You worked as a cashier at HBO and earned",
      "You worked as a cashier at Disney+ and earned",
      "You worked as a cashier at Paramount+ and earned",
      "You worked as a cashier at Peacock and earned",
    ];
    const randomWorkMessage =
      workMessage[Math.floor(Math.random() * workMessage.length)];
    updateUserBalance(userId, serverId, workAmount);

    cooldowns.set(cooldownKey, now);

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("💼 Work")
      .setDescription(
        `${randomWorkMessage} **${workAmount.toLocaleString()} ${getCoinEmote()} coins**.`
      );

    message.reply({ embeds: [embed] });
  },
};
