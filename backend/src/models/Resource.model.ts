import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
	title: string;
	description?: string;
	type?: string;
	tags?: string[];
	location?: {
		type: string;
		coordinates: number[];
	};
	eligibility?: string;
	createdAt: Date;
}

const ResourceSchema: Schema = new Schema(
	{
		title: { type: String, required: true },
		description: { type: String },
		type: { type: String },
		tags: [{ type: String }],
		location: {
			type: { type: String, enum: ['Point'], default: 'Point' },
			coordinates: { type: [Number], default: [0, 0] },
		},
		eligibility: { type: String },
	},
	{ timestamps: true }
);

ResourceSchema.index({ location: '2dsphere' });

const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
export default Resource;

