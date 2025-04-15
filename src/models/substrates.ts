import { Schema, model } from "mongoose";

interface ISubstrates {
  _id: string;
  user_id: Schema.Types.ObjectId;
  original_name: string;
  image: string;
}

const substrates: Schema = new Schema<ISubstrates>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  original_name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Substrates = model<ISubstrates>("substrates", substrates);

export default Substrates;
export { ISubstrates };