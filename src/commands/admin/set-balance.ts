import {
  updateUserBalance,
  getUserBalance,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "set-balance",
  description: "Set a user's balance to a specific amount (Admin only).",
  execute(message: any, args: string[]) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply(
        "You need Administrator permissions to use this command."
      );
    }

    if (args.length < 2 || isNaN(Number(args[1]))) {
      return message.reply("Usage: `.set-balance @user <amount>`");
    }

    const target = message.mentions.users.first();
    const amount = parseInt(args[1], 10);
    const serverId = message.guild.id;
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    if (!target) {
      return message.reply(
        "You must mention a valid user to set their balance."
      );
    }

    if (amount < 0) {
      return message.reply("The balance cannot be set to a negative value.");
    }

    const currentBalance = getUserBalance(target.id, serverId);

    updateUserBalance(target.id, serverId, -currentBalance + amount);

    message.reply(
      `Successfully set the balance of ${target.tag} to **${amount} ${coinEmote} ${coinName}**.`
    );
  },
};
