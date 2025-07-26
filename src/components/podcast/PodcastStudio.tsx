import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Square, Mic, Upload, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { blink } from '@/blink/client'

export function PodcastStudio() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [maxTime, setMaxTime] = useState(180) // 3 minutes default
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [learningResourceLink, setLearningResourceLink] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxTime) {
            if (mediaRecorderRef.current && isRecording) {
              mediaRecorderRef.current.stop()
              setIsRecording(false)
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
              }
            }
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob || !firstName || !lastName || !linkedinProfile || !learningResourceLink || !resourceType) {
      return
    }

    setIsSubmitting(true)
    try {
      // Upload audio
      const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' })
      const { publicUrl: audioPublicUrl } = await blink.storage.upload(audioFile, `podcast-audio/${Date.now()}.wav`)
      
      // Upload photo if provided
      let photoPublicUrl = null
      if (photo) {
        const { publicUrl } = await blink.storage.upload(photo, `podcast-photos/${Date.now()}.${photo.name.split('.').pop()}`)
        photoPublicUrl = publicUrl
      }

      // Save to database
      await blink.db.podcastEpisodes.create({
        id: `episode_${Date.now()}`,
        userId: (await blink.auth.me()).id,
        firstName,
        lastName,
        linkedinProfile,
        learningResourceLink,
        resourceType,
        audioUrl: audioPublicUrl,
        photoUrl: photoPublicUrl,
        status: 'pending'
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting episode:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Episode Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your podcast episode has been submitted for review. You'll be notified once it's approved.
            </p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Create Another Episode
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Question Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-blue-600" />
            <span>Today's Question</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-900 font-medium">
              "What's one AI tool or technique you've recently learned that has significantly improved your workflow, and how would you recommend others get started with it?"
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Listen to Question
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Max recording time: {formatTime(maxTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recording Studio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-blue-600'}`} />
              </div>
              <div className="text-2xl font-mono font-bold text-gray-900 mb-2">
                {formatTime(recordingTime)}
              </div>
              <Progress value={(recordingTime / maxTime) * 100} className="w-64 mx-auto mb-4" />
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="outline">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>

          {audioUrl && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Recording Complete</span>
                <div className="flex space-x-2">
                  {!isPlaying ? (
                    <Button onClick={playRecording} size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  ) : (
                    <Button onClick={pauseRecording} size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={() => {
                    setAudioBlob(null)
                    setAudioUrl(null)
                    setRecordingTime(0)
                  }} size="sm" variant="outline">
                    Re-record
                  </Button>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Response Structure Guide</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>1. Greeting:</strong> "Hi, I'm [Your Name]..."</p>
              <p><strong>2. Answer:</strong> Share your insights about the AI tool/technique</p>
              <p><strong>3. Thank You:</strong> "Thanks for listening, and happy learning!"</p>
            </div>
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
              placeholder="Link to the learning resource you're discussing"
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
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="photo">Photo (Optional)</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              {photoPreview && (
                <div className="mt-4">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!audioBlob || !firstName || !lastName || !linkedinProfile || !learningResourceLink || !resourceType || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Episode'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}