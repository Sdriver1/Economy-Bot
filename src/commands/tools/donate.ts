import {
  updateUserBalance,
  getUserBalance,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "donate",
  aliases: ["d", "don"],
  description: "Donate coins to another user.",
  async execute(message: any, args: string[]) {
    const senderId = message.author.id;
    const serverId = message.guild.id;
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    if (!args[0] || !args[1] || isNaN(Number(args[1]))) {
      return message.reply("Usage: `.donate @user <amount>`");
    }

    const recipient = message.mentions.users.first();
    const amount = parseInt(args[1], 10);

    if (!recipient) {
      return message.reply("You must mention a valid user to donate to.");
    }

    if (recipient.id === senderId) {
      return message.reply("You cannot donate to yourself!");
    }

    if (amount <= 0) {
      return message.reply("The donation amount must be greater than 0.");
    }

    const senderBalance = getUserBalance(senderId, serverId);
    if (senderBalance < amount) {
      return message.reply(
        "You don't have enough coins to make this donation."
      );
    }

    updateUserBalance(senderId, serverId, -amount);
    updateUserBalance(recipient.id, serverId, amount);

    message.reply(
      `You have successfully donated **${amount.toLocaleString()} ${coinEmote} ${coinName}** to ${recipient.tag}.`
    );
  },
};
