import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Search,
  Book,
  Keyboard,
  MessageCircle,
  Video,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Zap,
  Info,
  AlertCircle,
  CheckCircle,
  Copy,
  Mail
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from './ui/modal';
import { SearchInput } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  helpful?: number;
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with GoldenGate',
    category: 'Basics',
    content: `Welcome to GoldenGate Midas Platform! This guide will help you get started.

## Key Features
- **Identify Targets**: Search and discover federal contractors
- **Portfolio Management**: Track and manage your contractor portfolios
- **Analysis Mode**: Deploy advanced analytical workflows

## Quick Start
1. Use the mode switcher at the top to navigate between features
2. Start with Identify Targets to search for contractors
3. Add contractors to your portfolio for tracking
4. Run analysis workflows for deep insights`,
    tags: ['getting-started', 'basics', 'overview'],
    helpful: 42
  },
  {
    id: '2',
    title: 'Advanced Search Techniques',
    category: 'Search',
    content: `Master the search functionality with these advanced techniques:

## Search Operators
- **Quotes**: "exact phrase" for exact matches
- **OR**: contractor OR vendor for either term
- **Wildcards**: contract* matches contractor, contracts, etc.

## Filters
- Combine multiple filters for precise results
- Use the contract value slider for budget ranges
- Filter by lifecycle stage and business momentum`,
    tags: ['search', 'filters', 'advanced'],
    helpful: 28
  },
  {
    id: '3',
    title: 'Understanding Analysis Types',
    category: 'Analysis',
    content: `Learn about the four analysis types available:

## Revenue Analytics
Analyzes financial performance and growth trends

## Forensic Due Diligence
Deep dive into compliance and risk factors

## Agency Exposure
Tracks agency relationships and concentration

## Market Perception
Analyzes market positioning and competition`,
    tags: ['analysis', 'workflows', 'reports'],
    helpful: 35
  }
];

const faqItems = [
  {
    question: 'How do I export my search results?',
    answer: 'Click the Export button in the top-right corner of search results. You can export to PDF, Excel, CSV, or JSON formats.',
    category: 'Export'
  },
  {
    question: 'What is a UEI number?',
    answer: 'UEI (Unique Entity Identifier) is a 12-character alphanumeric code that uniquely identifies entities doing business with the federal government.',
    category: 'Basics'
  },
  {
    question: 'How often is the data updated?',
    answer: 'Our data is synchronized with federal databases daily, ensuring you have access to the most current information.',
    category: 'Data'
  },
  {
    question: 'Can I share my portfolio with team members?',
    answer: 'Yes! Use the Share button in portfolio view to generate a secure link or invite team members via email.',
    category: 'Collaboration'
  },
  {
    question: 'What\'s the difference between AWD and IDV?',
    answer: 'AWD (Award) is a direct contract award, while IDV (Indefinite Delivery Vehicle) is a contracting vehicle for multiple orders over time.',
    category: 'Contracts'
  }
];

export function HelpSystem({ isOpen, onClose, currentPage = 'platform' }: HelpSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('articles');
  const { shortcuts, getShortcutString, getShortcutsByCategory } = useKeyboardShortcuts();

  const filteredArticles = helpArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFaqs = faqItems.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shortcutCategories = getShortcutsByCategory();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="xl" className="max-w-4xl max-h-[90vh]">
        <ModalHeader className="border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <ModalTitle>Help & Documentation</ModalTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Get help with {currentPage === 'platform' ? 'the platform' : currentPage}
                </p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody className="p-0">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-800">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles, FAQs, shortcuts..."
              className="w-full"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start px-4 bg-gray-900 rounded-none">
              <TabsTrigger value="articles">
                <Book className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="faq">
                <MessageCircle className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="shortcuts">
                <Keyboard className="h-4 w-4 mr-2" />
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
            </TabsList>

            {/* Articles Tab */}
            <TabsContent value="articles" className="p-4 space-y-4">
              {selectedArticle ? (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedArticle(null)}
                    className="mb-4"
                  >
                    ← Back to articles
                  </Button>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedArticle.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {selectedArticle.category}
                            </Badge>
                            {selectedArticle.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedArticle.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-gray-300">
                          {selectedArticle.content}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-800">
                        <p className="text-sm text-gray-400">Was this helpful?</p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Yes
                          </Button>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4 mr-1" />
                            No
                          </Button>
                        </div>
                        {selectedArticle.helpful && (
                          <Badge variant="outline" className="text-xs">
                            {selectedArticle.helpful} found helpful
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Card className="cursor-pointer hover:border-yellow-500 transition-colors">
                      <CardContent className="p-4 text-center">
                        <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-white">Quick Start</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-yellow-500 transition-colors">
                      <CardContent className="p-4 text-center">
                        <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-white">Search Guide</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-yellow-500 transition-colors">
                      <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-white">Reports</p>
                      </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-yellow-500 transition-colors">
                      <CardContent className="p-4 text-center">
                        <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-white">Support</p>
                      </CardContent>
                    </Card>
                  </div>

                  <h3 className="text-lg font-semibold text-white">Help Articles</h3>
                  {filteredArticles.map(article => (
                    <Card
                      key={article.id}
                      className="cursor-pointer hover:border-yellow-500 transition-colors"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-white mb-1">{article.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {article.content.split('\n')[0]}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {article.helpful} found helpful
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="p-4 space-y-3">
              {filteredFaqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedFaq(expandedFaq === faq.question ? null : faq.question)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{faq.question}</h4>
                          <Badge variant="outline" className="text-xs mt-2">
                            {faq.category}
                          </Badge>
                        </div>
                        {expandedFaq === faq.question ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {expandedFaq === faq.question && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-sm text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Shortcuts Tab */}
            <TabsContent value="shortcuts" className="p-4">
              <div className="space-y-6">
                {Object.entries(shortcutCategories).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                        >
                          <span className="text-sm text-gray-300">{shortcut.description}</span>
                          <kbd className="px-2 py-1 text-xs font-mono bg-gray-900 border border-gray-700 rounded">
                            {getShortcutString(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos" className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Platform Overview', duration: '5:32', views: '1.2k' },
                  { title: 'Advanced Search Tutorial', duration: '8:45', views: '892' },
                  { title: 'Portfolio Management', duration: '6:20', views: '756' },
                  { title: 'Running Analysis Workflows', duration: '10:15', views: '543' },
                ].map((video, index) => (
                  <Card key={index} className="cursor-pointer hover:border-yellow-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-600" />
                      </div>
                      <h4 className="font-medium text-white mb-1">{video.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{video.duration}</span>
                        <span>{video.views} views</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Version 2.0.0 • Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}