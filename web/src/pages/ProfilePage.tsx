import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { User, Mail, MapPin, Bell, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [region, setRegion] = useState('US');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);

  const allCategories = [
    'electronics', 'clothing', 'collectibles', 'books', 'automotive',
    'music', 'furniture', 'art', 'sports', 'tools', 'jewelry',
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setDisplayName(data.displayName || user?.displayName || '');
      setRegion(data.preferences?.defaultRegion || 'US');
      setEmailNotifications(data.preferences?.notificationSettings?.email ?? true);
      setPushNotifications(data.preferences?.notificationSettings?.push ?? true);
      setFavoriteCategories(data.preferences?.favoriteCategories || []);
    } catch (err: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateProfile({
        displayName,
        preferences: {
          defaultRegion: region,
          favoriteCategories,
          notificationSettings: { email: emailNotifications, push: pushNotifications },
        },
      });
      if (displayName !== user?.displayName) {
        await updateUserProfile({ displayName });
      }
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(cat: string) {
    setFavoriteCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="input w-full"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4" />
                <span>{user?.email || 'No email'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" /> Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Region</label>
              <select value={region} onChange={e => setRegion(e.target.value)} className="input w-full">
                <option value="US">United States</option>
                <option value="Global">Global</option>
                <option value="Utah">Utah (Local)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Categories</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      favoriteCategories.includes(cat)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" /> Notifications
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">Email notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={e => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">Push notifications</span>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={e => setPushNotifications(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-gray-300"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
