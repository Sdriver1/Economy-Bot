import { Client, TextChannel } from "discord.js";
import { getCoinEmote } from "../database/db";
import { activeDrops } from "../database/activeDrops";

module.exports = {
  name: "initCoinDrops",
  init(client: Client) {
    const channelId = "1309534410500214824";

    const randomMinutes = () => Math.floor(Math.random() * 21);

    const scheduleNextDrop = () => {
      const delay = randomMinutes() * 60 * 1000;
      console.log(`Next drop in ${delay / 1000 / 60} minutes`);
      setTimeout(async () => {
        const channel = client.channels.cache.get(channelId) as TextChannel;
        if (!channel) return;

        const dropAmount = Math.floor(Math.random() * 10000) + 5000;
        const coinEmote = getCoinEmote();

        const dropMessage = await channel.send(
          `💰 A coin drop of **${dropAmount} ${coinEmote}** is here! Type \`.pick\` to claim it first!`
        );

        activeDrops[channelId] = {
          messageId: dropMessage.id,
          amount: dropAmount,
        };

        const cleanupMessage = async () => {
          if (activeDrops[channelId]?.messageId === dropMessage.id) {
            delete activeDrops[channelId];
            await dropMessage.delete().catch(() => {});
          }
        };

        client.on("messageCreate", async (message) => {
          if (
            message.channel.id === channelId &&
            message.content === ".pick" &&
            activeDrops[channelId]?.messageId === dropMessage.id
          ) {

            const amount = activeDrops[channelId]?.amount || 0;
            delete activeDrops[channelId];
            await message.reply(`🎉 You claimed **${amount} coins**!`);

            setTimeout(() => {
              cleanupMessage();
            }, 5000); 
          }
        });

        setTimeout(cleanupMessage, 20000);
        scheduleNextDrop();
      }, delay);
    };

    scheduleNextDrop();
  },
};
