import { updateUserBalance } from "../../database/db";
import { activeDrops } from "../../database/activeDrops";

module.exports = {
  name: "pick",
  description: "Pick up a coin drop from the channel.",
  async execute(message: any) {
    const userId = message.author.id;
    const serverId = message.guild.id;
    const channelId = message.channel.id;

    if (!activeDrops[channelId]) {
      return message.reply("There’s no active coin drop to pick right now!");
    }

    const { amount } = activeDrops[channelId];

    updateUserBalance(userId, serverId, amount); 
    delete activeDrops[channelId]; 

    return message.reply(`🎉 You claimed **${amount} coins**!`);
  },
};
