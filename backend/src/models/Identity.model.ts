import mongoose, { Document, Schema } from 'mongoose';

export interface IIdentity extends Document {
	user: mongoose.Types.ObjectId;
	documents: mongoose.Types.ObjectId[];
	verified: boolean;
}

const IdentitySchema: Schema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
		verified: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Identity = mongoose.model<IIdentity>('Identity', IdentitySchema);
export default Identity;

