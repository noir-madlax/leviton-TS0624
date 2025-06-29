"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, CreditCard, Brain } from "lucide-react"
import { useChartPin } from "@/lib/chart-pin-context"
import { MemoryEditor } from "@/components/ui/memory-editor"

export function UserMenu() {
  const { resetPins } = useChartPin()
  const [showMemoryEditor, setShowMemoryEditor] = useState(false)

  const handleLogout = () => {
    // Reset all application state to defaults
    resetPins()
    localStorage.removeItem('project2-created')
    localStorage.removeItem('project2-in-progress')
    
    // Reload the page to reset all state
    window.location.reload()
  }

  const handleMemoryClick = () => {
    setShowMemoryEditor(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-blue-600 text-white">JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">John Doe</p>
              <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMemoryClick}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Memories</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <MemoryEditor open={showMemoryEditor} onOpenChange={setShowMemoryEditor}>
        <div />
      </MemoryEditor>
    </>
  )
}
