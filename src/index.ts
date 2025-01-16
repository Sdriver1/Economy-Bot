import {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import db from "./database/db";
const initCoinDrops = require("./events/coindrop");
import { addBlacklist, isBlacklisted } from "./database/db";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const messageCache = new Map();
const warnedUsers = new Set();

const commands = new Collection<string, any>();

const commandFolders = ["admin", "bank", "gamble", "chat", "shop", "tools"];
for (const folder of commandFolders) {
  const folderPath = path.resolve(__dirname, "commands", folder);

  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (!command.name || typeof command.execute !== "function") {
      console.error(`Invalid command file: ${file}`);
      continue;
    }
    commands.set(command.name, command);
  }
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  initCoinDrops.init(client);

  const activities = async () => [
    `Managing a total of ${await getTotalMoney(
      "1125796993688666203"
    )} coins! | .h for help`,
    `Watching over ${await getUserCountWithMoney(
      "1125796993688666203"
    )} wealthy users! | .h for help`,
  ];

  let index = 0;

  const setDynamicActivity = async () => {
    const activityList = await activities();
    client.user?.setActivity(activityList[index], {
      type: ActivityType.Playing,
    });
    index = (index + 1) % activityList.length;
  };

  setDynamicActivity();
  setInterval(setDynamicActivity, 10000);
});

async function getTotalMoney(serverId: string): Promise<string> {
  const result = db
    .prepare("SELECT SUM(balance) AS total FROM users WHERE server_id = ?")
    .get(serverId) as { total: number } | undefined;

  const total = result?.total || 0;

  return total.toLocaleString();
}

async function getUserCountWithMoney(serverId: string): Promise<string> {
  const result = db
    .prepare(
      "SELECT COUNT(*) AS count FROM users WHERE server_id = ? AND balance > 0"
    )
    .get(serverId) as { count: number } | undefined;

  const count = result?.count || 0;

  return count.toLocaleString();
}

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();

  if (await isBlacklisted(userId, message.guild.id)) {
    return;
  }

  if (!messageCache.has(userId)) {
    messageCache.set(userId, []);
  }

  const userMessages = messageCache.get(userId);
  userMessages.push({ content: message.content, timestamp: now });

  messageCache.set(
    userId,
    userMessages.filter(
      (msg: { timestamp: number }) => now - msg.timestamp < 10000
    )
  );

  if (userMessages.length >= 5) {
    const uniqueMessages = new Set(
      userMessages.map((m: { content: any }) => m.content)
    );

    if (uniqueMessages.size <= 2) {
      console.log(
        `Auto-sender detected: ${message.author.tag} (${userId}) in ${message.guild.name}`
      );

      if (warnedUsers.has(userId)) {
        console.log(
          `Blacklisting ${message.author.tag} for continued auto-sending.`
        );

        await addBlacklist(userId, message.guild.id);
        if (message.member) {
          await message.member.timeout(
            1 * 60 * 60 * 1000,
            "Auto-sender detected"
          );
          await message.reply(
            "🚨 **You have been blacklisted for auto-sending.**"
          );
        }
        return;
      }

      warnedUsers.add(userId);
      await message.reply(
        "⚠ **Auto-sender detected!** Please slow down or you will be blacklisted in 15 seconds."
      );

      setTimeout(async () => {
        if (messageCache.has(userId) && messageCache.get(userId).length >= 5) {
          console.log(
            `Blacklisting ${message.author.tag} for continued auto-sending.`
          );
          if (message.member) {
            await message.member.timeout(
              1 * 60 * 60 * 1000,
              "Auto-sender detected"
            );
            await message.channel.send(
              `🚨 **${message.author.tag} has been blacklisted for continued auto-sending.**`
            );
          }
          await message.channel.send(
            `🚨 **${message.author.tag} has been blacklisted for continued auto-sending.**`
          );
        }
        warnedUsers.delete(userId);
      }, 15000);
    }
  }
});

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error("Error: No TOKEN found in .env file");
  process.exit(1);
}
client.login(TOKEN);
