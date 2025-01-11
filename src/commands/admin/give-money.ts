import {
  updateUserBalance,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "give-money",
  description: "Give coins to a user (Admin only).",
  execute(message: any, args: string[]) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply(
        "You need Administrator permissions to use this command."
      );
    }

    if (args.length < 2 || isNaN(Number(args[1]))) {
      return message.reply("Usage: `.give-money @user <amount>`");
    }

    const target = message.mentions.users.first();
    const serverId = message.guild.id;
    const amount = parseInt(args[1], 10);
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    if (!target) {
      return message.reply(
        `You must mention a valid user to give ${coinEmote} ${coinName} to.`
      );
    }

    if (amount <= 0) {
      return message.reply("The amount must be greater than 0.");
    }

    updateUserBalance(target.id, serverId, amount);

    message.reply(
      `Successfully gave **${amount} ${coinEmote} ${coinName}** to ${target.tag}.`
    );
  },
};
