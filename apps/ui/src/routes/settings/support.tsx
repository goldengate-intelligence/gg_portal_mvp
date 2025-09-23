import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/protected-route';
import { SettingsLayout } from '../../components/settings/settings-layout';
import { FormSection, FormField, FormSelect, FormTextarea, FormActions, SaveButton } from '../../components/settings/form-components';
import { HelpCircle, Book, ExternalLink, Search, FileText, Video, Download, Users } from 'lucide-react';

function HelpSupportComponent() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: '',
  });

  const categoryOptions = [
    { value: 'general', label: 'General Question' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Subscription' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'security', label: 'Security Concern' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low - General inquiry' },
    { value: 'medium', label: 'Medium - Standard issue' },
    { value: 'high', label: 'High - Business impact' },
    { value: 'urgent', label: 'Urgent - Critical issue' },
  ];

  const documentationSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using the platform',
      icon: Book,
      articles: [
        'Platform Overview and Introduction',
        'Setting Up Your Account',
        'Navigating the Dashboard',
        'Understanding Your Portfolio',
      ]
    },
    {
      title: 'Portfolio Management',
      description: 'Managing and analyzing your portfolio',
      icon: FileText,
      articles: [
        'Adding Assets to Your Portfolio',
        'Portfolio Analysis Tools',
        'Risk Assessment Features',
        'Performance Tracking',
      ]
    },
    {
      title: 'Automation & Agents',
      description: 'Setting up and managing automated workflows',
      icon: Users,
      articles: [
        'Creating Your First Agent',
        'Automation Best Practices',
        'Troubleshooting Agent Issues',
        'Advanced Configuration Options',
      ]
    },
    {
      title: 'Data & Analytics',
      description: 'Understanding data sources and analytics',
      icon: Download,
      articles: [
        'Data Sources and Updates',
        'Interpreting Analytics Reports',
        'Exporting and Sharing Data',
        'Custom Report Building',
      ]
    },
  ];

  const faqItems = [
    {
      question: 'How often is portfolio data updated?',
      answer: 'Portfolio data is updated in real-time during market hours, with overnight processing for comprehensive analysis. Historical data is refreshed daily.'
    },
    {
      question: 'Can I export my portfolio data?',
      answer: 'Yes, you can export your portfolio data in multiple formats including CSV, Excel, and PDF. Visit the Analytics section to access export options.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". You can also change your password in Account Security settings if you\'re already logged in.'
    },
    {
      question: 'What browsers are supported?',
      answer: 'We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can submit a support ticket through this page, email us at support@goldengateintelligence.com, or call us during business hours.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use enterprise-grade security including encryption, secure data centers, and regular security audits. Your data is never shared with third parties.'
    },
  ];


  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setSupportTicket(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Support ticket submitted:', supportTicket);

      // Reset form
      setSupportTicket({
        subject: '',
        category: 'general',
        priority: 'medium',
        description: '',
      });

      alert('Support ticket submitted successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Failed to submit support ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQ = faqItems.filter(item =>
    searchQuery === '' ||
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Help & Support"
        description="Access documentation and support resources"
      >
        <div className="p-6 space-y-8">
          {/* Quick Actions */}
          <FormSection
            title="Quick Actions"
            description="Common support tasks and resources."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-600/30 hover:border-[#D2AC38]/50 transition-all group">
                <Video className="w-6 h-6 text-[#D2AC38] group-hover:text-[#D2AC38]/80" />
                <div className="text-left">
                  <div className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Video Tutorials
                  </div>
                  <div className="text-gray-400 text-sm">
                    Watch guided walkthroughs
                  </div>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-600/30 hover:border-[#D2AC38]/50 transition-all group">
                <MessageCircle className="w-6 h-6 text-[#D2AC38] group-hover:text-[#D2AC38]/80" />
                <div className="text-left">
                  <div className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Live Chat
                  </div>
                  <div className="text-gray-400 text-sm">
                    Get immediate help
                  </div>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-600/30 hover:border-[#D2AC38]/50 transition-all group">
                <Download className="w-6 h-6 text-[#D2AC38] group-hover:text-[#D2AC38]/80" />
                <div className="text-left">
                  <div className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    User Guide
                  </div>
                  <div className="text-gray-400 text-sm">
                    Download complete guide
                  </div>
                </div>
              </button>
            </div>
          </FormSection>

          {/* Documentation */}
          <FormSection
            title="Documentation"
            description="Browse our comprehensive documentation and guides."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentationSections.map((section) => (
                <div key={section.title} className="p-4 rounded-lg bg-gray-800/30 border border-gray-600/20">
                  <div className="flex items-center gap-3 mb-3">
                    <section.icon className="w-6 h-6 text-[#D2AC38]" />
                    <div>
                      <h3 className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {section.title}
                      </h3>
                      <p className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {section.articles.map((article) => (
                      <li key={article}>
                        <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#D2AC38] transition-colors group text-left w-full">
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          <span className="flex-1">{article}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </FormSection>

          {/* FAQ */}
          <FormSection
            title="Frequently Asked Questions"
            description="Find answers to common questions."
          >
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600/20 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <details key={index} className="group rounded-lg bg-gray-800/30 border border-gray-600/20">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/30 transition-colors">
                    <span className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {item.question}
                    </span>
                    <HelpCircle className="w-5 h-5 text-gray-400 group-open:text-[#D2AC38] transition-colors" />
                  </summary>
                  <div className="px-4 pb-4 text-gray-300 text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </FormSection>


          {/* Submit Support Ticket */}
          <form onSubmit={handleSubmitTicket}>
            <FormSection
              title="Submit Support Ticket"
              description="Create a support ticket for personalized assistance."
            >
              <div className="space-y-4">
                <FormField
                  label="Subject"
                  id="subject"
                  value={supportTicket.subject}
                  onChange={handleTicketChange}
                  placeholder="Brief description of your issue"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Category"
                    id="category"
                    value={supportTicket.category}
                    onChange={handleTicketChange}
                    options={categoryOptions}
                    required
                  />
                  <FormSelect
                    label="Priority"
                    id="priority"
                    value={supportTicket.priority}
                    onChange={handleTicketChange}
                    options={priorityOptions}
                    required
                  />
                </div>

                <FormTextarea
                  label="Description"
                  id="description"
                  value={supportTicket.description}
                  onChange={handleTicketChange}
                  placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce the problem, and what you were trying to accomplish..."
                  rows={6}
                  required
                  helpText="Include as much detail as possible to help us resolve your issue quickly"
                />
              </div>

              <FormActions>
                <SaveButton loading={loading}>
                  {loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </SaveButton>
              </FormActions>
            </FormSection>
          </form>

          {/* System Status */}
          <FormSection
            title="System Status"
            description="Current status of platform services and recent updates."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div>
                    <span className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      All Systems Operational
                    </span>
                    <p className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      All platform services are running normally
                    </p>
                  </div>
                </div>
                <button className="text-[#D2AC38] hover:text-[#D2AC38]/80 text-sm font-medium">
                  View Status Page
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-600/20">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm font-medium">Data Processing</span>
                  </div>
                  <span className="text-gray-400 text-xs">Operational</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-600/20">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm font-medium">API Services</span>
                  </div>
                  <span className="text-gray-400 text-xs">Operational</span>
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </SettingsLayout>
    </ProtectedRoute>
  );
}

export const helpSupportRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/support',
  component: HelpSupportComponent,
});

export default helpSupportRoute;