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

    if (!args[0] || !["h", "t"].includes(args[0].toLowerCase())) {
      return message.reply("Usage: `.coinflip <h/t> <amount>`");
    }
    if (!args[1] || isNaN(Number(args[1]))) {
      return message.reply("You must specify a valid wager amount.");
    }

    const choice = args[0].toLowerCase() === "h" ? "heads" : "tails";
    const amount = parseInt(args[1], 10);

    if (amount <= 0) {
      return message.reply("The wager amount must be greater than 0.");
    }

    const balance = getUserBalance(userId, serverId);
    if (balance < amount) {
      return message.reply("You don't have enough coins to make this bet.");
    }

    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    const win = outcome === choice;

    recordCoinflip(userId, serverId, outcome);

    if (win) {
      const winnings = amount * 2;
      updateUserBalance(userId, serverId, winnings);
      return message.reply(
        `You won! The coin landed on **${outcome}**. You gained **${winnings.toLocaleString()} ${coinEmote} ${coinName}**.`
      );
    } else {
      updateUserBalance(userId, serverId, -amount);
      return message.reply(
        `You lost! The coin landed on **${outcome}**. You lost **${amount.toLocaleString()} ${coinEmote} ${coinName}**.`
      );
    }
  },
};
