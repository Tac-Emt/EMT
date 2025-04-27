import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';


interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'ORGANIZER';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  location: string | null;
  image: string | null;
  category: 'CS' | 'RAS' | 'IAS' | 'WIE';
  type: 'CONGRESS' | 'CONFERENCE' | 'HACKATHON' | 'NORMAL' | 'ONLINE';
  eventTag: string;
  organizers: Array<{
    organizer: { id: number; name: string };
    isHost: boolean;
    pendingConfirmation: boolean;
  }>;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'users' | 'events'>('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [confirmEventId, setConfirmEventId] = useState<number | null>(null);
  const [confirmOrganizerId, setConfirmOrganizerId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'ORGANIZER',
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    organizerId: '',
    collaboratorIds: [] as number[],
    location: '',
    category: 'CS' as 'CS' | 'RAS' | 'IAS' | 'WIE',
    type: 'CONGRESS' as 'CONGRESS' | 'CONFERENCE' | 'HACKATHON' | 'NORMAL' | 'ONLINE',
    image: null as File | null,
  });


  useEffect(() => {
    fetchUsers();
    fetchEvents();
    fetchOrganizers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await fetch('http://localhost:3000/admin/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await fetch('http://localhost:3000/admin/events', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch events');
      setEvents(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await fetch('http://localhost:3000/admin/users', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch organizers');
      setOrganizers(data.data.filter((user: User) => user.role === 'ORGANIZER'));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = isEditingUser
        ? `http://localhost:3000/admin/users/${currentUser!.id}`
        : 'http://localhost:3000/admin/users';
      const method = isEditingUser ? 'PUT' : 'POST';
      const body = isEditingUser
        ? { email: userForm.email, name: userForm.name, role: userForm.role }
        : {
            email: userForm.email,
            password: userForm.password,
            name: userForm.name,
            role: userForm.role,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${isEditingUser ? 'update' : 'create'} user`);
      setShowUserModal(false);
      resetUserForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditingUser ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
   
      if (!eventForm.title.trim()) throw new Error('Title is required');
      if (!eventForm.date || isNaN(new Date(eventForm.date).getTime())) {
        throw new Error('Please select a valid date');
      }
      if (!eventForm.organizerId) throw new Error('Organizer is required');
      if (!['CS', 'RAS', 'IAS', 'WIE'].includes(eventForm.category)) {
        throw new Error('Invalid category');
      }
      if (!['CONGRESS', 'CONFERENCE', 'HACKATHON', 'NORMAL', 'ONLINE'].includes(eventForm.type)) {
        throw new Error('Invalid type');
      }
      if (eventForm.collaboratorIds.includes(parseInt(eventForm.organizerId))) {
        throw new Error('Organizer cannot be a collaborator');
      }
      if (eventForm.collaboratorIds.length > 2) {
        throw new Error('Maximum 2 collaborators allowed');
      }
      if (eventForm.image && !['image/jpeg', 'image/png'].includes(eventForm.image.type)) {
        throw new Error('Image must be JPG or PNG');
      }
      if (eventForm.image && eventForm.image.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const url = isEditingEvent
        ? `http://localhost:3000/admin/events/${currentEvent!.id}`
        : 'http://localhost:3000/admin/events';
      const method = isEditingEvent ? 'PUT' : 'POST';

      const formData = new FormData();
      formData.append('title', eventForm.title);
      if (eventForm.description) formData.append('description', eventForm.description);
      formData.append('date', new Date(eventForm.date).toISOString());
      formData.append('organizerId', eventForm.organizerId);
      if (!isEditingEvent && eventForm.collaboratorIds.length > 0) {
        formData.append('collaboratorIds', eventForm.collaboratorIds.join(','));
      }
      if (eventForm.location) formData.append('location', eventForm.location);
      formData.append('category', eventForm.category);
      formData.append('type', eventForm.type);
   
      if (eventForm.image instanceof File) {
        console.log('Appending image:', eventForm.image.name, eventForm.image.type); 
        formData.append('image', eventForm.image);
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.message.includes('Invalid collaborator IDs')) {
          throw new Error('One or more collaborator IDs are invalid or not ORGANIZERs');
        } else if (data.message.includes('Invalid host organizer ID')) {
          throw new Error('Selected organizer is invalid or not an ORGANIZER');
        } else if (data.message.includes('Host cannot be a collaborator')) {
          throw new Error('Organizer cannot be selected as a collaborator');
        }
        throw new Error(data.message || `Failed to ${isEditingEvent ? 'update' : 'create'} event`);
      }
      setShowEventModal(false);
      resetEventForm();
      fetchEvents();
    } catch (err: any) {
      console.error('Event submission error:', err); 
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      if (!confirmEventId) throw new Error('No event selected for confirmation');
      if (!confirmOrganizerId || isNaN(parseInt(confirmOrganizerId))) {
        throw new Error('Please enter a valid Organizer ID');
      }
      const url = `http://localhost:3000/admin/events/${confirmEventId}/confirm`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: true, organizerId: confirmOrganizerId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to confirm participation');
      setShowConfirmModal(false);
      setConfirmEventId(null);
      setConfirmOrganizerId('');
      fetchEvents();
      alert(data.message);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm participation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineParticipation = async (eventId: number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      if (!confirmOrganizerId || isNaN(parseInt(confirmOrganizerId))) {
        throw new Error('Please enter a valid Organizer ID');
      }
      const url = `http://localhost:3000/admin/events/${eventId}/confirm`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: false, organizerId: confirmOrganizerId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to decline participation');
      setShowConfirmModal(false);
      setConfirmEventId(null);
      setConfirmOrganizerId('');
      fetchEvents();
      alert(data.message);
    } catch (err: any) {
      setError(err.message || 'Failed to decline participation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const url = `http://localhost:3000/admin/users/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete user');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const url = `http://localhost:3000/admin/events/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete event');
      fetchEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setIsEditingUser(true);
      setCurrentUser(user);
      setUserForm({ email: user.email, password: '', name: user.name, role: user.role });
    } else {
      setIsEditingUser(false);
      setCurrentUser(null);
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const openEventModal = (event?: Event) => {
    if (event) {
      setIsEditingEvent(true);
      setCurrentEvent(event);
      const hostOrganizer = event.organizers?.find(o => o.isHost);
      setEventForm({
        title: event.title,
        description: event.description || '',
        date: new Date(event.date).toISOString().split('T')[0],
        organizerId: hostOrganizer ? hostOrganizer.organizer.id.toString() : '',
        collaboratorIds: [],
        location: event.location || '',
        category: event.category,
        type: event.type,
        image: null,
      });
    } else {
      setIsEditingEvent(false);
      setCurrentEvent(null);
      resetEventForm();
    }
    setShowEventModal(true);
  };

  const openConfirmModal = (eventId: number) => {
    setConfirmEventId(eventId);
    setConfirmOrganizerId('');
    setShowConfirmModal(true);
  };

  const resetUserForm = () => {
    setUserForm({ email: '', password: '', name: '', role: 'USER' });
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      organizerId: '',
      collaboratorIds: [],
      location: '',
      category: 'CS',
      type: 'CONGRESS',
      image: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-layout">
        <div className="admin-header">
          <h2 className="admin-title">Admin Panel</h2>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="tab-container">
          <button
            className={`tab-button ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            Users
          </button>
          <button
            className={`tab-button ${activeSection === 'events' ? 'active' : ''}`}
            onClick={() => setActiveSection('events')}
          >
            Events
          </button>
        </div>

        <div className="section-separator"></div>

        <div className="admin-content">
          {error && <p className="error-message">{error}</p>}
          {loading && <p className="loading-message">Loading...</p>}

          {activeSection === 'users' && (
            <div className="section" key="users">
              <div className="section-header">
                <h2 className="section-title">Users</h2>
                <button className="add-button" onClick={() => openUserModal()}>
                  Add User
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{user.name}</td>
                        <td>{user.role}</td>
                        <td>{user.isEmailVerified ? 'Yes' : 'No'}</td>
                        <td>
                          <button className="edit-button" onClick={() => openUserModal(user)}>
                            Edit
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'events' && (
            <div className="section" key="events">
              <div className="section-header">
                <h2 className="section-title">Events</h2>
                <button className="add-button" onClick={() => openEventModal()}>
                  Add Event
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Organizers</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event.id}>
                        <td>
                          {event.image ? (
                            <img
                              src={`data:image/jpeg;base64,${event.image}`}
                              alt={event.title}
                              style={{ width: '50px', height: 'auto' }}
                            />
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{event.title}</td>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              event.status === 'DRAFT'
                                ? 'draft'
                                : event.status === 'PUBLISHED'
                                ? 'published'
                                : 'cancelled'
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td>{event.location || 'N/A'}</td>
                        <td>{event.category}</td>
                        <td>{event.type}</td>
                        <td>
                          {event.organizers?.map(o => (
                            <span key={o.organizer.id}>
                              {o.organizer.name} ({o.isHost ? 'Host' : 'Collaborator'})
                              {o.pendingConfirmation && ' (Pending)'}
                              {', '}
                            </span>
                          ))}
                        </td>
                        <td>
                          {event.status === 'DRAFT' && event.organizers?.some(o => o.pendingConfirmation) && (
                            <button
                              className="action-button confirm-button"
                              onClick={() => openConfirmModal(event.id)}
                            >
                              Confirm/Decline
                            </button>
                          )}
                          <button
                            className="edit-button"
                            onClick={() => openEventModal(event)}
                            disabled={event.status === 'DRAFT'}
                            title={
                              event.status === 'DRAFT'
                                ? 'Cannot edit until all organizers confirm'
                                : 'Edit event'
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">{isEditingUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleUserSubmit} className="modal-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  disabled={isEditingUser}
                />
              </div>
              {!isEditingUser && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={userForm.role}
                  onChange={e =>
                    setUserForm({ ...userForm, role: e.target.value as 'USER' | 'ADMIN' | 'ORGANIZER' })
                  }
                  required
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">{isEditingEvent ? 'Edit Event' : 'Add Event'}</h2>
            <form onSubmit={handleEventSubmit} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Organizer</label>
                <select
                  value={eventForm.organizerId}
                  onChange={e => setEventForm({ ...eventForm, organizerId: e.target.value })}
                  required
                >
                  <option value="">Select Organizer</option>
                  {organizers.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name} (ID: {org.id})
                    </option>
                  ))}
                </select>
              </div>
              {!isEditingEvent && (
                <div className="form-group">
                  <label>Collaborators (Max 2)</label>
                  <select
                    multiple
                    value={eventForm.collaboratorIds.map(String)}
                    onChange={e =>
                      setEventForm({
                        ...eventForm,
                        collaboratorIds: Array.from(e.target.selectedOptions, option =>
                          parseInt(option.value),
                        ).slice(0, 2),
                      })
                    }
                  >
                    {organizers
                      .filter(org => org.id.toString() !== eventForm.organizerId)
                      .map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name} (ID: {org.id})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={eventForm.category}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      category: e.target.value as 'CS' | 'RAS' | 'IAS' | 'WIE',
                    })
                  }
                  required
                >
                  <option value="CS">CS</option>
                  <option value="RAS">RAS</option>
                  <option value="IAS">IAS</option>
                  <option value="WIE">WIE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={eventForm.type}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      type: e.target.value as 'CONGRESS' | 'CONFERENCE' | 'HACKATHON' | 'NORMAL' | 'ONLINE',
                    })
                  }
                  required
                >
                  <option value="CONGRESS">CONGRESS</option>
                  <option value="CONFERENCE">CONFERENCE</option>
                  <option value="HACKATHON">HACKATHON</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image (JPG/PNG, max 5MB)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={fileInputRef}
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    console.log('File selected:', file ? file.name : 'None'); 
                    setEventForm({ ...eventForm, image: file });
                  }}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">Confirm Participation</h2>
            <form onSubmit={handleConfirmParticipation} className="modal-form">
              <div className="form-group">
                <label>Organizer ID</label>
                <input
                  type="number"
                  value={confirmOrganizerId}
                  onChange={e => setConfirmOrganizerId(e.target.value)}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Confirming...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  className="action-button decline-button"
                  onClick={() => confirmEventId && handleDeclineParticipation(confirmEventId)}
                  disabled={loading}
                >
                  Decline
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;