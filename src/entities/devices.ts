import mongoose from 'mongoose'

const deviceModel = mongoose.model('Device', new mongoose.Schema({
    name: {
        type: String
    },
    kind: {
        type: String
    },
    price: {
        type: Number
    }
}))

export default deviceModel;
