import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Edit, Play, FileText, Star, Calendar, User, Video, DollarSign, Upload, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { blink } from '@/blink/client'
import type { PodcastEpisode, ScenarioSubmission, SpotlightSubmission, CustomProductionRequest } from '../../types'

export function ReviewDashboard() {
  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>([])
  const [scenarios, setScenarios] = useState<ScenarioSubmission[]>([])
  const [spotlights, setSpotlights] = useState<SpotlightSubmission[]>([])
  const [customProductions, setCustomProductions] = useState<CustomProductionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [editNotes, setEditNotes] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const loadContent = async () => {
    try {
      const [episodesData, scenariosData, spotlightsData, customData] = await Promise.all([
        blink.db.podcastEpisodes.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.scenarioSubmissions.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.spotlightSubmissions.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.customProductionRequests.list({ orderBy: { createdAt: 'desc' } })
      ])

      setPodcastEpisodes(episodesData)
      setScenarios(scenariosData)
      setSpotlights(spotlightsData)
      setCustomProductions(customData)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const handleApprove = async (type: 'podcast' | 'scenario' | 'spotlight' | 'custom', id: string) => {
    try {
      if (type === 'podcast') {
        await blink.db.podcastEpisodes.update(id, { status: 'approved' })
        setPodcastEpisodes(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'approved' } : item
        ))
      } else if (type === 'scenario') {
        await blink.db.scenarioSubmissions.update(id, { status: 'approved' })
        setScenarios(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'approved' } : item
        ))
      } else if (type === 'spotlight') {
        await blink.db.spotlightSubmissions.update(id, { status: 'approved' })
        setSpotlights(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'approved' } : item
        ))
      } else if (type === 'custom') {
        await blink.db.customProductionRequests.update(id, { status: 'approved' })
        setCustomProductions(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'approved' } : item
        ))
      }
    } catch (error) {
      console.error('Error approving content:', error)
    }
  }

  const handleRequestEdit = async (type: 'podcast' | 'scenario' | 'spotlight' | 'custom', id: string, notes: string) => {
    try {
      if (type === 'podcast') {
        await blink.db.podcastEpisodes.update(id, { status: 'needs_editing', editNotes: notes })
        setPodcastEpisodes(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'needs_editing', editNotes: notes } : item
        ))
      } else if (type === 'scenario') {
        await blink.db.scenarioSubmissions.update(id, { status: 'needs_editing', editNotes: notes })
        setScenarios(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'needs_editing', editNotes: notes } : item
        ))
      } else if (type === 'spotlight') {
        await blink.db.spotlightSubmissions.update(id, { status: 'needs_editing', editNotes: notes })
        setSpotlights(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'needs_editing', editNotes: notes } : item
        ))
      } else if (type === 'custom') {
        await blink.db.customProductionRequests.update(id, { status: 'in_review', adminNotes: notes })
        setCustomProductions(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'in_review', adminNotes: notes } : item
        ))
      }
      setEditNotes('')
      setSelectedItem(null)
    } catch (error) {
      console.error('Error requesting edit:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'needs_editing':
      case 'needs_revision':
        return <Badge className="bg-red-100 text-red-800">Needs Editing</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'draft_ready':
        return <Badge className="bg-purple-100 text-purple-800">Draft Ready</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">Loading content...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Review Dashboard</h1>
        <p className="text-gray-600">Review and approve submitted content across all creation types</p>
      </div>

      <Tabs defaultValue="podcast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="podcast" className="flex items-center space-x-2">
            <Play className="w-4 h-4" />
            <span>Podcast ({podcastEpisodes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="scenario" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Scenarios ({scenarios.length})</span>
          </TabsTrigger>
          <TabsTrigger value="spotlight" className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Spotlights ({spotlights.length})</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Custom ({customProductions.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="podcast" className="space-y-4">
          {podcastEpisodes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No podcast episodes submitted yet.
              </CardContent>
            </Card>
          ) : (
            podcastEpisodes.map((episode) => (
              <Card key={episode.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="w-5 h-5 text-blue-600" />
                      <span>{episode.firstName} {episode.lastName}</span>
                    </CardTitle>
                    {getStatusBadge(episode.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>LinkedIn: </span>
                        <a href={episode.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Profile
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(episode.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Learning Resource:</p>
                    <a href={episode.learningResourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {episode.learningResourceLink}
                    </a>
                    <Badge variant="outline" className="ml-2 text-xs">{episode.resourceType}</Badge>
                  </div>

                  {episode.audioUrl && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recording:</p>
                      <audio controls className="w-full">
                        <source src={episode.audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {episode.photoUrl && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Photo:</p>
                      <img src={episode.photoUrl} alt="Episode photo" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}

                  {episode.editNotes && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">Edit Notes:</p>
                      <p className="text-sm text-red-700">{episode.editNotes}</p>
                    </div>
                  )}

                  {episode.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove('podcast', episode.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedItem(episode)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Request Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Edit</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Enter notes about what needs to be edited..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleRequestEdit('podcast', episode.id, editNotes)}
                                disabled={!editNotes.trim()}
                              >
                                Send Edit Request
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="scenario" className="space-y-4">
          {scenarios.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No scenarios submitted yet.
              </CardContent>
            </Card>
          ) : (
            scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>{scenario.firstName} {scenario.lastName}</span>
                    </CardTitle>
                    {getStatusBadge(scenario.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>LinkedIn: </span>
                        <a href={scenario.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Profile
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(scenario.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {scenario.fictionalCharacterName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Character:</p>
                      <p className="text-sm font-medium">{scenario.fictionalCharacterName}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Challenge:</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{scenario.challengeDescription}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">AI Solution:</p>
                    <p className="text-sm bg-blue-50 p-3 rounded-lg">{scenario.aiSolutionNarrative}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Learning Resource:</p>
                    <a href={scenario.learningResourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {scenario.learningResourceLink}
                    </a>
                    <Badge variant="outline" className="ml-2 text-xs">{scenario.resourceType}</Badge>
                  </div>

                  {scenario.editNotes && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">Edit Notes:</p>
                      <p className="text-sm text-red-700">{scenario.editNotes}</p>
                    </div>
                  )}

                  {scenario.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove('scenario', scenario.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedItem(scenario)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Request Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Edit</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Enter notes about what needs to be edited..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleRequestEdit('scenario', scenario.id, editNotes)}
                                disabled={!editNotes.trim()}
                              >
                                Send Edit Request
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="spotlight" className="space-y-4">
          {spotlights.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No spotlight submissions yet.
              </CardContent>
            </Card>
          ) : (
            spotlights.map((spotlight) => (
              <Card key={spotlight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>{spotlight.firstName} {spotlight.lastName}</span>
                    </CardTitle>
                    {getStatusBadge(spotlight.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>LinkedIn: </span>
                        <a href={spotlight.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Profile
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(spotlight.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">LinkedIn Post:</p>
                    <a href={spotlight.linkedinPostLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {spotlight.linkedinPostLink}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Distribution Consent:</p>
                    <div className="flex flex-wrap gap-2">
                      {Number(spotlight.consentWebsite) > 0 && <Badge variant="outline">Website</Badge>}
                      {Number(spotlight.consentLinkedinGroup) > 0 && <Badge variant="outline">LinkedIn Group</Badge>}
                      {Number(spotlight.consentYoutube) > 0 && <Badge variant="outline">YouTube</Badge>}
                      {Number(spotlight.consentInstagram) > 0 && <Badge variant="outline">Instagram</Badge>}
                      {Number(spotlight.consentFacebook) > 0 && <Badge variant="outline">Facebook</Badge>}
                    </div>
                  </div>

                  {spotlight.editNotes && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">Edit Notes:</p>
                      <p className="text-sm text-red-700">{spotlight.editNotes}</p>
                    </div>
                  )}

                  {spotlight.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove('spotlight', spotlight.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedItem(spotlight)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Request Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Edit</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Enter notes about what needs to be edited..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleRequestEdit('spotlight', spotlight.id, editNotes)}
                                disabled={!editNotes.trim()}
                              >
                                Send Edit Request
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {customProductions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No custom production requests yet.
              </CardContent>
            </Card>
          ) : (
            customProductions.map((production) => (
              <Card key={production.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Video className="w-5 h-5 text-purple-600" />
                      <span>{production.firstName} {production.lastName}</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      {getStatusBadge(production.status)}
                      {getPaymentStatusBadge(production.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>LinkedIn: </span>
                        {production.linkedinProfile ? (
                          <a href={production.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Profile
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(production.createdAt)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{production.budgetRange}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Video Type:</p>
                    <Badge variant="outline">{production.videoType}</Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Project Description:</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{production.projectDescription}</p>
                  </div>

                  {production.targetAudience && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Target Audience:</p>
                      <p className="text-sm">{production.targetAudience}</p>
                    </div>
                  )}

                  {production.stylePreference && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Style Preference:</p>
                      <p className="text-sm bg-blue-50 p-3 rounded-lg">{production.stylePreference}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {production.durationPreference && (
                      <div>
                        <p className="text-gray-600 mb-1">Duration:</p>
                        <p>{production.durationPreference}</p>
                      </div>
                    )}
                    {production.timelinePreference && (
                      <div>
                        <p className="text-gray-600 mb-1">Timeline:</p>
                        <p>{production.timelinePreference}</p>
                      </div>
                    )}
                  </div>

                  {production.filesUploaded && JSON.parse(production.filesUploaded).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Reference Files:</p>
                      <div className="space-y-2">
                        {JSON.parse(production.filesUploaded).map((fileUrl: string, index: number) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <Upload className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{fileUrl.split('/').pop()}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(fileUrl, '_blank')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {production.status === 'submitted' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApprove('custom', production.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Project
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedItem(production)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Request Revision
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Project Revision</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Enter notes about what needs to be revised in the project requirements..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={4}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleRequestEdit('custom', production.id, editNotes)}
                                disabled={!editNotes.trim()}
                              >
                                Send Revision Request
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}