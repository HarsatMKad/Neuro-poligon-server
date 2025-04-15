import { Schema, model } from "mongoose";

interface ISubscriptions {
  _id: string;
  name: string;
  description: string;
  lvl: number;
  price: number;
  duration: number;
  valid: boolean;
}

const defaultDuration = 30 * 24 * 60 * 60 * 1000;

const substrates: Schema = new Schema<ISubscriptions>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  lvl: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  duration: {
    type: Number,
    required: true,
    default: defaultDuration,
  },
  valid: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Subscription = model<ISubscriptions>("subscriptions", substrates);

export default Subscription;
export { ISubscriptions };
