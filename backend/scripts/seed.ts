import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Resource from '../src/models/Resource.model.ts';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/refugee_ai';

const resources = [
  {
    title: 'Emergency Shelter Network',
    description: 'Temporary shelter, case management, and intake support for families in crisis.',
    type: 'housing',
    tags: ['shelter', 'emergency', 'family', 'temporary housing'],
    eligibility: 'Open to displaced families and individuals needing immediate housing.',
  },
  {
    title: 'Safe Nights Housing Program',
    description: 'Short-term housing placement with referrals to longer-term rental support.',
    type: 'housing',
    tags: ['housing', 'rental assistance', 'placement'],
    eligibility: 'Adults and families with proof of displacement or low income.',
  },
  {
    title: 'City Legal Aid Clinic',
    description: 'Immigration consultations, asylum support, and document replacement guidance.',
    type: 'legal',
    tags: ['legal aid', 'immigration', 'asylum', 'documents'],
    eligibility: 'Low-income residents and recent arrivals.',
  },
  {
    title: 'Refugee Rights Project',
    description: 'Free legal education sessions and case referrals for immigration matters.',
    type: 'legal',
    tags: ['rights', 'immigration lawyer', 'asylum'],
    eligibility: 'Open referral-based service.',
  },
  {
    title: 'Community Health Access Clinic',
    description: 'Primary care, vaccinations, and basic medical checkups at low or no cost.',
    type: 'healthcare',
    tags: ['clinic', 'vaccination', 'medical care'],
    eligibility: 'No insurance required for most services.',
  },
  {
    title: 'Mental Wellness Support Center',
    description: 'Counseling, trauma support, and crisis referrals in multiple languages.',
    type: 'healthcare',
    tags: ['mental health', 'counseling', 'support'],
    eligibility: 'Walk-in and appointment-based support available.',
  },
  {
    title: 'New Start Job Hub',
    description: 'Resume help, job coaching, and placement support for newcomers.',
    type: 'employment',
    tags: ['job training', 'resume help', 'placement'],
    eligibility: 'Adults seeking work authorization or employment support.',
  },
  {
    title: 'SkillBridge Training',
    description: 'Vocational training, interview practice, and employer matching.',
    type: 'employment',
    tags: ['training', 'employment services', 'skills'],
    eligibility: 'Job seekers with beginner English supported.',
  },
  {
    title: 'Language Learning Center',
    description: 'ESL and literacy classes for adults and teens.',
    type: 'education',
    tags: ['ESL', 'language classes', 'adult education'],
    eligibility: 'Open enrollment each month.',
  },
  {
    title: 'School Enrollment Navigator',
    description: 'Assistance with school placement, records, and local enrollment paperwork.',
    type: 'education',
    tags: ['school enrollment', 'children', 'family'],
    eligibility: 'Families with school-age children.',
  },
  {
    title: 'Food Bank Connect',
    description: 'Weekly food parcels, emergency groceries, and nutrition referrals.',
    type: 'food',
    tags: ['food bank', 'food assistance', 'meals'],
    eligibility: 'Open to people facing food insecurity.',
  },
  {
    title: 'Community Meal Network',
    description: 'Hot meals and pantry items for families and individuals in need.',
    type: 'food',
    tags: ['free meals', 'community kitchen'],
    eligibility: 'No registration required.',
  },
  {
    title: 'Emergency Cash Relief Desk',
    description: 'Short-term grants and emergency cash referrals for urgent needs.',
    type: 'financial',
    tags: ['cash assistance', 'grants', 'emergency funds'],
    eligibility: 'Case-by-case assistance for verified hardship.',
  },
  {
    title: 'Financial Stabilization Program',
    description: 'Budgeting support, benefits screening, and small emergency grants.',
    type: 'financial',
    tags: ['financial aid', 'benefits', 'support'],
    eligibility: 'Applicants must meet income criteria.',
  },
  {
    title: 'Transit Pass Assistance',
    description: 'Bus passes and travel vouchers for appointments and case management.',
    type: 'transportation',
    tags: ['bus passes', 'travel vouchers', 'transport'],
    eligibility: 'Clients with verified service appointments.',
  },
  {
    title: 'Ride Access Program',
    description: 'Transportation support for medical, legal, and relocation appointments.',
    type: 'transportation',
    tags: ['transportation assistance', 'rides'],
    eligibility: 'Case-managed clients only.',
  },
  {
    title: 'Bright Steps Childcare',
    description: 'Daycare slots and after-school support for newcomer families.',
    type: 'childcare',
    tags: ['daycare', 'family support', 'after school'],
    eligibility: 'Families enrolled in partner services.',
  },
  {
    title: 'Family Support Center',
    description: 'Parenting support, childcare referrals, and early-learning assistance.',
    type: 'childcare',
    tags: ['child services', 'family support'],
    eligibility: 'Parents and guardians needing childcare support.',
  },
  {
    title: 'Neighborhood Welcome Hub',
    description: 'Community space with social groups, orientation, and cultural events.',
    type: 'community',
    tags: ['community center', 'support groups', 'cultural'],
    eligibility: 'Open to all newcomers and residents.',
  },
  {
    title: 'Faith and Community Support Line',
    description: 'Referral line to local cultural and religious support organizations.',
    type: 'community',
    tags: ['community support', 'religious services'],
    eligibility: 'Open referral service.',
  },
  {
    title: 'Rapid Response Hotline',
    description: '24/7 emergency support and crisis referral coordination.',
    type: 'emergency',
    tags: ['crisis hotline', '24/7 support', 'immediate help'],
    eligibility: 'Anyone needing urgent support.',
  },
  {
    title: 'Immediate Safety Desk',
    description: 'Emergency assistance for unsafe housing, violence, or displacement.',
    type: 'emergency',
    tags: ['emergency assistance', 'safety', 'urgent'],
    eligibility: 'High-priority urgent cases.',
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  } as any);

  await Resource.deleteMany({});
  await Resource.insertMany(resources);

  console.log(`Seeded ${resources.length} resources into ${MONGODB_URI}`);
}

main()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore disconnect errors
    }
    process.exit(1);
  });
