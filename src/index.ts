import express from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';
require('dotenv/config');

import DeviceModel from './entities/devices';

mongoose.connect(process.env.MONGODB_URL as string, { useNewUrlParser: true, useUnifiedTopology: true });

const redis = new Redis(Number(process.env.REDIS_PORT), process.env.REDIS_HOST, {});

redis.flushall();

const seedData = async () => {
  const devices = await DeviceModel.find({});

  if (devices.length === 0) {
    const devices = [
      new DeviceModel({ name: 'IPhone XS', kind: 'phone', price: 600 }),
      new DeviceModel({ name: 'Fifine k770', kind: 'microphone', price: 200 }),
      new DeviceModel({ name: 'HH Keyboard', kind: 'keyboard', price: 200 }),
    ];

    devices.map((device) => device.save());
    console.log('seed data was created successfully');
    return;
  }

  console.log('nothing to seed, db is not empty');
};

(async function () {
  await seedData();

  const app = express();

  app.use(async (req, res, next) => {
    const remoteIp = String(req.headers['ip-address'] || req.socket.remoteAddress);

    redis.get(`session:${remoteIp}`, (err, result) => {
      if (err) {
        res.status(500).end('redis error on reading from mem');
      }

      const json = JSON.parse(String(result));
      const count = json?.count || 0;

      redis.set(
        `session:${remoteIp}`,
        JSON.stringify({
          ip: remoteIp,
          lastVisitAt: new Date().toUTCString(),
          count: count + 1,
        })
      );

      next();
    });
  });

  app.get('/', async (req, res) => {
    res.end('please try /cicd/sessions or /cicd/devices')
  });

  app.get('/sessions', async (req, res) => {
    const keys = await redis.keys('*session*');

    const promises = keys.map(async (key) => {
      return new Promise((resolve, reject) => {
        redis.get(key, (err, result: any) => {
          if (err) {
            reject(err);
          }

          resolve(JSON.parse(result));
        });
      });
    });

    const result = await Promise.all(promises);

    res.json(result);
  });

  app.get('/devices', async (req, res) => {
    const devices = await DeviceModel.find({});
    res.json({
      data: devices,
      size: devices.length,
    });
  });

  app.listen(process.env.PORT || 7777, () => console.log('server is listening on port', process.env.PORT || 7777));
})();
