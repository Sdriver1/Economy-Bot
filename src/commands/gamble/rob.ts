import {
  updateUserBalance,
  getUserBalance,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "rob",
  aliases: ["r"],
  description: "Rob another user or get caught.",
  async execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const target = message.mentions.users.first();
    if (!target || target.bot) {
      return message.reply("You need to mention a valid user to rob!");
    }

    const targetId = target.id;
    if (userId === targetId) {
      return message.reply("You can't rob yourself!");
    }

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    const userBalance = getUserBalance(userId, serverId);
    const targetBalance = getUserBalance(targetId, serverId);

    if (targetBalance <= 0) {
      return message.reply(
        `The user you are trying to rob has no ${coinEmote} ${coinName}!`
      );
    }

    let percentageToSteal = Math.floor(Math.random() * 95) + 5;
    let amountToSteal = Math.floor((targetBalance * percentageToSteal) / 100);

    const successChance = Math.max(0.05, 1 - percentageToSteal / 100);

    if (Math.random() < successChance) {
      updateUserBalance(userId, serverId, amountToSteal);
      updateUserBalance(targetId, serverId, -amountToSteal);
      return message.reply(
        `You successfully robbed **${amountToSteal.toLocaleString()} ${coinEmote} ${coinName}** from ${
          target.username
        }!`
      );
    } else {
      const finePercentage = Math.min(
        100,
        percentageToSteal + Math.floor(Math.random() * 20)
      );
      const fineAmount = Math.floor((userBalance * finePercentage) / 100);

      const finalFine = Math.min(fineAmount, userBalance);

      updateUserBalance(userId, serverId, -finalFine);
      return message.reply(
        `You got caught trying to rob ${
          target.username
        } for ${percentageToSteal}% of their balance and had to pay a fine of **${finalFine.toLocaleString()} ${coinEmote} ${coinName}**!`
      );
    }
  },
};
