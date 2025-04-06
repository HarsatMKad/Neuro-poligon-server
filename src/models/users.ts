import { Schema, model, Model } from "mongoose";

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  subscription_lvl: string;
  expiration_sup_date: number;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema: Schema = new Schema<IUser, UserModel, IUserMethods>({
  name: {
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
  subscription_lvl: {
    type: String,
    required: true,
  },
  expiration_sup_date: {
    type: Number,
    required: true,
  },
});

const Users = model<IUser, UserModel>("Users", userSchema);

export default Users;
export { IUser };
