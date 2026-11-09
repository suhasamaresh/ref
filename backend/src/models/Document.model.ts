import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
	owner: mongoose.Types.ObjectId;
	filename: string;
	url: string;
}

const DocumentSchema: Schema = new Schema(
	{
		owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		filename: { type: String, required: true },
		url: { type: String, required: true },
	},
	{ timestamps: true }
);

const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
export default DocumentModel;

