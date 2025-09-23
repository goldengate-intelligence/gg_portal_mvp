import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/protected-route';
import { SettingsLayout } from '../../components/settings/settings-layout';
import { FormSection, FormField, FormSelect, FormActions, SaveButton, CancelButton } from '../../components/settings/form-components';
import { useAuth } from '../../contexts/auth-context';

function ProfileSettingsComponent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    jobTitle: '',
    phone: '',
    timezone: 'America/New_York',
    language: 'en',
    bio: ''
  });

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
    { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
    { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
    { value: 'UTC', label: 'UTC (UTC+0)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile updated:', formData);
      // Here you would typically call an API to update the user profile
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      username: user?.username || '',
      email: user?.email || '',
      companyName: user?.companyName || '',
      jobTitle: '',
      phone: '',
      timezone: 'America/New_York',
      language: 'en',
      bio: ''
    });
  };

  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Profile Settings"
        description="Manage your personal information and preferences"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <FormSection
            title="Personal Information"
            description="Update your basic profile information and contact details."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Full Name"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
              <FormField
                label="Username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Email Address"
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              <FormField
                label="Phone Number"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </FormSection>

          <FormSection
            title="Professional Information"
            description="Provide details about your professional background."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Company Name"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
              />
              <FormField
                label="Job Title"
                id="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Enter your job title"
              />
            </div>
          </FormSection>

          <FormSection
            title="Preferences"
            description="Configure your regional and language preferences."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Timezone"
                id="timezone"
                value={formData.timezone}
                onChange={handleChange}
                options={timezoneOptions}
                required
              />
              <FormSelect
                label="Language"
                id="language"
                value={formData.language}
                onChange={handleChange}
                options={languageOptions}
                required
              />
            </div>
          </FormSection>

          <FormActions>
            <CancelButton onClick={handleCancel} />
            <SaveButton loading={loading} />
          </FormActions>
        </form>
      </SettingsLayout>
    </ProtectedRoute>
  );
}

export const profileSettingsRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/profile',
  component: ProfileSettingsComponent,
});

export default profileSettingsRoute;