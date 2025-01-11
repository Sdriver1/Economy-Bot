import {
  updateUserBalance,
  getUserBalance,
  recordBlackjack,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "blackjack",
  aliases: ["bj"],
  description: "Play blackjack to win or lose your wager.",
  execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    if (!args[0] || isNaN(Number(args[0]))) {
      return message.reply("Usage: `.blackjack <amount>`");
    }

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();
    const amount = parseInt(args[0], 10);
    if (amount <= 0) {
      return message.reply("The wager amount must be greater than 0.");
    }

    const balance = getUserBalance(userId, serverId);
    if (balance < amount) {
      return message.reply(
        `You don't have enough ${coinEmote} ${coinName} to make this bet.`
      );
    }

    const playerScore = Math.floor(Math.random() * 11) + 16;
    const dealerScore = Math.floor(Math.random() * 11) + 17; 

    if (playerScore > 21) {
      recordBlackjack(userId, serverId, "loss_bust");
      updateUserBalance(userId, serverId, -amount);
      return message.reply(
        `You busted with a score of **${playerScore}**. You lost **${amount} ${coinEmote} ${coinName}**.`
      );
    }

    if (dealerScore > 21 || playerScore > dealerScore) {
      recordBlackjack(userId, serverId, "win");
      updateUserBalance(userId, serverId, amount);
      return message.reply(
        `You won with a score of **${playerScore}**! You gained **${amount} ${coinEmote} ${coinName}**.`
      );
    }

    recordBlackjack(userId, serverId, "loss_house");
    updateUserBalance(userId, serverId, -amount);
    return message.reply(
      `You lost. Dealer: **${dealerScore}**, You: **${playerScore}**. Lost **${amount} ${coinEmote} ${coinName}**.`
    );
  },
};
