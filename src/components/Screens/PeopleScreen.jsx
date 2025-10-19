import React, { useState } from 'react';
import './PeopleScreen.css';

const PeopleScreen = () => {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@email.com',
      relationship: 'Emergency Contact',
      isEmergency: true,
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      phone: '+1 (555) 987-6543',
      email: 'jane.smith@email.com',
      relationship: 'Family',
      isEmergency: true,
      avatar: null
    },
    {
      id: 3,
      name: 'Dr. Wilson',
      phone: '+1 (555) 456-7890',
      email: 'dr.wilson@hospital.com',
      relationship: 'Doctor',
      isEmergency: false,
      avatar: null
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isEmergency: false
  });
  const [alert, setAlert] = useState(null);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      const contact = {
        id: Date.now(),
        ...newContact,
        avatar: null
      };
      setContacts([...contacts, contact]);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        isEmergency: false
      });
      setShowAddForm(false);
      setAlert({
        type: 'success',
        message: `Contact "${contact.name}" added successfully`
      });
    }
  };

  const handleDeleteContact = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setContacts(contacts.filter(c => c.id !== contactId));
    setAlert({
      type: 'info',
      message: `Contact "${contact.name}" removed`
    });
  };

  const handleCallContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSMSContact = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  const handleEmailContact = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const emergencyContacts = contacts.filter(contact => contact.isEmergency);
  const regularContacts = contacts.filter(contact => !contact.isEmergency);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="screen-container">
      <div className="people-screen">
        <div className="people-header">
          <h1>Emergency Contacts</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Add Contact
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
            <button 
              className="alert-close"
              onClick={() => setAlert(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Add Contact Form */}
        {showAddForm && (
          <div className="card add-contact-form">
            <h3>Add New Contact</h3>
            <form onSubmit={handleAddContact}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                >
                  <option value="">Select relationship</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Emergency Contact">Emergency Contact</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newContact.isEmergency}
                    onChange={(e) => setNewContact({...newContact, isEmergency: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Emergency Contact
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Contact</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Emergency Contacts Section */}
        {emergencyContacts.length > 0 && (
          <div className="contacts-section">
            <h2 className="section-title">Emergency Contacts</h2>
            <div className="contacts-grid">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="contact-card emergency-contact">
                  <div className="contact-avatar">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} />
                    ) : (
                      <div className="avatar-initials">{getInitials(contact.name)}</div>
                    )}
                    <div className="emergency-badge">⚡</div>
                  </div>
                  <div className="contact-info">
                    <h3 className="contact-name">{contact.name}</h3>
                    <p className="contact-relationship">{contact.relationship}</p>
                    <p className="contact-phone">{contact.phone}</p>
                    {contact.email && <p className="contact-email">{contact.email}</p>}
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="action-btn call-btn"
                      onClick={() => handleCallContact(contact.phone)}
                      title="Call"
                    >
                      📞
                    </button>
                    <button 
                      className="action-btn sms-btn"
                      onClick={() => handleSMSContact(contact.phone)}
                      title="SMS"
                    >
                      💬
                    </button>
                    {contact.email && (
                      <button 
                        className="action-btn email-btn"
                        onClick={() => handleEmailContact(contact.email)}
                        title="Email"
                      >
                        📧
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteContact(contact.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Contacts Section */}
        {regularContacts.length > 0 && (
          <div className="contacts-section">
            <h2 className="section-title">Other Contacts</h2>
            <div className="contacts-grid">
              {regularContacts.map((contact) => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-avatar">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} />
                    ) : (
                      <div className="avatar-initials">{getInitials(contact.name)}</div>
                    )}
                  </div>
                  <div className="contact-info">
                    <h3 className="contact-name">{contact.name}</h3>
                    <p className="contact-relationship">{contact.relationship}</p>
                    <p className="contact-phone">{contact.phone}</p>
                    {contact.email && <p className="contact-email">{contact.email}</p>}
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="action-btn call-btn"
                      onClick={() => handleCallContact(contact.phone)}
                      title="Call"
                    >
                      📞
                    </button>
                    <button 
                      className="action-btn sms-btn"
                      onClick={() => handleSMSContact(contact.phone)}
                      title="SMS"
                    >
                      💬
                    </button>
                    {contact.email && (
                      <button 
                        className="action-btn email-btn"
                        onClick={() => handleEmailContact(contact.email)}
                        title="Email"
                      >
                        📧
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteContact(contact.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {contacts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No contacts yet</h3>
            <p>Add emergency contacts to get started with SafeCircle</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleScreen;