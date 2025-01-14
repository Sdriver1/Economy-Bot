import { EmbedBuilder } from "discord.js";
import {
  updateUserBalance,
  getUserBalance,
  getCoinEmote,
} from "../../database/db";

const activeGames: { [userId: string]: boolean } = {};

module.exports = {
  name: "guessdoor",
  aliases: ["door", "gd"],
  description: "Guess the correct door to win a multiplier on your wager!",
  async execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;
    const coinEmote = getCoinEmote();

    if (activeGames[userId]) {
      return message.reply(
        "You already have an active game. Please finish it before starting a new one!"
      );
    }

    const wager = parseInt(args[0], 10);
    if (!wager || wager <= 0) {
      return message.reply("Please enter a valid wager amount.");
    }

    const balance = getUserBalance(userId, serverId);
    if (wager > balance) {
      return message.reply("You don't have enough coins to make that wager.");
    }

    const maxWager = 20000;
    if (wager > maxWager) {
      return message.reply(
        `The maximum wager is **${maxWager.toLocaleString()} ${coinEmote}**.`
      );
    }

    const multipliers = [
      10, // 5% chance
      5, // 5% chance
      3, 3, // 10% chance
      2, 2, // 10% chance
      1.5, 1.5, // 10% chance
      1.0, 1.0, 1.0, 1.0, // 20% chance
      0.5, 0.5, 0.5, 0.5, // 20% chance
      0, 0, 0, 0, // 20% chance
    ];
    const shuffled = multipliers.sort(() => Math.random() - 0.5);
    const doorMap: { [key: number]: number } = {
      1: shuffled[0],
      2: shuffled[1],
      3: shuffled[2],
    };

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("🎲 Guess the Door!")
      .setDescription(
        `Choose a door (1, 2, or 3) for a chance to win a multiplier on your wager!\n\n` +
          `- Door 1: 🎯\n- Door 2: 🎯\n- Door 3: 🎯\n\n` +
          `Type \`1\`, \`2\`, or \`3\` to pick a door.`
      )
      .setFooter({
        text: `Your wager: ${wager.toLocaleString()} ${coinEmote}`,
      });

    await message.reply({ embeds: [embed] });

    activeGames[userId] = true;

    const filter = (msg: any) =>
      msg.author.id === userId && ["1", "2", "3"].includes(msg.content.trim());
    const collected = await message.channel
      .awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
      .catch(() => null);

    delete activeGames[userId];

    if (!collected || !collected.first()) {
      return message.reply("You took too long to choose a door! Try again.");
    }

    const chosenDoor = parseInt(collected.first().content, 10);
    const multiplier = doorMap[chosenDoor];

    if (multiplier > 0) {
      const winnings = Math.floor(wager * multiplier);
      updateUserBalance(userId, serverId, winnings - wager);

      return message.reply(
        `🎉 You chose Door ${chosenDoor} and won a **${multiplier}x multiplier**!\n` +
          `Your reward: **${winnings.toLocaleString()} ${coinEmote}**.`
      );
    } else {
      updateUserBalance(userId, serverId, -wager);
      return message.reply(
        `😢 You chose Door ${chosenDoor} and got **nothing**. Better luck next time!`
      );
    }
  },
};
