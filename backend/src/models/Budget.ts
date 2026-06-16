import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  user_id: mongoose.Types.ObjectId;
  category_id?: mongoose.Types.ObjectId;
  amount: number;
  month: string; // Format: 'YYYY-MM'
}

const budgetSchema = new Schema<IBudget>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category_id: { type: Schema.Types.ObjectId, ref: 'Category' },
    amount: { type: Number, required: true },
    month: { type: String, required: true }
  },
  { timestamps: true }
);

// Prevent duplicate budget for the same category in the same month for a user
budgetSchema.index({ user_id: 1, category_id: 1, month: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', budgetSchema);
