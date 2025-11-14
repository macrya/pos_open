import { useState, useEffect } from 'react';
import { settingsAPI, Settings as SettingsType } from '../services/api';

function Settings() {
  const [settings, setSettings] = useState<SettingsType>({
    business_name: '',
    business_type: '',
    currency: '',
    tax_rate: '',
    receipt_footer: '',
    low_stock_alerts: '',
    loyalty_enabled: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await settingsAPI.setMultiple(settings);
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      alert(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card">
        <h2>Business Configuration</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Configure your POS system to match your business needs
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Business Name</label>
            <input
              type="text"
              className="input"
              value={settings.business_name}
              onChange={(e) =>
                setSettings({ ...settings, business_name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="label">Business Type</label>
            <select
              className="input"
              value={settings.business_type}
              onChange={(e) =>
                setSettings({ ...settings, business_type: e.target.value })
              }
            >
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurant</option>
              <option value="grocery">Grocery</option>
              <option value="cafe">Cafe</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              Select your business type to optimize the POS interface
            </p>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Currency</label>
              <select
                className="input"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={parseFloat(settings.tax_rate) * 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tax_rate: (parseFloat(e.target.value) / 100).toString(),
                  })
                }
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                Enter as percentage (e.g., 8 for 8%)
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Receipt Footer</label>
            <textarea
              className="input"
              rows={3}
              value={settings.receipt_footer}
              onChange={(e) =>
                setSettings({ ...settings, receipt_footer: e.target.value })
              }
              placeholder="Thank you for your business!"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.low_stock_alerts === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    low_stock_alerts: e.target.checked ? 'true' : 'false',
                  })
                }
                style={{ marginRight: '8px' }}
              />
              Enable Low Stock Alerts
            </label>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={settings.loyalty_enabled === 'true'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    loyalty_enabled: e.target.checked ? 'true' : 'false',
                  })
                }
                style={{ marginRight: '8px' }}
              />
              Enable Loyalty Program
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>System Information</h2>
        <p>
          <strong>Version:</strong> 1.0.0
        </p>
        <p>
          <strong>Features:</strong>
        </p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Product Management</li>
          <li>Inventory Tracking</li>
          <li>Sales Processing</li>
          <li>Customer Management</li>
          <li>Sales Reports & Analytics</li>
          <li>Multi-payment Methods</li>
          <li>Tax Calculation</li>
          <li>Low Stock Alerts</li>
          <li>Customizable Business Settings</li>
        </ul>
      </div>
    </div>
  );
}

export default Settings;
