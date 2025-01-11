import { EmbedBuilder } from "discord.js";
import { getCoinName, getCoinEmote } from "../../database/db";

module.exports = {
  name: "help",
  aliases: ["commands", "h"],
  description: "List all available commands.",
  execute(message: any) {
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();
    const commands = [
      { name: ".bal / .balance / .b", description: "Check your balance." },
      { name: ".cf h/t <amount>", description: "Flip a coin and wager money." },
      { name: ".bj <amount>", description: "Play blackjack and wager money." },
      { name: ".lot / .lottery <amount>", description: "Enter the lottery." },
      {
        name: ".lb / .leaderboard",
        description: "Show the top 10 richest users.",
      },
      { name: ".stats", description: "Show user and server stats." },
      {
        name: ".donate <user> <amount>",
        description: "Donate coins to another user.",
      },
    ];

    const adminCommands = [
      { name: ".config-name <new_name>", description: "Set the coin's name." },
      {
        name: ".config-emote <new_emote>",
        description: "Set the coin's emote.",
      },
      {
        name: ".give-money <user> <amount>",
        description: "Give coins to a user.",
      },
      {
        name: ".set-balance <user> <amount>",
        description: "Set a user's balance.",
      },
      { name: ".view-config", description: "View the current configuration." },
    ];

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("Help - List of Commands")
      .setDescription(
        `Below are the available commands for this bot. \n- Current Coin Name: **${coinName}**\n- Current Coin Emote: **${coinEmote}**`
      )
      .addFields(
        {
          name: "Regular Commands",
          value: commands
            .map((cmd) => `\`${cmd.name}\` - ${cmd.description}`)
            .join("\n"),
        },
        {
          name: "Admin Commands",
          value: adminCommands
            .map((cmd) => `\`${cmd.name}\` - ${cmd.description}`)
            .join("\n"),
        }
      )
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    // Send the embed
    message.reply({ embeds: [embed] });
  },
};
