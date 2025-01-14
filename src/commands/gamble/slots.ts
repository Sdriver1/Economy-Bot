import { EmbedBuilder } from "discord.js";
import { getUserBalance, updateUserBalance } from "../../database/db";

module.exports = {
  name: "slots",
  aliases: ["slot", "spin", "sl"],
  description: "Spin the slot machine for a chance to win big!",
  async execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const bet = parseInt(args[0], 10);
    if (isNaN(bet) || bet <= 0) {
      return message.reply("Please provide a valid bet amount!");
    }

    const maxBet = 20000;
    if (bet > maxBet) {
      return message.reply(`The maximum bet amount is ${maxBet} coins!`);
    }

    const balance = getUserBalance(userId, serverId);
    if (balance < bet) {
      return message.reply("You don't have enough coins to place that bet!");
    }
    const symbols = ["🍒", "🍋", "🍇", "🍉", "⭐", "💎"];
    const slots = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    let reward = 0;
    if (slots[0] === slots[1] && slots[1] === slots[2]) {
      reward = bet * 7.5;
    } else if (
      slots[0] === slots[1] ||
      slots[1] === slots[2] ||
      slots[0] === slots[2]
    ) {
      reward = bet * 2;
    }

    updateUserBalance(userId, serverId, reward - bet);

    const embed = new EmbedBuilder()
      .setColor(reward > 0 ? "#00FF00" : "#FF0000")
      .setTitle("🎰 Slot Machine 🎰")
      .setDescription(`You spun:\n${slots.join(" | ")}\n`)
      .addFields([
        { name: "Bet", value: `${bet} coins`, inline: true },
        { name: "Reward", value: `${reward} coins`, inline: true },
        {
          name: "New Balance",
          value: `${getUserBalance(userId, serverId)} coins`,
          inline: true,
        },
      ])
      .setFooter({
        text:
          reward > 0
            ? "Congratulations on your win!"
            : "Better luck next time!",
      });

    return message.reply({ embeds: [embed] });
  },
};
