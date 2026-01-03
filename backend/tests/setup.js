import 'dotenv/config'; 
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/app.js'; 

let mongod;
export let server;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    server = app.listen(4001); 

    const mockIo = {
        to: () => ({
            emit: () => {}, 
        }),
    };
    app.set('io', mockIo);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    await new Promise(resolve => server.close(resolve));
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

expect.extend({
  toBeOneOf(received, items) {
    const pass = items.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${items.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${items.join(', ')}`,
        pass: false,
      };
    }
  },
});