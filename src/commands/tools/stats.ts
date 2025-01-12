import { EmbedBuilder } from "discord.js";
import {
  getUserBalance,
  getCoinflipStats,
  getServerBlackjackStats,
  getCoinName,
  getCoinEmote,
  getDailyData,
} from "../../database/db";

module.exports = {
  name: "stats",
  description: "Show user and server stats.",
  async execute(message: any) {
    const userId = message.author.id;
    const serverId = message.guild.id;
    const coinName = getCoinName();
    const coinEmote = getCoinEmote();

    const db = require("../../database/db").default;
    const userBalance = getUserBalance(userId, serverId);
    const userCoinflipStats = db
      .prepare(
        `
        SELECT coinflip_heads AS heads, coinflip_tails AS tails,
               blackjack_wins AS wins, blackjack_losses_bust AS lossesBust,
               blackjack_losses_house AS lossesHouse
        FROM users WHERE id = ? AND server_id = ?
      `
      )
      .get(userId, serverId);

    const userRank =
      db
        .prepare(
          `
        SELECT COUNT(*) AS rank
        FROM users
        WHERE server_id = ? AND balance > ?
      `
        )
        .get(serverId, userBalance)?.rank + 1 || 1;

    const serverBank =
      db
        .prepare("SELECT SUM(balance) AS total FROM users WHERE server_id = ?")
        .get(serverId)?.total || 0;

    const serverCoinflipStats = getCoinflipStats(serverId);
    const serverBlackjackStats = getServerBlackjackStats(serverId);
    const totalUsers =
      db
        .prepare("SELECT COUNT(*) AS count FROM users WHERE server_id = ?")
        .get(serverId)?.count || 0;

    const dailyData = getDailyData(userId, serverId);
    const dailyStreak = dailyData.streak;

    const embed = new EmbedBuilder()
      .setColor("#1E90FF")
      .setTitle(`${message.author.username}'s Stats`)
      .addFields(
        {
          name: "User Stats",
          value: `
          **Balance**: ${userBalance} ${coinEmote} ${coinName}
          **Coinflip Stats**: Heads - ${
            userCoinflipStats?.heads || 0
          }, Tails - ${userCoinflipStats?.tails || 0}
          **Blackjack Stats**: Wins - ${
            userCoinflipStats?.wins || 0
          }, Losses (Bust) - ${
            userCoinflipStats?.lossesBust || 0
          }, Losses (House) - ${userCoinflipStats?.lossesHouse || 0}
          **Daily Streak**: ${dailyStreak} day(s)
          **Leaderboard Position**: #${userRank}
          `,
        },
        {
          name: "Server Stats",
          value: `
          **Server Bank**: ${serverBank} ${coinEmote} ${coinName}
          **Total Users**: ${totalUsers}
          **Coinflip Stats**: Heads - ${serverCoinflipStats.heads}, Tails - ${serverCoinflipStats.tails}
          **Blackjack Stats**: Wins - ${serverBlackjackStats.wins}, Losses (Bust) - ${serverBlackjackStats.lossesBust}, Losses (House) - ${serverBlackjackStats.lossesHouse}
          `,
        }
      )
      .setFooter({
        text: `Server: ${
          message.guild.name
        } | ${new Date().toLocaleDateString()}`,
      });

    message.reply({ embeds: [embed] });
  },
};
