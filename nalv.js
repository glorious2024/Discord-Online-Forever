
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let accountsData = {}; // Object to store user balances and vouch streaks

// Function to load user data from file
function loadAccounts() {
    try {
        const data = fs.readFileSync('accounts.json');
        accountsData = JSON.parse(data);
    } catch (err) {
        console.error("Error loading accounts:", err);
    }
}

// Function to save user data to file
function saveAccounts() {
    try {
        fs.writeFileSync('accounts.json', JSON.stringify(accountsData));
    } catch (err) {
        console.error("Error saving accounts:", err);
    }
}

// Load accounts when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    loadAccounts();
});

// Function to handle user messages
client.on('messageCreate', (message) => {
    const userId = message.author.id;
    const content = message.content.toLowerCase(); // Convert message content to lowercase
if (content === 'n help') {
  message.reply('n start = To get a nalv account\nn cash = To check nalv balance\nn pro = To see profile\nn steal = To steal nalv currency\nn trans = To transfer nalv currency\nn vouch = To vouce once a day\n n leaderboard = To see leaderboard');
}
    else if (content === 'n start') {
        if (!accountsData[userId]) {
            accountsData[userId] = { balance: 0, lastVouchDate: 0, vouchStreak: 0, lastVouchAmount: 0 };
            saveAccounts();
            message.reply('You\'ve created a nalv account.');
        } 
        
        } else if (content === 'n vouch') {
        const currentDate = new Date();
        const lastVouchDate = accountsData[userId]?.lastVouchDate || 0;
        const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds

        if (currentDate - lastVouchDate < oneDay) {
            const remainingTime = oneDay - (currentDate - lastVouchDate);
            const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000)); // Calculate remaining hours
            const remainingMinutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000)); // Calculate remaining minutes
            message.reply(`Wait for ${remainingHours}H, ${remainingMinutes}M.`);
        } else {
            let streak = accountsData[userId]?.vouchStreak || 0;
            const lastVouchAmount = accountsData[userId]?.lastVouchAmount || 0;
            let amount = lastVouchAmount === 0 ? 50000 : lastVouchAmount + 10000;

            // Reset streak if user missed a day
            if (currentDate - lastVouchDate > oneDay) {
                streak = 0;
                amount = 50000;
            }

            accountsData[userId] = {
                balance: (accountsData[userId]?.balance || 0) + amount,
                lastVouchDate: currentDate.getTime(),
                vouchStreak: streak + 1,
                lastVouchAmount: amount
            };
            saveAccounts();
            message.reply(`You received ${amount} nalv currency. You're on your ${streak + 1} streak.`);
        }
    } 
        // Inside the messageCreate event handler
         else if (content.startsWith('n trans')) {
            const args = content.split(' ');
            if (args.length === 4) { // Corrected length check
                const recipientId = args[2].replace(/[<@!>]/g, ''); // Corrected index for recipient ID
                const amount = parseInt(args[3]); // Corrected index for amount
                if (!isNaN(amount) && amount > 0) {
                    if (accountsData[userId] && accountsData[recipientId]) {
                        if (accountsData[userId].balance >= amount) {
                            accountsData[userId].balance -= amount;
                            accountsData[recipientId].balance += amount;
                            saveAccounts();
                            message.reply(`Transferred ${amount} nalv currency to <@${recipientId}>.`);
                        } else {
                            message.reply('Insufficient balance.');
                        }
                    } else {
                        message.reply('One of the users involved in the transaction does not have a nalv account.');
                    }
                } else {
                    message.reply('Invalid amount. Please specify a valid positive number.');
                }
            } else {
                message.reply('Invalid command usage. Please use the format: n trans @user amount.');
            }
        } // Inside the messageCreate event handler
           else if (content === 'n leaderboard') {
               // Get all users in the current server
               const guild = message.guild;
               const guildMembers = Array.from(guild.members.cache.values()); // Convert to array

               // Filter out users with nalv accounts and retrieve their balances
               const nalvUsers = guildMembers.filter(member => accountsData[member.id]);
               console.log('Nalv Users:', nalvUsers); // Log nalvUsers array
               const nalvUsersBalances = nalvUsers.map(member => ({ id: member.id, balance: accountsData[member.id].balance }));

               // Log nalvUsersBalances array before sorting
               console.log('Nalv Users Balances (Before Sorting):', nalvUsersBalances);

               // Sort nalv users by balance in descending order
               nalvUsersBalances.sort((a, b) => b.balance - a.balance);

               // Limit to top 10 users or less if there are fewer nalv users
               const top10 = nalvUsersBalances.slice(0, 10);

               // Format leaderboard message
               let leaderboardMessage = 'Top 10 Nalv Users with Highest Cash:\n';
               top10.forEach((user, index) => {
                   const member = guild.members.cache.get(user.id);
                   leaderboardMessage += `${index + 1}. ${member ? member.displayName : user.id}: ${user.balance} nalv currency\n`;
               });

               // Send leaderboard message
               message.channel.send(leaderboardMessage);
           }


    
                else if (content === 'n cash') {
        if (accountsData[userId]) {
            message.reply(` ${accountsData[userId].balance} nalv currency.`);
        } else {
            message.reply('You don\'t have a nalv account yet. Use `n start` to create one.');
        }
    } else if (content === 'n pro') {
        message.reply('Your profile is under development.');
    } else if (content === 'n buy burger') {
        if (accountsData[userId]) {
            if (accountsData[userId].balance >= 200) {
                accountsData[userId].balance -= 200;
                saveAccounts();
                message.reply('You have bought a burger. Enjoy!');
            } else {
                message.reply('Insufficient balance. You need at least 200 nalv currency to buy a burger.');
            }
        } else {
            message.reply('You don\'t have a nalv account yet. Use `n start` to create one.');
        }
//BUYING GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
                  

                  
    } else if (content === 'n steal') {
        if (accountsData[userId]) {
            accountsData[userId].balance += 1000;
            saveAccounts();
            message.reply('You stole 1000 nalv currency.');
        } 
    } 
});

// Login to Discord
client.login('MTIxNzcxOTQ1NDE4ODY5OTY3OA.GvUr66.gBAHBSmsR3hFWdDmmbZZxYZCWKq8DVPG_KgDbo');
