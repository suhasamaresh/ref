import mongoose, { Document, Schema } from 'mongoose';

export interface IIdentityDocument extends Document {
	userId: mongoose.Types.ObjectId;
	type: string;
	number?: string;
	name?: string;
	dateOfBirth?: string;
	expiryDate?: string;
	issuingCountry?: string;
	fileUrl?: string;
	verified: boolean;
	verificationScore: number;
	verificationConfidence: number;
	verificationIssues: string[];
	verifiedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const IdentityDocumentSchema: Schema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		type: {
			type: String,
			required: true,
			enum: ['passport', 'national_id', 'birth_certificate', 'refugee_card', 
			       'utility_bill', 'bank_statement', 'employment_letter']
		},
		number: { type: String },
		name: { type: String },
		dateOfBirth: { type: String },
		expiryDate: { type: String },
		issuingCountry: { type: String },
		fileUrl: { type: String },
		verified: { type: Boolean, default: false },
		verificationScore: { type: Number, default: 0 },
		verificationConfidence: { type: Number, default: 0 },
		verificationIssues: [{ type: String }],
		verifiedAt: { type: Date },
	},
	{ timestamps: true }
);

const IdentityDocument = mongoose.model<IIdentityDocument>('IdentityDocument', IdentityDocumentSchema);
export default IdentityDocument;
