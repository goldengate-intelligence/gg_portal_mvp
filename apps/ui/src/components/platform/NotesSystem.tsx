import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { HudCard } from '../ui/hud-card';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { SearchInput, Textarea } from '../ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { CONTRACTOR_DETAIL_COLORS, cn } from '../../lib/utils';

interface Note {
  id: string;
  entityId: string;
  entityType: 'contractor' | 'opportunity' | 'portfolio';
  title: string;
  content: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isStarred: boolean;
}

interface NotesSystemProps {
  entityId: string;
  entityType: 'contractor' | 'opportunity' | 'portfolio';
  currentUserId: string;
}

export function NotesSystem({ entityId, entityType, currentUserId }: NotesSystemProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      entityId,
      entityType,
      title: 'Initial Assessment',
      content: 'Strong contractor with proven track record in defense contracts. Consider for upcoming RFP.',
      tags: ['assessment', 'defense', 'priority'],
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      createdBy: currentUserId,
      isStarred: true,
    },
    {
      id: '2',
      entityId,
      entityType,
      title: 'Meeting Notes',
      content: 'Discussed partnership opportunities. CEO expressed interest in subcontracting arrangements.',
      tags: ['meeting', 'partnership'],
      priority: 'medium',
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      createdBy: currentUserId,
      isStarred: false,
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    tags: [],
    priority: 'medium',
  });

  const [tagInput, setTagInput] = useState('');

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = filterTag === 'all' || note.tags.includes(filterTag);
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
    
    return matchesSearch && matchesTag && matchesPriority;
  });

  const handleCreateNote = () => {
    if (newNote.title && newNote.content) {
      const note: Note = {
        id: Date.now().toString(),
        entityId,
        entityType,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags || [],
        priority: newNote.priority || 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUserId,
        isStarred: false,
      };
      setNotes(prev => [note, ...prev]);
      setNewNote({ title: '', content: '', tags: [], priority: 'medium' });
      setIsCreating(false);
      setTagInput('');
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
    setEditingId(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleToggleStar = (id: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, isStarred: !note.isStarred } : note
    ));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && newNote.tags && !newNote.tags.includes(tagInput.trim())) {
      setNewNote(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/50';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/50';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/50';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <HudCard variant="default" priority="high" className="border-gray-700/30">
        <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-yellow-500" />
              <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '16px' }}>
                Notes & Observations
              </h3>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </HudCard>

      {/* Filters */}
      <HudCard variant="default" priority="medium" className="border-gray-700/30">
        <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 bg-black/20 border-gray-700/50"
            />
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-40 bg-black/20 border-gray-700/50">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32 bg-black/20 border-gray-700/50">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </HudCard>

      {/* Create New Note */}
      {isCreating && (
        <HudCard variant="default" priority="high" className="border-yellow-500/50">
          <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                New Note
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: [], priority: 'medium' });
                  setTagInput('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
            <input
              type="text"
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Note title..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <Textarea
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Select 
                value={newNote.priority} 
                onValueChange={(value) => 
                  setNewNote(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <Button onClick={handleAddTag} size="sm" variant="outline">
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {newNote.tags && newNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newNote.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                    <button
                      onClick={() => setNewNote(prev => ({
                        ...prev,
                        tags: prev.tags?.filter((_, i) => i !== index)
                      }))}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewNote({ title: '', content: '', tags: [], priority: 'medium' });
                  setTagInput('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNote}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={!newNote.title || !newNote.content}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </div>
            </div>
          </div>
        </HudCard>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <HudCard variant="default" priority="low" className="border-gray-700/30">
            <div className="py-8 text-center" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
              <StickyNote className="h-8 w-8 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No notes found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery || filterTag !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first note to get started'}
              </p>
            </div>
          </HudCard>
        ) : (
          filteredNotes.map(note => (
            <HudCard key={note.id} variant="default" priority="medium" className="group border-gray-700/30">
              <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                {editingId === note.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => handleUpdateNote(note.id, { title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    />
                    <Textarea
                      value={note.content}
                      onChange={(e) => handleUpdateNote(note.id, { content: e.target.value })}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        onClick={() => setEditingId(null)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{note.title}</h3>
                          <button
                            onClick={() => handleToggleStar(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                note.isStarred
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-500 hover:text-yellow-500'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{note.content}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(note.priority)}`}>
                            {note.priority.toUpperCase()}
                          </div>
                          {note.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(note.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>You</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatDate(note.createdAt)}</span>
                      </div>
                      {note.updatedAt > note.createdAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Updated {formatDate(note.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </HudCard>
          ))
        )}
      </div>
    </div>
  );
}