import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
	user: mongoose.Types.ObjectId;
	title: string;
	body?: string;
}

const NotificationSchema: Schema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User' },
		title: { type: String },
		body: { type: String },
	},
	{ timestamps: true }
);

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;

