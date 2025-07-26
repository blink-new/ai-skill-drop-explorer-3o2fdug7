export interface PodcastEpisode {
  id: string
  userId: string
  firstName: string
  lastName: string
  linkedinProfile: string
  learningResourceLink: string
  resourceType: string
  audioUrl?: string
  photoUrl?: string
  questionId?: string
  status: 'pending' | 'approved' | 'needs_editing'
  editNotes?: string
  createdAt: string
  updatedAt: string
}

export interface ScenarioSubmission {
  id: string
  userId: string
  firstName: string
  lastName: string
  linkedinProfile: string
  learningResourceLink: string
  resourceType: string
  challengeDescription: string
  aiSolutionNarrative: string
  fictionalCharacterName?: string
  status: 'pending' | 'approved' | 'needs_editing'
  editNotes?: string
  createdAt: string
  updatedAt: string
}

export interface SpotlightSubmission {
  id: string
  userId: string
  firstName: string
  lastName: string
  linkedinProfile: string
  linkedinPostLink: string
  consentWebsite: boolean
  consentLinkedinGroup: boolean
  consentYoutube: boolean
  consentInstagram: boolean
  consentFacebook: boolean
  status: 'pending' | 'approved' | 'needs_editing'
  editNotes?: string
  createdAt: string
  updatedAt: string
}

export interface PodcastQuestion {
  id: string
  questionText: string
  audioUrl?: string
  maxRecordingTime: number
  isActive: boolean
  createdAt: string
}

export interface CustomProductionRequest {
  id: string
  userId: string
  firstName: string
  lastName: string
  linkedinProfile?: string
  videoType: string
  projectDescription: string
  targetAudience?: string
  durationPreference?: string
  stylePreference?: string
  budgetRange: string
  timelinePreference?: string
  filesUploaded?: string // JSON array of file URLs
  status: 'submitted' | 'in_review' | 'in_production' | 'draft_ready' | 'approved' | 'completed' | 'paid'
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed'
  paymentAmount?: number
  stripePaymentIntentId?: string
  draftUrl?: string
  finalUrl?: string
  adminNotes?: string
  clientNotes?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  customProductionId?: string
  stripePaymentIntentId: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  createdAt: string
  updatedAt: string
}

export type ContentType = 'podcast' | 'scenario' | 'spotlight' | 'custom'