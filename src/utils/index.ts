import DeviceModel from '../entities/devices'

export const seedData = async () => {
  const devices = await DeviceModel.find({});

  if (devices.length === 0) {
    const devices = [
      new DeviceModel({ name: 'IPhone XR', kind: 'phone', price: 600 }),
      new DeviceModel({ name: 'Fifine k770', kind: 'microphone', price: 200 }),
      new DeviceModel({ name: 'HH Keyboard', kind: 'keyboard', price: 200 }),
    ];

    devices.map((device) => device.save());
    console.log('seed data was created successfully');
    return;
  }

  console.log('nothing to seed, db is not empty');
};