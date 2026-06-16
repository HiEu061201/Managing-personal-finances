import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  user_id: mongoose.Types.ObjectId;
  wallet_id: mongoose.Types.ObjectId;
  category_id?: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  category: string;
  note?: string;
}

const TransactionSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wallet_id: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category' },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  note: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
