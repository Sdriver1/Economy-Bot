import {
  updateUserBalance,
  getUserBalance,
  recordCoinflip,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "coinflip",
  aliases: ["cf"],
  description: "Flip a coin and wager your money.",
  execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();
    if (!args[0] || isNaN(Number(args[0]))) {
      return message.reply("Usage: `.coinflip <amount>`");
    }

    const amount = parseInt(args[0], 10);
    if (amount <= 0) {
      return message.reply("The wager amount must be greater than 0.");
    }

    const balance = getUserBalance(userId, serverId);
    if (balance < amount) {
      return message.reply("You don't have enough coins to make this bet.");
    }

    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    const win = Math.random() < 0.5;

    recordCoinflip(userId, serverId, outcome);

    if (win) {
      updateUserBalance(userId, serverId, amount);
      return message.reply(
        `You won! The coin landed on **${outcome}**. You gained **${amount} ${coinEmote} ${coinName}**.`
      );
    } else {
      updateUserBalance(userId, serverId, -amount);
      return message.reply(
        `You lost! The coin landed on **${outcome}**. You lost **${amount} ${coinEmote} ${coinName}**.`
      );
    }
  },
};
