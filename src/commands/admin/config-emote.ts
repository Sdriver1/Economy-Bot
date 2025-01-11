import { setConfigValue, getConfigValue } from "../../database/db";

module.exports = {
  name: "config-emote",
  description: "Set the emote for the coin.",
  execute(message: any, args: string[]) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply(
        "You need Administrator permissions to use this command."
      );
    }

    if (!args.length) {
      const currentEmote = getConfigValue("coinEmote");
      return message.reply(`The current coin emote is: **${currentEmote}**.`);
    }

    const newEmote = args.join(" ");
    setConfigValue("coinEmote", newEmote);
    message.reply(`The coin emote has been updated to: **${newEmote}**.`);
  },
};
