import { Schema, model, Model } from "mongoose";

interface ICustomSubstrates {
  _id: string;
  user_id: Schema.Types.ObjectId;
  image: string;
}

const customSubstrates: Schema = new Schema<ICustomSubstrates>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  image: {
    type: String,
    required: true,
  },
});

const CustomSubstrates = model<ICustomSubstrates>("Courses", customSubstrates);

export default CustomSubstrates;
export { ICustomSubstrates };