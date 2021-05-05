import discord
import os
import json

# Init client and DB
client = discord.Client() # init discord client
pathToDB = "db.json" # db file
data = {}

@client.event
async def on_ready():
    global data
    data = initDB()
    print('We have logged in as {0.user}'.format(client))

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
        _nameList = []
        names = data.user.name
        print(names)
        # print each name out line by line
        # for n in data.user.name:
        await message.channel.send(data)

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

os.environ["token"] = "ODM4OTUwMDYxMjQ5Mzk2NzY3.YJCjIQ.kdn829zRQRpwVvjJT_nbgTWqHkI" # Set the token
client.run(os.getenv("token"))