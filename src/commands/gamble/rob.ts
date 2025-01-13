import {
  updateUserBalance,
  getUserBalance,
  getCoinName,
  getCoinEmote,
  setUserInJail,
  isUserInJail,
} from "../../database/db";

module.exports = {
  name: "rob",
  aliases: ["r"],
  description: "Rob another user or get caught.",
  async execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const jailStatus = isUserInJail(userId, serverId);
    if (jailStatus.inJail) {
      let remainingTime = 0;
      if (jailStatus.endTime) {
        remainingTime = Math.ceil((jailStatus.endTime - Date.now()) / 60000);
      }
      return message.reply(
        `You are in jail and can't rob anyone for another ${remainingTime} minutes!`
      );
    }

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

    const userBalance = await getUserBalance(userId, serverId);
    const targetBalance = await getUserBalance(targetId, serverId);

    if (targetBalance <= 0) {
      return message.reply(
        `The user you are trying to rob has no ${coinEmote} ${coinName}!`
      );
    }

    let percentageToSteal = Math.floor(Math.random() * 50) + 1;
    let amountToSteal = Math.floor((targetBalance * percentageToSteal) / 100);

    const successChance = Math.max(0.1, 1 - percentageToSteal / 100);

    if (Math.random() < successChance) {
      await updateUserBalance(userId, serverId, amountToSteal);
      await updateUserBalance(targetId, serverId, -amountToSteal);
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

      await updateUserBalance(userId, serverId, -finalFine);
      const jailChance = Math.random(); // 25-50% chance of jail
      if (jailChance >= 0.5) {
        const jailDuration = Math.floor(Math.random() * 12 * 60 * 60 * 1000); // Up to 24 hours
        const jailEndTime = Date.now() + jailDuration;
        setUserInJail(userId, serverId, jailEndTime);

        const jailTimeInMinutes = Math.ceil(jailDuration / 60000);

        return message.reply(
          `You got caught trying to rob ${
            target.username
          } and had to pay a fine of **${finalFine.toLocaleString()} ${coinEmote} ${coinName}**! You are now in jail for ${jailTimeInMinutes} minutes.`
        );
      } else {
        return message.reply(
          `You got caught trying to rob ${
            target.username
          } and had to pay a fine of **${finalFine.toLocaleString()} ${coinEmote} ${coinName}**! Lucky for you, no jail time this time.`
        );
      }
    }
  },
};
