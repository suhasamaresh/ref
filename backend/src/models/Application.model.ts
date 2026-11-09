import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
	user: mongoose.Types.ObjectId;
	status: string;
	data?: any;
	createdAt: Date;
}

const ApplicationSchema: Schema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		status: { type: String, default: 'pending' },
		data: { type: Schema.Types.Mixed },
	},
	{ timestamps: true }
);

const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
export default Application;

