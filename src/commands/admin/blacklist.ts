import {
  addBlacklist,
  isBlacklisted,
  removeBlacklist,
} from "../../database/db";

module.exports = {
  name: "blacklist",
  description: "Manage the blacklist for the bot.",
  execute(message: any, args: string[]) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply(
        "You need Administrator permissions to use this command."
      );
    }

    if (args.length < 2) {
      return message.reply(
        "You need to provide a subcommand (add/remove/check) and a user ID."
      );
    }

    const subcommand = args[0];
    const userId = args[1];

    switch (subcommand) {
      case "add":
        if (isBlacklisted(userId, message.guild.id)) {
          return message.reply(
            `User with ID **${userId}** is already blacklisted.`
          );
        }
        addBlacklist(userId, message.guild.id);
        return message.reply(
          `User with ID **${userId}** has been blacklisted.`
        );

      case "remove":
        if (!isBlacklisted(userId, message.guild.id)) {
          return message.reply(
            `User with ID **${userId}** is not blacklisted.`
          );
        }
        removeBlacklist(userId, message.guild.id);
        return message.reply(
          `User with ID **${userId}** has been unblacklisted.`
        );

      case "check":
        if (isBlacklisted(userId, message.guild.id)) {
          return message.reply(`User with ID **${userId}** is blacklisted.`);
        } else {
          return message.reply(
            `User with ID **${userId}** is not blacklisted.`
          );
        }

      default:
        return message.reply("Invalid subcommand. Use add, remove, or check.");
    }
  },
};
