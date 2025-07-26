import { useState, useRef } from 'react'
import { Upload, X, DollarSign, Clock, Users, Video, FileText, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { blink } from '@/blink/client'
import type { CustomProduction, CustomProductionFile } from '@/types'

export function CustomProduction() {
  const [formData, setFormData] = useState({
    projectTitle: '',
    videoType: '',
    projectDescription: '',
    targetAudience: '',
    durationPreference: '',
    stylePreference: '',
    budgetRange: '',
    timelinePreference: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const videoTypes = [
    'Explainer Video',
    'Tutorial/How-to',
    'Promotional/Marketing',
    'Testimonial',
    'Product Demo',
    'Educational Content',
    'Social Media Short',
    'Webinar Highlight',
    'Case Study',
    'Other'
  ]

  const budgetRanges = [
    '$500 - $1,000',
    '$1,000 - $2,500',
    '$2,500 - $5,000',
    '$5,000 - $10,000',
    '$10,000+'
  ]

  const durationOptions = [
    '30 seconds',
    '1 minute',
    '2-3 minutes',
    '5 minutes',
    '10+ minutes',
    'Flexible'
  ]

  const timelineOptions = [
    '1 week',
    '2 weeks',
    '1 month',
    '2 months',
    'Flexible'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.projectTitle || !formData.videoType || !formData.projectDescription || !formData.budgetRange) {
      return
    }

    setIsSubmitting(true)
    try {
      const user = await blink.auth.me()
      
      // Create the custom production record
      const productionId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const production: Omit<CustomProduction, 'createdAt' | 'updatedAt'> = {
        id: productionId,
        userId: user.id,
        projectTitle: formData.projectTitle,
        videoType: formData.videoType,
        projectDescription: formData.projectDescription,
        targetAudience: formData.targetAudience || undefined,
        durationPreference: formData.durationPreference || undefined,
        stylePreference: formData.stylePreference || undefined,
        budgetRange: formData.budgetRange,
        timelinePreference: formData.timelinePreference || undefined,
        status: 'pending',
        paymentStatus: 'unpaid'
      }

      await blink.db.customProductions.create({
        ...production,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Upload files if any
      for (const file of uploadedFiles) {
        const { publicUrl } = await blink.storage.upload(
          file,
          `custom-productions/${productionId}/${file.name}`,
          { upsert: true }
        )

        const fileRecord: Omit<CustomProductionFile, 'uploadedAt'> = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productionId,
          fileName: file.name,
          fileUrl: publicUrl,
          fileType: file.type,
          fileSize: file.size
        }

        await blink.db.customProductionFiles.create({
          ...fileRecord,
          uploadedAt: new Date().toISOString()
        })
      }

      setSubmitSuccess(true)
      // Reset form
      setFormData({
        projectTitle: '',
        videoType: '',
        projectDescription: '',
        targetAudience: '',
        durationPreference: '',
        stylePreference: '',
        budgetRange: '',
        timelinePreference: ''
      })
      setUploadedFiles([])
    } catch (error) {
      console.error('Error submitting custom production:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Request Submitted Successfully!</CardTitle>
            <CardDescription className="text-green-600">
              Your custom video production request has been received. Our team will review your requirements and contact you within 24 hours with a detailed proposal and timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => setSubmitSuccess(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Custom Video Production</h2>
        <p className="text-gray-600">
          Request custom social media video content tailored to your specific needs. Our team will work with you to create professional videos that showcase your expertise and engage your audience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Overview
            </CardTitle>
            <CardDescription>
              Tell us about your video project and what you want to achieve.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                value={formData.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                placeholder="e.g., AI-Powered Marketing Strategy Explainer"
                required
              />
            </div>

            <div>
              <Label htmlFor="videoType">Video Type *</Label>
              <Select value={formData.videoType} onValueChange={(value) => handleInputChange('videoType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  {videoTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectDescription">Project Description *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                placeholder="Describe your video project in detail. What message do you want to convey? What should viewers learn or do after watching?"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Audience & Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Audience & Style
            </CardTitle>
            <CardDescription>
              Help us understand your audience and preferred style.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="e.g., Marketing professionals, Small business owners, Tech enthusiasts"
              />
            </div>

            <div>
              <Label htmlFor="stylePreference">Style Preference</Label>
              <Textarea
                id="stylePreference"
                value={formData.stylePreference}
                onChange={(e) => handleInputChange('stylePreference', e.target.value)}
                placeholder="Describe your preferred style (e.g., professional and clean, fun and energetic, minimalist, animated, live-action, etc.)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Timeline & Budget
            </CardTitle>
            <CardDescription>
              Let us know your timeline and budget requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationPreference">Preferred Duration</Label>
                <Select value={formData.durationPreference} onValueChange={(value) => handleInputChange('durationPreference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((duration) => (
                      <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timelinePreference">Timeline</Label>
                <Select value={formData.timelinePreference} onValueChange={(value) => handleInputChange('timelinePreference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((timeline) => (
                      <SelectItem key={timeline} value={timeline}>{timeline}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="budgetRange">Budget Range *</Label>
              <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Reference Materials
            </CardTitle>
            <CardDescription>
              Upload any reference materials, brand assets, scripts, or inspiration files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload files or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">
                  Images, videos, documents, brand assets, etc.
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.projectTitle || !formData.videoType || !formData.projectDescription || !formData.budgetRange}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}