import { Schema, model } from "mongoose";

interface ICustomSubstrates {
  _id: string;
  user_id: Schema.Types.ObjectId;
  original_name: string;
  image: string;
}

const customSubstrates: Schema = new Schema<ICustomSubstrates>({
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

const CustomSubstrates = model<ICustomSubstrates>("custom_substrates", customSubstrates);

export default CustomSubstrates;
export { ICustomSubstrates };