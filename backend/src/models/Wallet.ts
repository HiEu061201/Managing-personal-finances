import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  balance: number;
  isDefault: boolean;
}

const walletSchema = new Schema<IWallet>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>('Wallet', walletSchema);
