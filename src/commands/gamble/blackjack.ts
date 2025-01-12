import {
  updateUserBalance,
  getUserBalance,
  recordBlackjack,
  getCoinName,
  getCoinEmote,
} from "../../database/db";

module.exports = {
  name: "blackjack",
  aliases: ["bj"],
  description: "Play blackjack to win or lose your wager.",
  async execute(message: any, args: string[]) {
    const userId = message.author.id;
    const serverId = message.guild.id;

    if (!args[0] || isNaN(Number(args[0]))) {
      return message.reply("Usage: `.blackjack <amount>`");
    }

    const coinName = getCoinName();
    const coinEmote = getCoinEmote();
    const amount = parseInt(args[0], 10);

    if (amount <= 0) {
      return message.reply("@slient The wager amount must be greater than 0.");
    }

    const balance = getUserBalance(userId, serverId);
    if (balance < amount) {
      return message.reply(
        `@slient You don't have enough ${coinEmote} ${coinName} to make this bet.`
      );
    }

    const drawCard = () => Math.floor(Math.random() * 10) + 2;

    const calculateHandValue = (hand: number[]) => {
      let value = hand.reduce((sum, card) => sum + card, 0);
      let aces = hand.filter((card) => card === 11).length;

      while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
      }
      return value;
    };

    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];

    let playerValue = calculateHandValue(playerHand);
    let dealerValue = calculateHandValue(dealerHand);

    await message.reply(
      `@slient Your hand: **${playerHand.join(
        ", "
      )}** (Total: **${playerValue}**) \n` +
        `Dealer's visible card: **${dealerHand[0]}**`
    );

    while (playerValue < 21) {
      await message.reply(
        " @slient Type `hit` to draw another card or `stand` to hold your hand."
      );

      const filter = (response: any) =>
        response.author.id === message.author.id &&
        ["hit", "stand"].includes(response.content.toLowerCase());

      const choice = await message.channel.awaitMessages({
        filter,
        max: 1,
        time: 30000,
        errors: ["time"],
      });

      const action = choice.first()?.content.toLowerCase();

      if (action === "hit") {
        const newCard = drawCard();
        playerHand.push(newCard);
        playerValue = calculateHandValue(playerHand);
        await message.reply(
          `@slient You drew a **${newCard}**. Your hand: **${playerHand.join(
            ", "
          )}** (Total: **${playerValue}**)`
        );

        if (playerValue > 21) {
          recordBlackjack(userId, serverId, "loss_bust");
          updateUserBalance(userId, serverId, -amount);
          return message.reply(
            `@slient You busted with a score of **${playerValue}**. You lost **${amount} ${coinEmote} ${coinName}**.`
          );
        }
      } else if (action === "stand") {
        break;
      }
    }

    await message.reply(
      `@slient Dealer's hand: **${dealerHand.join(
        ", "
      )}** (Total: **${dealerValue}**)`
    );

    while (dealerValue < 17) {
      const newCard = drawCard();
      dealerHand.push(newCard);
      dealerValue = calculateHandValue(dealerHand);
      await message.reply(
        `@slient Dealer drew a **${newCard}**. Dealer's hand: **${dealerHand.join(
          ", "
        )}** (Total: **${dealerValue}**)`
      );
    }

    if (dealerValue > 21 || playerValue > dealerValue) {
      recordBlackjack(userId, serverId, "win");
      updateUserBalance(userId, serverId, amount);
      return message.reply(
        `@slient You won with a score of **${playerValue}**! Dealer scored **${dealerValue}**. You gained **${amount} ${coinEmote} ${coinName}**.`
      );
    } else if (dealerValue > playerValue) {
      recordBlackjack(userId, serverId, "loss_house");
      updateUserBalance(userId, serverId, -amount);
      return message.reply(
        `@slient You lost. Dealer: **${dealerValue}**, You: **${playerValue}**. Lost **${amount} ${coinEmote} ${coinName}**.`
      );
    } else {
      recordBlackjack(userId, serverId, "draw");
      return message.reply(
        `@slient It's a tie! Both you and the dealer scored **${playerValue}**. Your wager is returned.`
      );
    }
  },
};
