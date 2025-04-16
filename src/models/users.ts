import { Schema, model, Model } from "mongoose";

interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  subscription?: Schema.Types.ObjectId;
  expiration_sup_date: number;
  is_deleted: boolean;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema: Schema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: "subscriptions",
  },
  expiration_sup_date: {
    type: Number,
    required: true,
    default: Date.now()
  },
  is_deleted: {
    type: Boolean,
    required: true,
    default: false,
  }
});

const Users = model<IUser, UserModel>("Users", userSchema);

export default Users;
export { IUser };
