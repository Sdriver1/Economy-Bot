import { getConfigValue } from "../../database/db";

module.exports = {
  name: "view-config",
  description: "View the current coin name and emote.",
  execute(message: any) {
    const coinName = getConfigValue("coinName");
    const coinEmote = getConfigValue("coinEmote");

    message.reply(
      `Current Configuration:\n- Coin Name: **${coinName}**\n- Coin Emote: **${coinEmote}**`
    );
  },
};
