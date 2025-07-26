import { useState } from 'react'
import { Star, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { blink } from '@/blink/client'

export function SpotlightForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [linkedinPostLink, setLinkedinPostLink] = useState('')
  
  // Consent checkboxes
  const [consentWebsite, setConsentWebsite] = useState(false)
  const [consentLinkedinGroup, setConsentLinkedinGroup] = useState(false)
  const [consentYoutube, setConsentYoutube] = useState(false)
  const [consentInstagram, setConsentInstagram] = useState(false)
  const [consentFacebook, setConsentFacebook] = useState(false)

  const handleSubmit = async () => {
    if (!firstName || !lastName || !linkedinProfile || !linkedinPostLink) {
      return
    }

    // At least one platform must be selected
    if (!consentWebsite && !consentLinkedinGroup && !consentYoutube && !consentInstagram && !consentFacebook) {
      return
    }

    setIsSubmitting(true)
    try {
      await blink.db.spotlightSubmissions.create({
        id: `spotlight_${Date.now()}`,
        userId: (await blink.auth.me()).id,
        firstName,
        lastName,
        linkedinProfile,
        linkedinPostLink,
        consentWebsite,
        consentLinkedinGroup,
        consentYoutube,
        consentInstagram,
        consentFacebook,
        status: 'pending'
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting spotlight:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasAnyConsent = consentWebsite || consentLinkedinGroup || consentYoutube || consentInstagram || consentFacebook

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Spotlight Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your AI Skill Drop spotlight consent has been submitted. We'll create a video spotlight of your LinkedIn post and share it on the platforms you selected.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Submit Another Spotlight
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>AI Skill Drop Spotlight</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-900 font-medium mb-2">Share Your Learning Resource</p>
            <p className="text-yellow-800 text-sm">
              Have you posted about a great learning resource on LinkedIn? Give us consent to create a short video spotlight 
              of your post and share it across AI Skill Drop's platforms to help others discover valuable learning content.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contributor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin">Your LinkedIn Profile</Label>
            <Input
              id="linkedin"
              value={linkedinProfile}
              onChange={(e) => setLinkedinProfile(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <Label htmlFor="postLink">LinkedIn Post Link</Label>
            <Input
              id="postLink"
              value={linkedinPostLink}
              onChange={(e) => setLinkedinPostLink(e.target.value)}
              placeholder="https://linkedin.com/posts/yourpost"
            />
            <p className="text-sm text-gray-600 mt-1">
              Link to the LinkedIn post about a learning resource that you'd like us to spotlight
            </p>
          </div>

          {linkedinPostLink && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <a 
                  href={linkedinPostLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Preview your LinkedIn post
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Consent */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            Select the platforms where you give AI Skill Drop permission to share your spotlight video:
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="website"
                checked={consentWebsite}
                onCheckedChange={(checked) => setConsentWebsite(checked as boolean)}
              />
              <Label htmlFor="website" className="text-sm font-medium">
                AI Skill Drop Website
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="linkedinGroup"
                checked={consentLinkedinGroup}
                onCheckedChange={(checked) => setConsentLinkedinGroup(checked as boolean)}
              />
              <Label htmlFor="linkedinGroup" className="text-sm font-medium">
                AI Skill Drop LinkedIn Group
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="youtube"
                checked={consentYoutube}
                onCheckedChange={(checked) => setConsentYoutube(checked as boolean)}
              />
              <Label htmlFor="youtube" className="text-sm font-medium">
                AI Skill Drop YouTube Channel
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="instagram"
                checked={consentInstagram}
                onCheckedChange={(checked) => setConsentInstagram(checked as boolean)}
              />
              <Label htmlFor="instagram" className="text-sm font-medium">
                AI Skill Drop Instagram Feed
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="facebook"
                checked={consentFacebook}
                onCheckedChange={(checked) => setConsentFacebook(checked as boolean)}
              />
              <Label htmlFor="facebook" className="text-sm font-medium">
                AI Skill Drop Facebook Page
              </Label>
            </div>
          </div>

          {!hasAnyConsent && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-800 text-sm">
                Please select at least one platform where you consent to sharing your spotlight.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📋 Consent Agreement</h4>
            <p className="text-sm text-gray-700">
              By submitting this form, you consent to AI Skill Drop creating a short video spotlight of your LinkedIn post 
              and sharing it on the selected platforms. You retain all rights to your original content, and we will provide 
              proper attribution to you as the original author.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!firstName || !lastName || !linkedinProfile || !linkedinPostLink || !hasAnyConsent || isSubmitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Spotlight Consent'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}