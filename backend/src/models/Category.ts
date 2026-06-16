import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    color: { type: String, default: '#4f46e5' },
    icon: { type: String, default: '🏷️' }
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', categorySchema);
