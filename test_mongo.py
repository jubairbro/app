import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_conn():
    uri = "mongodb+srv://admin:admin123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        print("MongoDB connected!")
    except Exception as e:
        print("Error:", e)
asyncio.run(test_conn())
