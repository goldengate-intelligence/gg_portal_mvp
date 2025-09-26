/**
 * Mock Contact Provider
 *
 * Provides realistic mock contact data for development and fallback scenarios.
 * This module is completely isolated and can be safely extracted.
 */

export interface MockContactData {
  success: boolean;
  contacts: Array<{
    data: {
      personId: number;
      firstName: string;
      lastName: string;
      fullName: string;
      jobTitle: {
        title: string;
        seniority: string;
        departments: string[];
      };
      emailAddresses: Array<{ address: string }>;
      phoneNumbers: Array<{ number: string }>;
      socialLinks: { linkedin: string };
      location: { city: string; state: string; country: string };
      updateDate: string;
    };
  }>;
  companyName: string;
  metadata: {
    source: string;
    uei: string;
    generated_at: string;
  };
}

export class MockContactProvider {
  /**
   * Generate mock contacts for development/fallback scenarios
   */
  static generateMockContacts(uei: string, companyName: string): MockContactData {
    const mockContacts = [
      {
        data: {
          personId: 1001,
          firstName: "Michael",
          lastName: "Thompson",
          fullName: "Michael Thompson",
          jobTitle: {
            title: "Chief Executive Officer",
            seniority: "Executive",
            departments: ["Executive"],
          },
          emailAddresses: [
            {
              address: `m.thompson@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4567" }],
          socialLinks: { linkedin: "https://linkedin.com/in/michael-thompson" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1002,
          firstName: "Sarah",
          lastName: "Martinez",
          fullName: "Sarah Martinez",
          jobTitle: {
            title: "VP of Operations",
            seniority: "Senior",
            departments: ["Operations"],
          },
          emailAddresses: [
            {
              address: `s.martinez@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4568" }],
          socialLinks: { linkedin: "https://linkedin.com/in/sarah-martinez" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1003,
          firstName: "James",
          lastName: "Wilson",
          fullName: "James Wilson",
          jobTitle: {
            title: "Director of Engineering",
            seniority: "Senior",
            departments: ["Engineering & Technical"],
          },
          emailAddresses: [
            {
              address: `j.wilson@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4569" }],
          socialLinks: { linkedin: "https://linkedin.com/in/james-wilson" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1004,
          firstName: "Robert",
          lastName: "Chen",
          fullName: "Robert Chen",
          jobTitle: {
            title: "Chief Financial Officer",
            seniority: "Executive",
            departments: ["Finance"],
          },
          emailAddresses: [
            {
              address: `r.chen@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4570" }],
          socialLinks: { linkedin: "https://linkedin.com/in/robert-chen" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1005,
          firstName: "Jennifer",
          lastName: "Davis",
          fullName: "Jennifer Davis",
          jobTitle: {
            title: "VP of Sales",
            seniority: "Senior",
            departments: ["Sales"],
          },
          emailAddresses: [
            {
              address: `j.davis@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4571" }],
          socialLinks: { linkedin: "https://linkedin.com/in/jennifer-davis" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1006,
          firstName: "David",
          lastName: "Kim",
          fullName: "David Kim",
          jobTitle: {
            title: "Director of Quality Assurance",
            seniority: "Senior",
            departments: ["Operations"],
          },
          emailAddresses: [
            {
              address: `d.kim@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4572" }],
          socialLinks: { linkedin: "https://linkedin.com/in/david-kim" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1007,
          firstName: "Lisa",
          lastName: "Rodriguez",
          fullName: "Lisa Rodriguez",
          jobTitle: {
            title: "Program Manager",
            seniority: "Mid-Level",
            departments: ["Program Management"],
          },
          emailAddresses: [
            {
              address: `l.rodriguez@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4573" }],
          socialLinks: { linkedin: "https://linkedin.com/in/lisa-rodriguez" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
      {
        data: {
          personId: 1008,
          firstName: "Brian",
          lastName: "Johnson",
          fullName: "Brian Johnson",
          jobTitle: {
            title: "Senior Contract Specialist",
            seniority: "Senior",
            departments: ["Procurement"],
          },
          emailAddresses: [
            {
              address: `b.johnson@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            },
          ],
          phoneNumbers: [{ number: "(555) 123-4574" }],
          socialLinks: { linkedin: "https://linkedin.com/in/brian-johnson" },
          location: { city: "Austin", state: "TX", country: "United States" },
          updateDate: new Date().toISOString(),
        },
      },
    ];

    return {
      success: true,
      contacts: mockContacts,
      companyName,
      metadata: {
        source: "mock_fallback",
        uei,
        generated_at: new Date().toISOString(),
      },
    };
  }
}