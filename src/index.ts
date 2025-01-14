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

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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
  if (!message.content.startsWith(".") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase() ?? "";

  const command =
    commands.get(commandName) ||
    commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return;
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    message.reply("There was an error executing that command!");
  }
});

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error("Error: No TOKEN found in .env file");
  process.exit(1);
}
client.login(TOKEN);
