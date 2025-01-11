import { setConfigValue, getConfigValue } from "../../database/db";

module.exports = {
  name: "config-name",
  description: "Set the name of the coin.",
  execute(message: any, args: string[]) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply(
        "You need Administrator permissions to use this command."
      );
    }

    if (!args.length) {
      const currentName = getConfigValue("coinName");
      return message.reply(`The current coin name is: **${currentName}**.`);
    }

    const newName = args.join(" ");
    setConfigValue("coinName", newName);
    message.reply(`The coin name has been updated to: **${newName}**.`);
  },
};
