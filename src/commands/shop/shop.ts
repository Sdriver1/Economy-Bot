import { EmbedBuilder, GuildMember } from "discord.js";
import {
  getUserBalance,
  updateUserBalance,
  hasRobProtection,
  addRobProtection,
  addItemToInventory,
  recordPurchase,
  getRobProtection,
} from "../../database/db";

module.exports = {
  name: "shop",
  description: "View the shop, inspect items, or buy items.",
  async execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    const balance = getUserBalance(userId, serverId);

    const shopItems = [
      {
        id: 1,
        name: "<:_:1310602481016901703> Lite Role",
        type: "role",
        price: 100000,
        description: "Grants you the Lite Role.",
        roleId: "1327934295251353632",
      },
      {
        id: 2,
        name: "<:_:1310602476419813500> Wealthy Role",
        type: "role",
        price: 500000,
        description: "Grants you the Wealthy Role.",
        roleId: "1302054984686506066",
      },
      {
        id: 3,
        name: "<:_:1310602483487342592> Rich Role",
        type: "role",
        price: 1000000,
        description: "Grants you the prestigious Rich Role.",
        roleId: "1327934204897529937",
      },
      {
        id: 4,
        name: "Rob Protection",
        type: "item",
        price: 10000,
        description:
          "Grants protection from being robbed for 1 hour (stackable | up to 12).",
      },
    ];

    if (!args[0]) {
      const shopEmbed = new EmbedBuilder()
        .setTitle("🌸 Shop")
        .setDescription("Here are the items available for purchase:")
        .setColor("#FFD700")
        .addFields(
          shopItems.map((item) => ({
            name: `${item.id}. ${item.name}`,
            value: `Price: **${item.price.toLocaleString()} coins**\nType: **${
              item.type
            }**`,
            inline: false,
          }))
        )
        .setFooter({ text: `Your balance: ${balance.toLocaleString()} coins` });

      return message.reply({ embeds: [shopEmbed] });
    }

    if (args[0].toLowerCase() === "item") {
      const itemId = parseInt(args[1], 10);
      const item = shopItems.find((i) => i.id === itemId);

      if (!item) {
        return message.reply(
          "Invalid item ID. Use `.shop` to view available items."
        );
      }

      const itemEmbed = new EmbedBuilder()
        .setTitle(`Item: ${item.name}`)
        .setDescription(item.description || "No description available.")
        .setColor("#FFD700")
        .addFields(
          {
            name: "Price",
            value: `${item.price.toLocaleString()} coins`,
            inline: true,
          },
          { name: "Type", value: item.type, inline: true }
        );

      if (item.type === "role" && item.roleId) {
        itemEmbed.addFields({
          name: "Role",
          value: `<@&${item.roleId}>`,
          inline: true,
        });
      }

      return message.reply({ embeds: [itemEmbed] });
    }

    if (args[0].toLowerCase() === "buy") {
      const itemId = parseInt(args[1], 10);
      const item = shopItems.find((i) => i.id === itemId);

      if (!item) {
        return message.reply(
          "Invalid item ID. Use `.shop` to view available items."
        );
      }

      if (balance < item.price) {
        return message.reply(
          `You don't have enough coins to purchase **${item.name}**.`
        );
      }

      if (item.name === "Rob Protection") {
        const quantity = parseInt(args[2], 10) || 1;

        if (quantity < 1 || quantity > 12) {
          return message.reply(
            "You can only buy between 1 and 12 hours of rob protection."
          );
        }

        const currentProtection = hasRobProtection(userId, serverId)
          ? Math.ceil(
              ((getRobProtection(userId, serverId) ?? 0) - Date.now()) /
                (60 * 60 * 1000)
            )
          : 0;
        const maxDuration = 12; 

        if (currentProtection >= maxDuration) {
          return message.reply(
            "You already have the maximum 12 hours of rob protection active."
          );
        }

        const remainingHours = maxDuration - currentProtection;
        if (quantity > remainingHours) {
          const adjustedCost = item.price * remainingHours;
          const confirmationMessage = await message.reply(
            `You already have **${currentProtection} hours** of rob protection. Would you like to purchase **${remainingHours} more hours** to reach 12 hours for **${adjustedCost.toLocaleString()} coins**? Reply with \`yes\` to confirm or \`no\` to cancel.`
          );

          const filter = (response: any) => {
            return (
              response.author.id === message.author.id &&
              ["yes", "no"].includes(response.content.toLowerCase())
            );
          };

          const collected = await message.channel
            .awaitMessages({
              filter,
              max: 1,
              time: 300000, 
              errors: ["time"],
            })
            .catch(() => {
              confirmationMessage.edit("Purchase timed out. Please try again.");
            });

          const reply = collected?.first()?.content.toLowerCase();

          if (reply === "no") {
            return message.reply("Purchase cancelled.");
          }

          if (reply === "yes") {
            addRobProtection(userId, serverId, remainingHours * 60 * 60 * 1000); 
            updateUserBalance(userId, serverId, -adjustedCost);
            recordPurchase(userId, serverId, item.name);

            return message.reply(
              `You successfully purchased **${remainingHours} hours** of **${
                item.name
              }** for **${adjustedCost.toLocaleString()} coins**! You now have **12 hours** of rob protection.`
            );
          }
        }

        const totalCost = item.price * quantity;
        const newDuration = Math.min(currentProtection + quantity, maxDuration);
        const addedHours = newDuration - currentProtection;

        addRobProtection(userId, serverId, addedHours * 60 * 60 * 1000); 
        updateUserBalance(userId, serverId, -totalCost);
        recordPurchase(userId, serverId, item.name);

        return message.reply(
          `You successfully purchased **${addedHours} hours** of **${
            item.name
          }** for **${totalCost.toLocaleString()} coins**! You now have **${newDuration} hours** of rob protection.`
        );
      }

      const confirmationMessage = await message.reply(
        `Are you sure you want to purchase **${
          item.name
        }** for **${item.price.toLocaleString()} coins**? Reply with \`yes\` to confirm or \`no\` to cancel.`
      );

      const filter = (response: any) => {
        return (
          response.author.id === message.author.id &&
          ["yes", "no"].includes(response.content.toLowerCase())
        );
      };

      const collected = await message.channel
        .awaitMessages({
          filter,
          max: 1,
          time: 300000,
          errors: ["time"],
        })
        .catch(() => {
          confirmationMessage.edit("Purchase timed out. Please try again.");
        });

      const reply = collected?.first()?.content.toLowerCase();

      if (reply === "no") {
        return message.reply("Purchase cancelled.");
      }

      if (reply === "yes") {
        if (item.type === "role") {
          const member = message.member as GuildMember;
          const role = message.guild.roles.cache.get(item.roleId);

          if (!role) {
            return message.reply(
              `The role **${item.name}** is not available on this server.`
            );
          }

          await member.roles.add(role);
        }

        addItemToInventory(userId, serverId, item.name);
        updateUserBalance(userId, serverId, -item.price);
        recordPurchase(userId, serverId, item.name);

        return message.reply(
          `You successfully purchased **${
            item.name
          }** for **${item.price.toLocaleString()} coins**!`
        );
      }
    }
  },
};
