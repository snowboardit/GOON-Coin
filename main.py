import discord
import os
import json

# define client and DB
client = discord.Client() # init discord client
pathToDB = "db.json" # db file
data = {} # working cache

# print user id and init DB in console when logged into Discord
@client.event
async def on_ready():
    global data
    data = initDB()
    print('We have logged in as {0.user}'.format(client))

# 
@client.event
async def on_message(message):
    if message.author == client.user:
        return

    # Hello
    if message.content.startswith('*hello'):
        await message.channel.send('Hello!')

    # Help
    if message.content.startswith('*help'):
        await message.channel.send('No!')

    # List Users
    if message.content.startswith('*users'):
        _nameResult = ''
        users = data['users']
        if len(users) != 0:
            for u in users:
                _nameResult += '\n{}'.format(u['name'])
        else:
            _nameResult = "Boo hoo no users yet. Go get some friends into crypto you pleb."
        await message.channel.send(_nameResult) # return result to discord

    # Link Address to User
    if message.content.startswith('*'):




def getData():
    _data = {}
    if os.path.exists(pathToDB):
        with open(pathToDB) as db:
            _data = json.load(db)
    else:
        _data = None
    return _data

def setData():
    with open(pathToDB, "w") as out:
        json.dump(data, out)

def initDB():
    _data = {}
    if getData() is not None or getData() is not {}:
        _data = getData()
        print("data:\n{}".format(_data))
    else:
        print("no data for u")
    return _data

# token and run
os.environ["token"] = "ODM4OTUwMDYxMjQ5Mzk2NzY3.YJCjIQ.kdn829zRQRpwVvjJT_nbgTWqHkI" # Set the token
client.run(os.getenv("token"))