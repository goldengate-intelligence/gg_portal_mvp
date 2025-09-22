import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Linkedin, Briefcase, Building, ChevronDown, Search, RefreshCw, CreditCard, Filter } from 'lucide-react';
import { HudCard } from './ui/hud-card';
import { Button } from './ui/button';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../logic/utils';

interface Person {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  seniority?: string;
  department?: string;
  email?: string;
  emailRevealed?: boolean;
  phone?: string;
  phoneRevealed?: boolean;
  linkedin?: string;
  company?: string;
  location?: string;
  updateDate?: string;
}

interface PeopleSectionProps {
  companyName: string;
  companyDomain?: string;
}

export const PeopleSection: React.FC<PeopleSectionProps> = ({ companyName, companyDomain }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockPeople: Person[] = [
          {
            id: '1',
            fullName: 'Michael Thompson',
            firstName: 'Michael',
            lastName: 'Thompson',
            jobTitle: 'Chief Executive Officer',
            seniority: 'C-Level',
            department: 'Executive',
            email: 'm***@triofab.com',
            emailRevealed: false,
            phone: '(512) ***-****',
            phoneRevealed: false,
            linkedin: 'https://linkedin.com/in/michael-thompson',
            company: companyName,
            location: 'Austin, TX',
            updateDate: '2024-01-15'
          },
          {
            id: '2',
            fullName: 'Sarah Martinez',
            firstName: 'Sarah',
            lastName: 'Martinez',
            jobTitle: 'VP of Operations',
            seniority: 'VP',
            department: 'Operations',
            email: 's***@triofab.com',
            emailRevealed: false,
            phone: '(512) ***-****',
            phoneRevealed: false,
            linkedin: 'https://linkedin.com/in/sarah-martinez',
            company: companyName,
            location: 'Austin, TX',
            updateDate: '2024-01-14'
          },
          {
            id: '3',
            fullName: 'James Wilson',
            firstName: 'James',
            lastName: 'Wilson',
            jobTitle: 'Director of Engineering',
            seniority: 'Director',
            department: 'Engineering',
            email: 'j***@triofab.com',
            emailRevealed: false,
            phone: '(512) ***-****',
            phoneRevealed: false,
            linkedin: 'https://linkedin.com/in/james-wilson',
            company: companyName,
            location: 'Austin, TX',
            updateDate: '2024-01-13'
          },
          {
            id: '4',
            fullName: 'Robert Chen',
            firstName: 'Robert',
            lastName: 'Chen',
            jobTitle: 'Chief Financial Officer',
            seniority: 'C-Level',
            department: 'Finance',
            email: 'r***@triofab.com',
            emailRevealed: false,
            phone: '(512) ***-****',
            phoneRevealed: false,
            linkedin: 'https://linkedin.com/in/robert-chen',
            company: companyName,
            location: 'Austin, TX',
            updateDate: '2024-01-12'
          },
          {
            id: '5',
            fullName: 'Jennifer Davis',
            firstName: 'Jennifer',
            lastName: 'Davis',
            jobTitle: 'VP of Sales',
            seniority: 'VP',
            department: 'Sales',
            email: 'j***@triofab.com',
            emailRevealed: false,
            phone: '(512) ***-****',
            phoneRevealed: false,
            linkedin: 'https://linkedin.com/in/jennifer-davis',
            company: companyName,
            location: 'Austin, TX',
            updateDate: '2024-01-11'
          },
          {
            id: '6',
            fullName: 'David Kim',
            firstName: 'David',
            lastName: 'Kim',
            jobTitle: 'Director of Quality Assurance',
            seniority: 'Director',
            department: 'Operations',
            email: 'd***@triofab.com',
            emailRevealed: false,
            phone: '(512) ***-****',
            phoneRevealed: false,
            linkedin: 'https://linkedin.com/in/david-kim',
            company: companyName,
            location: 'Austin, TX',
            updateDate: '2024-01-10'
          }
        ];
        setPeople(mockPeople);
        setLoading(false);
      }, 1000);
    };

    fetchPeople();
  }, [companyName]);

  const handleRevealEmail = async (personId: string) => {
    // Mock API call to reveal email
    setPeople(prev => prev.map(p =>
      p.id === personId
        ? { ...p, email: 'revealed@triofab.com', emailRevealed: true }
        : p
    ));
  };

  const handleRevealPhone = async (personId: string) => {
    // Mock API call to reveal phone
    setPeople(prev => prev.map(p =>
      p.id === personId
        ? { ...p, phone: '(512) 555-0123', phoneRevealed: true }
        : p
    ));
  };

  const filteredPeople = people.filter(person => {
    const matchesSeniority = selectedSeniority.length === 0 || selectedSeniority.includes(person.seniority || '');
    const matchesDepartment = selectedDepartment.length === 0 || selectedDepartment.includes(person.department || '');
    const matchesSearch = searchQuery === '' ||
      person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeniority && matchesDepartment && matchesSearch;
  });

  const seniorityLevels = ['C-Level', 'VP', 'Director', 'Manager', 'Individual Contributor'];
  const departments = ['Executive', 'Sales', 'Engineering', 'Operations', 'Finance', 'Marketing', 'HR'];

  // Check which seniority levels are present in filtered results
  const presentSeniorities = new Set(filteredPeople.map(p => p.seniority));

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className={`border border-gray-700/30 rounded-xl p-4 ${CONTRACTOR_DETAIL_COLORS.panelColor}`}>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-all"
              style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
            />
          </div>

          <select
            className="px-4 py-2.5 border border-gray-800 rounded-lg text-gray-400 hover:border-gray-700 focus:outline-none focus:border-gray-700 transition-all cursor-pointer"
            style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
            onChange={(e) => setSelectedSeniority(e.target.value ? [e.target.value] : [])}
          >
            <option value="">All Seniority</option>
            <option value="C-Level">C-Level</option>
            <option value="VP">VP</option>
            <option value="Director">Director</option>
            <option value="Manager">Manager</option>
          </select>

          <select
            className="px-4 py-2.5 border border-gray-800 rounded-lg text-gray-400 hover:border-gray-700 focus:outline-none focus:border-gray-700 transition-all cursor-pointer"
            style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
            onChange={(e) => setSelectedDepartment(e.target.value ? [e.target.value] : [])}
          >
            <option value="">All Departments</option>
            <option value="Executive">Executive</option>
            <option value="Sales">Sales</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
          </select>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#38E54D] rounded-full animate-pulse" />
              <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>{filteredPeople.length} CONTACTS</span>
            </div>
            <div className="flex items-center gap-1.5">
              {presentSeniorities.has('C-Level') && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C]" />
                  <span className="text-[10px] text-[#FF4C4C]">C-LEVEL</span>
                </>
              )}
              {presentSeniorities.has('VP') && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFD166] ml-2" />
                  <span className="text-[10px] text-[#FFD166]">VP</span>
                </>
              )}
              {presentSeniorities.has('Director') && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] ml-2" />
                  <span className="text-[10px] text-[#06D6A0]">DIRECTOR</span>
                </>
              )}
              {presentSeniorities.has('Manager') && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#118AB2] ml-2" />
                  <span className="text-[10px] text-[#118AB2]">MANAGER</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* People Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading contact information...</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <div
              key={person.id}
              className="border border-gray-700 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600 transition-all duration-500 group h-full bg-gray-900/40"
            >
              <div className="p-4 flex flex-col h-full">
                {/* Header with subtle accent */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-[#D2AC38] font-normal tracking-wide mb-1" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                      {person.fullName.toUpperCase()}
                    </h3>
                    <p className="text-sm text-white font-light mb-2">{person.jobTitle}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        backgroundColor: person.seniority === 'C-Level' ? 'rgba(255, 76, 76, 0.15)' :
                                       person.seniority === 'VP' ? 'rgba(255, 209, 102, 0.15)' :
                                       person.seniority === 'Director' ? 'rgba(6, 214, 160, 0.15)' :
                                       'rgba(17, 138, 178, 0.15)',
                        color: person.seniority === 'C-Level' ? '#FF4C4C' :
                               person.seniority === 'VP' ? '#FFD166' :
                               person.seniority === 'Director' ? '#06D6A0' :
                               '#118AB2'
                      }}>
                        {person.seniority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        backgroundColor: person.department === 'Executive' ? 'rgba(210, 172, 56, 0.15)' :
                                       person.department === 'Sales' ? 'rgba(91, 192, 235, 0.15)' :
                                       person.department === 'Engineering' ? 'rgba(162, 89, 255, 0.15)' :
                                       person.department === 'Finance' ? 'rgba(56, 229, 77, 0.15)' :
                                       'rgba(255, 107, 53, 0.15)',
                        color: person.department === 'Executive' ? '#D2AC38' :
                               person.department === 'Sales' ? '#5BC0EB' :
                               person.department === 'Engineering' ? '#A259FF' :
                               person.department === 'Finance' ? '#38E54D' :
                               '#FF6B35'
                      }}>
                        {person.department}
                      </span>
                    </div>
                  </div>
                  {/* Visual element - seniority indicator */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                      background: person.seniority === 'C-Level' ? 'linear-gradient(135deg, rgba(255, 76, 76, 0.2), rgba(255, 76, 76, 0.05))' :
                                 person.seniority === 'VP' ? 'linear-gradient(135deg, rgba(255, 209, 102, 0.2), rgba(255, 209, 102, 0.05))' :
                                 person.seniority === 'Director' ? 'linear-gradient(135deg, rgba(6, 214, 160, 0.2), rgba(6, 214, 160, 0.05))' :
                                 'linear-gradient(135deg, rgba(17, 138, 178, 0.2), rgba(17, 138, 178, 0.05))',
                      border: `1px solid ${person.seniority === 'C-Level' ? 'rgba(255, 76, 76, 0.3)' :
                                           person.seniority === 'VP' ? 'rgba(255, 209, 102, 0.3)' :
                                           person.seniority === 'Director' ? 'rgba(6, 214, 160, 0.3)' :
                                           'rgba(17, 138, 178, 0.3)'}`
                    }}>
                      <span className="text-lg font-bold" style={{
                        color: person.seniority === 'C-Level' ? '#FF4C4C' :
                               person.seniority === 'VP' ? '#FFD166' :
                               person.seniority === 'Director' ? '#06D6A0' :
                               '#118AB2'
                      }}>
                        {person.seniority === 'C-Level' ? 'C' :
                         person.seniority === 'VP' ? 'V' :
                         person.seniority === 'Director' ? 'D' : 'M'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info with container */}
                <div className="border border-gray-800 rounded-lg p-3 space-y-2.5" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                  {/* Email */}
                  <div className="flex items-center justify-between group/email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-[#FFD166]/60" />
                      <span className="text-xs text-white">
                        {person.emailRevealed ? person.email : person.email}
                      </span>
                    </div>
                    {!person.emailRevealed && (
                      <button
                        onClick={() => handleRevealEmail(person.id)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 hover:bg-[#D2AC38]/20 hover:text-[#D2AC38] transition-all opacity-0 group-hover/email:opacity-100"
                      >
                        REVEAL
                      </button>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between group/phone">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#FFD166]/60" />
                      <span className="text-xs text-white">
                        {person.phoneRevealed ? person.phone : person.phone}
                      </span>
                    </div>
                    {!person.phoneRevealed && (
                      <button
                        onClick={() => handleRevealPhone(person.id)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 hover:bg-[#D2AC38]/20 hover:text-[#D2AC38] transition-all opacity-0 group-hover/phone:opacity-100"
                      >
                        REVEAL
                      </button>
                    )}
                  </div>

                  {/* LinkedIn */}
                  {person.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-3 h-3 text-[#D2AC38]/60" />
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#D2AC38]/80 hover:text-[#D2AC38] transition-colors"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer with location - pushed to bottom */}
                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{person.location}</span>
                    <span className="text-[10px] text-gray-600">{person.updateDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredPeople.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <Users className="w-12 h-12 mb-4 text-gray-600" />
          <p className="text-gray-500">No contacts found matching your criteria</p>
        </div>
      )}
    </div>
  );
};