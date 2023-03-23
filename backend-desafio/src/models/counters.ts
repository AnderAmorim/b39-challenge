import { model, Schema } from 'mongoose'

export interface ICounter {
  _id: string
  seq: number
}

const CounterSchema = new Schema({
  seq: { type: Number, default: 1 },
  nameCounter: { type: String, require: true }
});

export default model<ICounter>('counter', CounterSchema, 'counter')
