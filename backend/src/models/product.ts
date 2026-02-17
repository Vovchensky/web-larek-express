import mongoose, { Schema } from 'mongoose';
import { deleteFile } from '../helpers/file-utils';

interface IProduct {
  title: string;
  image: { fileName: string; originalName: string };
  category: string;
  description?: string;
  price: number | null;
}

const imageSchema = new Schema(
  {
    fileName: { type: String, required: [true, 'Поле "fileName" должно быть заполнено'] },
    originalName: { type: String, required: [true, 'Поле "originalName" должно быть заполнено'] },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: { type: imageSchema, required: [true, 'Поле "image" должно быть заполнено'] },
  category: { type: String, required: [true, 'Поле "category" должно быть заполнено'] },
  description: { type: String },
  price: { type: Number, default: null },
});

productSchema.post('findOneAndDelete', (doc) => {
  if (doc && doc.image && doc.image.fileName) {
    deleteFile(doc.image.fileName);
  }
});

export default mongoose.model<IProduct>('product', productSchema);
