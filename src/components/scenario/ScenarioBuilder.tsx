import { useState } from 'react'
import { FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blink } from '@/blink/client'

export function ScenarioBuilder() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [learningResourceLink, setLearningResourceLink] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [challengeDescription, setChallengeDescription] = useState('')
  const [aiSolutionNarrative, setAiSolutionNarrative] = useState('')
  const [fictionalCharacterName, setFictionalCharacterName] = useState('')

  const handleSubmit = async () => {
    if (!firstName || !lastName || !linkedinProfile || !learningResourceLink || !resourceType || !challengeDescription || !aiSolutionNarrative) {
      return
    }

    setIsSubmitting(true)
    try {
      await blink.db.scenarioSubmissions.create({
        id: `scenario_${Date.now()}`,
        userId: (await blink.auth.me()).id,
        firstName,
        lastName,
        linkedinProfile,
        learningResourceLink,
        resourceType,
        challengeDescription,
        aiSolutionNarrative,
        fictionalCharacterName: fictionalCharacterName || undefined,
        status: 'pending'
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting scenario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Scenario Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your AI Skill Drop scenario has been submitted for review. You'll be notified once it's approved.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Create Another Scenario
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
            <FileText className="w-5 h-5 text-blue-600" />
            <span>AI Skill Drop Scenario Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900 font-medium mb-2">Create a Fictional Scenario</p>
            <p className="text-blue-800 text-sm">
              Share a learning resource by creating a fictional scenario that showcases how someone might use AI to solve a common workplace challenge. 
              This helps others understand practical applications of AI tools and techniques.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contributor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contributor Information</CardTitle>
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
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              value={linkedinProfile}
              onChange={(e) => setLinkedinProfile(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <Label htmlFor="resource">Learning Resource Link</Label>
            <Input
              id="resource"
              value={learningResourceLink}
              onChange={(e) => setLearningResourceLink(e.target.value)}
              placeholder="Link to the learning resource featured in your scenario"
            />
          </div>

          <div>
            <Label htmlFor="resourceType">Resource Type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="course">Online Course</SelectItem>
                <SelectItem value="worksheet">Worksheet</SelectItem>
                <SelectItem value="video">Video Tutorial</SelectItem>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="platform">Learning Platform</SelectItem>
                <SelectItem value="tool">AI Tool</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Details */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="characterName">Fictional Character Name (Optional)</Label>
            <Input
              id="characterName"
              value={fictionalCharacterName}
              onChange={(e) => setFictionalCharacterName(e.target.value)}
              placeholder="e.g., Sarah, Marketing Manager"
            />
          </div>

          <div>
            <Label htmlFor="challenge">Common Challenge Description</Label>
            <Textarea
              id="challenge"
              value={challengeDescription}
              onChange={(e) => setChallengeDescription(e.target.value)}
              placeholder="Describe a common workplace challenge that your fictional character faces. Be specific about the problem and why it's difficult to solve manually."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="solution">AI Solution Narrative</Label>
            <Textarea
              id="solution"
              value={aiSolutionNarrative}
              onChange={(e) => setAiSolutionNarrative(e.target.value)}
              placeholder="Explain how your fictional character uses AI to streamline their work or solve the challenge. Include specific tools, techniques, or approaches they use, and the positive outcomes they achieve."
              rows={6}
            />
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">💡 Scenario Writing Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Make it relatable - use common workplace situations</li>
              <li>• Be specific about the AI tools or techniques used</li>
              <li>• Show clear before/after benefits</li>
              <li>• Keep it engaging and story-like</li>
              <li>• Connect it to your learning resource</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!firstName || !lastName || !linkedinProfile || !learningResourceLink || !resourceType || !challengeDescription || !aiSolutionNarrative || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Scenario'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}