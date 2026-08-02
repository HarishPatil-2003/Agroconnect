const z = require('zod');

// Regex Rules
const indianPhoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,64}$/;
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

// Custom base64 file validator
const base64FileSchema = (maxSizeMb = 5, allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
  return z.string().optional().refine((val) => {
    if (!val) return true; // Optional field
    if (val.startsWith('http://') || val.startsWith('https://')) return true; // Allow URL placeholders
    
    // Match base64 pattern (e.g. data:image/png;base64,iVBORw...)
    const matches = val.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
    if (!matches) return false;
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Validate MIME Type
    if (!allowedMimes.includes(mimeType)) return false;
    
    // Validate binary size (base64 is ~33% larger than binary)
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    if (sizeInBytes > maxSizeMb * 1024 * 1024) return false;
    
    return true;
  }, {
    message: `File must be a valid format (${allowedMimes.join(', ')}) and under ${maxSizeMb}MB.`
  });
};

// Common Validators
const mongoIdSchema = z.string().regex(mongoIdRegex, 'Invalid unique ID format.');

// Authentication Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(60, 'Name must be under 60 characters.'),
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.'),
  phone: z.string().refine(val => indianPhoneRegex.test(val.replace(/[^0-9]/g, '')), {
    message: 'Phone number must be a valid 10-digit Indian mobile number.'
  }),
  password: z.string().regex(passwordRegex, {
    message: 'Password must be 8-64 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
  }),
  role: z.enum(['farmer', 'buyer', 'admin'], {
    errorMap: () => ({ message: 'Role must be farmer, buyer, or admin.' })
  }),
  address: z.string().max(200, 'Address must be under 200 characters.').optional().default('')
});

const loginSchema = z.object({
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.'),
  password: z.string().min(1, 'Password is required.')
});

const verifyOtpSchema = z.object({
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits.').regex(/^\d+$/, 'OTP must contain only digits.')
});

const resendOtpSchema = z.object({
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.')
});

const forgotPasswordSchema = z.object({
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.')
});

const resetPasswordSchema = z.object({
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits.').regex(/^\d+$/, 'OTP must contain only digits.'),
  newPassword: z.string().regex(passwordRegex, {
    message: 'New password must be 8-64 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
  })
});

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(60, 'Name must be under 60 characters.').optional(),
  phone: z.string().refine(val => indianPhoneRegex.test(val.replace(/[^0-9]/g, '')), {
    message: 'Phone number must be a valid 10-digit Indian mobile number.'
  }).optional(),
  address: z.string().max(200, 'Address must be under 200 characters.').optional()
});

// Profile Creation & Update (Full Profiles schema)
const profileCreateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.').max(60, 'Full name must be under 60 characters.'),
  email: z.string().regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, 'Only Gmail addresses are allowed.'),
  phone: z.string().refine(val => indianPhoneRegex.test(val.replace(/[^0-9]/g, '')), {
    message: 'Phone number must be a valid 10-digit Indian mobile number.'
  }).optional(),
  address: z.string().max(200, 'Address must be under 200 characters.').optional().default(''),
  state: z.string().optional().default(''),
  district: z.string().optional().default(''),
  village: z.string().optional().default(''),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits.').optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).default('Prefer not to say'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be under 500 characters.').optional().default(''),
  preferredLanguage: z.string().optional().default('English'),
  profilePhoto: base64FileSchema(2), // Max 2MB for profile photo
  farmSize: z.number().nonnegative('Farm size cannot be negative.').optional().default(0),
  primaryCrops: z.array(z.string()).optional().default([]),
  equipmentOwned: z.array(z.string()).optional().default([]),
  businessName: z.string().optional(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST Number format.').optional().or(z.literal(''))
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required.'),
  newPassword: z.string().regex(passwordRegex, {
    message: 'New password must be 8-64 characters with at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
  })
});

const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.').max(100, 'Product name must be under 100 characters.'),
  description: z.string().max(1000, 'Description must be under 1000 characters.'),
  category: z.enum(['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'other'], {
    errorMap: () => ({ message: 'Category must be vegetables, fruits, grains, dairy, meat, or other.' })
  }),
  quantity: z.number().positive('Quantity must be greater than zero.'),
  unit: z.enum(['kg', 'tons', 'pieces', 'liters'], {
    errorMap: () => ({ message: 'Unit must be kg, tons, pieces, or liters.' })
  }),
  basePrice: z.number().positive('Base price must be greater than zero.'),
  biddingEndTime: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid bidding end date.'),
  image: base64FileSchema(5), // Max 5MB for product photos
  images: z.array(base64FileSchema(5)).optional().default([]),
  isOrganic: z.boolean().optional().default(false),
  location: z.string().min(1, 'Location is required.')
});

const productUpdateSchema = productCreateSchema.partial();

const placeBidSchema = z.object({
  amount: z.number().positive('Bid amount must be greater than zero.')
});

// Equipment Hiring Schemas
const equipmentCreateSchema = z.object({
  name: z.string().min(2, 'Equipment name must be at least 2 characters.').max(100, 'Equipment name must be under 100 characters.'),
  category: z.string().min(1, 'Category is required.'),
  brand: z.string().optional().default(''),
  model: z.string().optional().default(''),
  description: z.string().max(1000, 'Description must be under 1000 characters.'),
  image: base64FileSchema(5), // Max 5MB for equipment photos
  images: z.array(base64FileSchema(5)).optional().default([]),
  dailyPrice: z.number().nonnegative('Daily price cannot be negative.'),
  hourlyPrice: z.number().nonnegative('Hourly price cannot be negative.').optional().default(0),
  weeklyPrice: z.number().nonnegative('Weekly price cannot be negative.').optional().default(0),
  monthlyPrice: z.number().nonnegative('Monthly price cannot be negative.').optional().default(0),
  securityDeposit: z.number().nonnegative('Security deposit cannot be negative.').optional().default(0),
  operatorIncluded: z.boolean().default(false),
  fuelIncluded: z.boolean().default(false),
  pickupAvailable: z.boolean().default(true),
  deliveryAvailable: z.boolean().default(false),
  village: z.string().min(1, 'Village is required.'),
  district: z.string().min(1, 'District is required.'),
  state: z.string().min(1, 'State is required.'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const bookingCreateSchema = z.object({
  equipmentId: z.string().regex(mongoIdRegex, 'Invalid equipment ID format.'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start date.'),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end date.'),
  totalPrice: z.number().positive('Total price must be greater than zero.'),
  hoursRequested: z.number().positive('Hours requested must be positive.').optional(),
  deliveryAddress: z.string().max(200, 'Delivery address must be under 200 characters.').optional()
});

const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled', 'completed'], {
    errorMap: () => ({ message: 'Status must be pending, approved, rejected, cancelled, or completed.' })
  })
});

// Chats Schemas
const sendMessageSchema = z.object({
  recipientId: z.string().regex(mongoIdRegex, 'Invalid recipient ID format.'),
  text: z.string().optional().default(''),
  attachments: z.array(base64FileSchema(5)).optional().default([]) // Max 5MB attachments
}).refine(data => data.text.trim() !== '' || data.attachments.length > 0, {
  message: 'Message must contain either text or attachments.',
  path: ['text']
});

// Guidance Schemas
const bookmarkSchema = z.object({
  articleId: z.string().regex(mongoIdRegex, 'Invalid article ID format.')
});

const commentSchema = z.object({
  articleId: z.string().regex(mongoIdRegex, 'Invalid article ID format.'),
  text: z.string().min(1, 'Comment text is required.').max(500, 'Comment text must be under 500 characters.')
});

const askAiSchema = z.object({
  question: z.string().min(1, 'Question is required.').max(500, 'Question must be under 500 characters.')
});

// Admin Schemas
const roleUpdateSchema = z.object({
  role: z.enum(['farmer', 'buyer', 'admin'], {
    errorMap: () => ({ message: 'Role must be farmer, buyer, or admin.' })
  })
});

// Scheme Schemas
const schemeSchema = z.object({
  title: z.string().min(2, 'Scheme title must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  eligibility: z.string().min(2, 'Eligibility details are required.'),
  benefits: z.string().min(2, 'Benefit details are required.'),
  category: z.string().min(2, 'Category is required.'),
  state: z.string().min(2, 'State is required.'),
  link: z.string().url('Invalid link URL format.').optional().or(z.literal(''))
});

const placeBidBuyerSchema = z.object({
  productId: z.string().regex(mongoIdRegex, 'Invalid product ID format.'),
  amount: z.number().positive('Bid amount must be greater than zero.')
});

module.exports = {
  mongoIdSchema,
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  profileCreateSchema,
  changePasswordSchema,
  productCreateSchema,
  productUpdateSchema,
  placeBidSchema,
  placeBidBuyerSchema,
  equipmentCreateSchema,
  bookingCreateSchema,
  bookingStatusSchema,
  sendMessageSchema,
  bookmarkSchema,
  commentSchema,
  askAiSchema,
  roleUpdateSchema,
  schemeSchema
};
