import db, { addRobProtection } from "../../database/db";

module.exports = {
  name: "robprotection",
  description: "Manage rob protections for users.",
  async execute(message: any, args: string[]) {
    if (!args[0]) {
      return message.reply(
        "Please specify an action: `set <hours>` or `remove`."
      );
    }

    const action = args[0].toLowerCase();
    const userId = message.author.id;
    const serverId = message.guild.id;

    if (action === "set") {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("You do not have permission to use this command.");
      }

      const target = message.mentions.users.first();
      if (!target) {
        return message.reply(
          "You need to mention a user to set rob protection for."
        );
      }

      const duration = parseInt(args[2], 10) || 0;
      if (duration <= 0) {
        return message.reply("Please provide a valid duration in hours.");
      }

      addRobProtection(target.id, serverId, duration * 60 * 60 * 1000);

      return message.reply(
        `Added rob protection for ${target.username} for ${duration} hours.`
      );
    } else if (action === "remove") {
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("You do not have permission to use this command.");
      }

      const target = message.mentions.users.first();
      if (!target) {
        return message.reply(
          "You need to mention a user to remove rob protection from."
        );
      }

      const serverId = message.guild.id;

      const result = db
        .prepare(
          `DELETE FROM rob_protection WHERE user_id = ? AND server_id = ?`
        )
        .run(target.id, serverId);

      if (result.changes === 0) {
        return message.reply(
          `${target.username} does not have any active rob protection.`
        );
      }

      return message.reply(`Removed rob protection for ${target.username}.`);
    } else {
      return message.reply("Invalid action. Use `set <hours>` or `remove`.");
    }
  },
};
