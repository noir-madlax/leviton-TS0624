"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Clock, User, Edit3, Plus, Trash2, Save } from "lucide-react"

interface Memory {
  id: string
  content: string
  timestamp: string
  category: string
}

interface MemoryEditorProps {
  children: React.ReactNode
  onMemoriesChange?: (memories: Memory[]) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const defaultMemories: Memory[] = [
  {
    id: "1",
    content: "I want to see market share data presented in pie chart format, showing percentage breakdown of total revenue for the past year",
    timestamp: "2025-05-15",
    category: "Visualization Preference"
  },
  {
    id: "2", 
    content: "Focus analysis on Lutron brand performance across different price segments",
    timestamp: "2025-05-10",
    category: "Brand Focus"
  },
  {
    id: "3",
    content: "Include competitive positioning analysis when showing market data",
    timestamp: "2025-05-08",
    category: "Analysis Scope"
  },
  {
    id: "4",
    content: "Prefer detailed executive summaries with strategic recommendations",
    timestamp: "2025-05-05",
    category: "Report Format"
  },
  {
    id: "5",
    content: "Show both volume and revenue metrics when analyzing market segments",
    timestamp: "2025-05-03",
    category: "Metrics Preference"
  }
]

const categories = [
  "Visualization Preference",
  "Brand Focus", 
  "Analysis Scope",
  "Report Format",
  "Metrics Preference",
  "Data Sources",
  "Other"
]

export function MemoryEditor({ children, onMemoriesChange, open: externalOpen, onOpenChange }: MemoryEditorProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [memories, setMemories] = useState<Memory[]>(defaultMemories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newMemory, setNewMemory] = useState({
    content: "",
    category: ""
  })
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = (id: string, content: string, category: string) => {
    const updatedMemories = memories.map(memory => 
      memory.id === id 
        ? { ...memory, content, category, timestamp: new Date().toISOString().split('T')[0] }
        : memory
    )
    setMemories(updatedMemories)
    setEditingId(null)
    onMemoriesChange?.(updatedMemories)
  }

  const handleDelete = (id: string) => {
    const updatedMemories = memories.filter(memory => memory.id !== id)
    setMemories(updatedMemories)
    onMemoriesChange?.(updatedMemories)
  }

  const handleAddNew = () => {
    if (newMemory.content.trim() && newMemory.category) {
      const newId = (Math.max(...memories.map(m => parseInt(m.id))) + 1).toString()
      const memory: Memory = {
        id: newId,
        content: newMemory.content.trim(),
        category: newMemory.category,
        timestamp: new Date().toISOString().split('T')[0]
      }
      const updatedMemories = [...memories, memory]
      setMemories(updatedMemories)
      setNewMemory({ content: "", category: "" })
      setIsAddingNew(false)
      onMemoriesChange?.(updatedMemories)
    }
  }

  const handleReset = () => {
    setMemories(defaultMemories)
    setEditingId(null)
    setIsAddingNew(false)
    setNewMemory({ content: "", category: "" })
    onMemoriesChange?.(defaultMemories)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] z-50">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Memory</span>
          </SheetTitle>
          <SheetDescription>
            Your preferences and requirements that I remember
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <div className="space-y-4">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                isEditing={editingId === memory.id}
                onEdit={() => handleEdit(memory.id)}
                onSave={handleSave}
                onDelete={() => handleDelete(memory.id)}
                onCancel={() => setEditingId(null)}
                categories={categories}
              />
            ))}
            
            {/* Add New Memory Card */}
            {isAddingNew ? (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="space-y-3">
                    <Select value={newMemory.category} onValueChange={(value) => setNewMemory(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Textarea
                      value={newMemory.content}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your preference or requirement..."
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setIsAddingNew(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddNew} disabled={!newMemory.content.trim() || !newMemory.category}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button 
                variant="outline" 
                className="w-full flex items-center space-x-2"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add New Memory</span>
              </Button>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex items-center space-x-2">
            <Trash2 className="w-4 h-4" />
            <span>Reset to Default</span>
          </Button>
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MemoryCardProps {
  memory: Memory
  isEditing: boolean
  onEdit: () => void
  onSave: (id: string, content: string, category: string) => void
  onDelete: () => void
  onCancel: () => void
  categories: string[]
}

function MemoryCard({ memory, isEditing, onEdit, onSave, onDelete, onCancel, categories }: MemoryCardProps) {
  const [editContent, setEditContent] = useState(memory.content)
  const [editCategory, setEditCategory] = useState(memory.category)

  const handleSave = () => {
    onSave(memory.id, editContent, editCategory)
  }

  if (isEditing) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="space-y-3">
            <Select value={editCategory} onValueChange={setEditCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs whitespace-nowrap px-2 py-1">
            {memory.category}
          </Badge>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {memory.timestamp}
            </div>
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-6 w-6 p-0">
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 leading-relaxed">
          {memory.content}
        </p>
      </CardContent>
    </Card>
  )
} 