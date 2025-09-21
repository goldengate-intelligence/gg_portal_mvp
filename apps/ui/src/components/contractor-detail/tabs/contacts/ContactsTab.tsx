import React, { useState, useEffect } from 'react';
import { ContactFilterPanel } from './ContactFilterPanel';
import { ContactGridPanel } from './ContactGridPanel';

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

interface ContactsTabProps {
  companyName: string;
  companyDomain?: string;
}

export function ContactsTab({ companyName, companyDomain }: ContactsTabProps) {
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

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <ContactFilterPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSeniority={selectedSeniority}
        setSelectedSeniority={setSelectedSeniority}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        filteredPeople={filteredPeople}
      />

      {/* People Grid */}
      <ContactGridPanel
        people={filteredPeople}
        loading={loading}
        onRevealEmail={handleRevealEmail}
        onRevealPhone={handleRevealPhone}
      />
    </div>
  );
}