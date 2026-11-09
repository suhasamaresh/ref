import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
	name: string;
	email: string;
	password?: string;
	createdAt: Date;
	skills?: string[];
	interests?: string[];
	needs?: string[];
	location?: string;
	language?: string;
	trustScore?: number;
	trustLevel?: string;
	kycStatus?: string;
	activityScore?: number;
	verificationStatus?: string;
}

const UserSchema: Schema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, select: false },
		skills: [{ type: String }],
		interests: [{ type: String }],
		needs: [{ type: String }],
		location: { type: String },
		language: { type: String },
		trustScore: { type: Number, default: 0 },
		trustLevel: { type: String, default: 'Low' },
		kycStatus: { type: String, default: 'none' },
		activityScore: { type: Number, default: 0 },
		verificationStatus: { type: String, default: 'unverified' },
	},
	{ timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);
export default User;

