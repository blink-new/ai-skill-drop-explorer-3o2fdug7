import { Mic, FileText, Star, Video, Eye, ChevronDown, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  activeTab: 'podcast' | 'scenario' | 'spotlight' | 'custom' | 'review'
  onTabChange: (tab: 'podcast' | 'scenario' | 'spotlight' | 'custom' | 'review') => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'podcast', label: 'Podcast Recording', icon: Mic },
    { id: 'scenario', label: 'AI Scenario Builder', icon: FileText },
    { id: 'spotlight', label: 'Content Spotlight', icon: Star },
    { id: 'custom', label: 'Custom Production', icon: Video },
    { id: 'review', label: 'Review Dashboard', icon: Eye },
  ] as const

  const activeTabData = tabs.find(tab => tab.id === activeTab)
  const ActiveIcon = activeTabData?.icon || Mic

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex items-center space-x-2 flex-shrink-0 min-w-[140px] sm:min-w-[200px]">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-600 truncate">AI Skill Drop</h1>
              <p className="text-xs text-gray-500 hidden sm:block truncate">Content Production Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0 min-w-0">
            {/* Content Type Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-1 sm:space-x-2 min-w-[120px] sm:min-w-[160px] lg:min-w-[180px] justify-between">
                  <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                    <ActiveIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate text-xs sm:text-sm lg:text-base">{activeTabData?.label}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center space-x-2 cursor-pointer ${
                        activeTab === tab.id ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />

            {/* LinkedIn Group Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://www.linkedin.com/groups/9528875/', '_blank')}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1 sm:px-2 lg:px-3 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium hidden sm:inline text-xs sm:text-sm lg:text-base">LinkedIn Group</span>
              <span className="font-medium sm:hidden text-xs">LI</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}