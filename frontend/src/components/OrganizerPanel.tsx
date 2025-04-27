
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import toast, { Toaster } from 'react-hot-toast';
import './OrganizerPanel.css';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
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
  organizers: { organizer: { id: number; name: string }; isHost: boolean; pendingConfirmation: boolean; expiresAt: string | null }[];
}

interface Stats {
  statusBreakdown: [string, number][];
  categoryBreakdown: [string, number][];
  typeBreakdown: [string, number][];
  upcomingEvents: number;
}

const OrganizerPanel: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    organizerId: localStorage.getItem('userId') || '',
    collaboratorIds: [] as number[],
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    location: '',
    category: 'CS' as 'CS' | 'RAS' | 'IAS' | 'WIE',
    type: 'CONGRESS' as 'CONGRESS' | 'CONFERENCE' | 'HACKATHON' | 'NORMAL' | 'ONLINE',
    image: null as File | null,
  });
  const [activeSection, setActiveSection] = useState<'events' | 'stats'>('events');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        throw new Error(`HTTP ${response.status}`);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries reached');
  };

  useEffect(() => {
    fetchEvents(page);
    fetchOrganizers();
  }, [page]);

  const fetchEvents = async (pageNum: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await fetchWithRetry(
        `http://localhost:3000/organizer/events?page=${pageNum}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch events');
      setEvents(data.events);
      setTotalEvents(data.total);
      setStats({
        statusBreakdown: data.statusBreakdown,
        categoryBreakdown: data.categoryBreakdown,
        typeBreakdown: data.typeBreakdown,
        upcomingEvents: data.upcomingEvents,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
      toast.error(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const cached = localStorage.getItem('organizers');
      if (cached) {
        setOrganizers(JSON.parse(cached));
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await fetchWithRetry('http://localhost:3000/admin/users', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch organizers');
      const orgs = data.data.filter((user: User) => user.role === 'ORGANIZER');
      setOrganizers(orgs);
      localStorage.setItem('organizers', JSON.stringify(orgs));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch organizers');
      toast.error(err.message || 'Failed to fetch organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
    
  
      if (!eventForm.title.trim()) throw new Error('Title is required');
      if (!eventForm.date || isNaN(new Date(eventForm.date).getTime())) {
        throw new Error('Please select a valid date');
      }
      if (new Date(eventForm.date) < new Date()) throw new Error('Date cannot be in the past');
      if (!eventForm.status) throw new Error('Status is required');
      if (!['CS', 'RAS', 'IAS', 'WIE'].includes(eventForm.category)) {
        throw new Error('Invalid category');
      }
      if (!['CONGRESS', 'CONFERENCE', 'HACKATHON', 'NORMAL', 'ONLINE'].includes(eventForm.type)) {
        throw new Error('Invalid type');
      }
      if (!isEditingEvent && eventForm.collaboratorIds.includes(parseInt(eventForm.organizerId))) {
        throw new Error('Organizer cannot be a collaborator');
      }
      if (!isEditingEvent && eventForm.collaboratorIds.length > 2) {
        throw new Error('Maximum 2 collaborators allowed');
      }
      if (eventForm.image && !['image/jpeg', 'image/png'].includes(eventForm.image.type)) {
        throw new Error('Image must be JPG or PNG');
      }
      if (eventForm.image && eventForm.image.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const token = localStorage.getItem('token');
      const url = isEditingEvent
        ? `http://localhost:3000/organizer/events/${currentEvent!.id}`
        : 'http://localhost:3000/organizer/events';
      const method = isEditingEvent ? 'PUT' : 'POST';

      const formData = new FormData();
      formData.append('title', eventForm.title);
      if (eventForm.description) formData.append('description', eventForm.description);
      formData.append('date', new Date(eventForm.date).toISOString());
      if (!isEditingEvent) {
     
        formData.append('organizerId', eventForm.organizerId);
        if (eventForm.collaboratorIds.length > 0) {
          formData.append('collaboratorIds', eventForm.collaboratorIds.join(','));
        }
      }
      formData.append('status', eventForm.status);
      if (eventForm.location) formData.append('location', eventForm.location);
      formData.append('category', eventForm.category);
      formData.append('type', eventForm.type);
      if (eventForm.image) {
        formData.append('image', eventForm.image);
      } else if (isEditingEvent && currentEvent?.image) {
        formData.append('existingImageUrl', currentEvent.image);
      }

      const response = await fetchWithRetry(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save event');
      setShowEventModal(false);
      resetEventForm();
      fetchEvents(page);
      toast.success('Event saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
      toast.error(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithRetry(`http://localhost:3000/organizer/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete event');
      fetchEvents(page);
      toast.success('Event deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      toast.error(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmParticipation = async (eventId: number, confirm: boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithRetry(`http://localhost:3000/organizer/events/${eventId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to confirm participation');
      fetchEvents(page);
      toast.success(confirm ? 'Participation confirmed!' : 'Participation declined!');
    } catch (err: any) {
      setError(err.message || 'Failed to confirm participation');
      toast.error(err.message || 'Failed to confirm participation');
    } finally {
      setLoading(false);
    }
  };

  const openEventModal = (event?: Event) => {
    if (event) {
      setIsEditingEvent(true);
      setCurrentEvent(event);
      const hostOrganizer = event.organizers.find(o => o.isHost);
      setEventForm({
        title: event.title,
        description: event.description || '',
        date: event.date.split('T')[0],
        organizerId: hostOrganizer ? hostOrganizer.organizer.id.toString() : localStorage.getItem('userId') || '',
        collaboratorIds: event.organizers.filter(o => !o.isHost).map(o => o.organizer.id),
        status: event.status === 'CANCELLED' ? 'DRAFT' : event.status,
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

  const openQuickViewModal = (event: Event) => {
    setCurrentEvent(event);
    setShowQuickViewModal(true);
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      organizerId: localStorage.getItem('userId') || '',
      collaboratorIds: [],
      status: 'DRAFT',
      location: '',
      category: 'CS',
      type: 'CONGRESS',
      image: null,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/');
    toast.success('Logged out successfully!');
  };

  const handleCollaboratorChange = (orgId: number) => {
    setEventForm(prev => {
      const newCollaboratorIds = prev.collaboratorIds.includes(orgId)
        ? prev.collaboratorIds.filter(id => id !== orgId)
        : [...prev.collaboratorIds, orgId].slice(0, 2);
      return { ...prev, collaboratorIds: newCollaboratorIds };
    });
  };

  const totalPages = Math.ceil(totalEvents / limit);

  const statusChartData = {
    labels: stats?.statusBreakdown.map(([status]) => status) || [],
    datasets: [
      {
        label: 'Status Breakdown',
        data: stats?.statusBreakdown.map(([, count]) => count) || [],
        backgroundColor: 'rgba(0, 139, 139, 0.6)',
        borderColor: 'rgba(0, 139, 139, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: stats?.categoryBreakdown.map(([category]) => category) || [],
    datasets: [
      {
        label: 'Category Breakdown',
        data: stats?.categoryBreakdown.map(([, count]) => count) || [],
        backgroundColor: 'rgba(255, 111, 97, 0.6)',
        borderColor: 'rgba(255, 111, 97, 1)',
        borderWidth: 1,
      },
    ],
  };

  const typeChartData = {
    labels: stats?.typeBreakdown.map(([type]) => type) || [],
    datasets: [
      {
        label: 'Type Breakdown',
        data: stats?.typeBreakdown.map(([, count]) => count) || [],
        backgroundColor: 'rgba(0, 139, 139, 0.6)',
        borderColor: 'rgba(0, 139, 139, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
  };

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const particlesOptions = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: '#ff69b4' },
      shape: { type: 'circle' },
      opacity: { value: 0.7, random: true },
      size: { value: 4, random: true },
      move: { enable: true, speed: 2, direction: 'none' as const, random: true },
    },
    interactivity: {
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      modes: { repulse: { distance: 100 }, push: { quantity: 4 } },
    },
  };

  return (
    <div className="organizer-panel-container">
      <Toaster position="top-right" />
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
      <div className="organizer-layout">
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="organizer-title">Organizer Panel</h2>
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              ☰
            </button>
          </div>
          <div className="user-profile">
            <h3>{localStorage.getItem('userName') || 'Organizer'}</h3>
            <p>Role: ORGANIZER</p>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'events' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('events');
                setIsSidebarOpen(false);
              }}
            >
              Events
            </button>
            <button
              className={`nav-item ${activeSection === 'stats' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('stats');
                setIsSidebarOpen(false);
              }}
            >
              Statistics
            </button>
            <button className="nav-item logout-button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>

        <div className="organizer-content">
          {error && <p className="error-message">{error}</p>}
          {loading && <div className="loading-spinner">Loading...</div>}

          {activeSection === 'events' && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">Your Events</h2>
                <button className="add-button glow-button" onClick={() => openEventModal()}>
                  Add Event
                </button>
              </div>
              <div className="event-list">
                {events.map(event => {
                  const userId = localStorage.getItem('userId');
                  console.log(`Event ${event.id} organizers:`, event.organizers, 'userId:', userId); // Debug
                  return (
                    <div key={event.id} className="event-card glow-card" onClick={() => openQuickViewModal(event)}>
                      <div className="event-image">
                        {event.image ? (
                          <img src={`http://localhost:3000${event.image}`} alt={event.title} className="image-hover" />
                        ) : (
                          <div className="image-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="event-details">
                        <h3>{event.title}</h3>
                        <span className={`status-badge status-${event.status.toLowerCase()}`}>
                          {event.status}
                        </span>
                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>Category:</strong> {event.category}</p>
                        <p><strong>Type:</strong> {event.type}</p>
                        <p><strong>Location:</strong> {event.location || 'N/A'}</p>
                        <p>
                          <strong>Organizers:</strong>{' '}
                          {event.organizers.map(o => (
                            <span key={o.organizer.id}>
                              {o.organizer.name} ({o.isHost ? 'Host' : 'Collaborator'})
                              {o.pendingConfirmation && ' (Pending)'}
                              {', '}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className="event-actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="edit-button glow-button"
                          onClick={() => openEventModal(event)}
                          aria-label={`Edit event ${event.title}`}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button glow-button"
                          onClick={() => handleDeleteEvent(event.id)}
                          aria-label={`Delete event ${event.title}`}
                        >
                          Delete
                        </button>
                        {userId && event.organizers.some(o => o.organizer.id === parseInt(userId) && o.pendingConfirmation) && (
                          <div className="confirm-buttons">
                            <button
                              className="confirm-button glow-button"
                              onClick={() => handleConfirmParticipation(event.id, true)}
                              aria-label={`Confirm participation for ${event.title}`}
                            >
                              Confirm
                            </button>
                            <button
                              className="decline-button glow-button"
                              onClick={() => handleConfirmParticipation(event.id, false)}
                              aria-label={`Decline participation for ${event.title}`}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="glow-button">
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="glow-button">
                  Next
                </button>
              </div>
            </div>
          )}

          {activeSection === 'stats' && stats && (
            <div className="stats-dashboard">
              <h2 className="section-title">Event Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card glow-card">
                  <h3>Upcoming Events</h3>
                  <p className="stat-number">{stats.upcomingEvents}</p>
                </div>
                <div className="stat-card glow-card">
                  <h3>Status Breakdown</h3>
                  <div className="chart-container">
                    <Bar data={statusChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="stat-card glow-card">
                  <h3>Category Breakdown</h3>
                  <div className="chart-container">
                    <Bar data={categoryChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="stat-card glow-card">
                  <h3>Type Breakdown</h3>
                  <div className="chart-container">
                    <Bar data={typeChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEventModal && (
        <div className="modal">
          <div className="modal-content slide-in glow-modal">
            <h2 className="modal-title">{isEditingEvent ? 'Edit Event' : 'Add Event'}</h2>
            <form onSubmit={handleEventSubmit} className="modal-form">
              <div className="form-group">
                <label title="Event title (required)">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                  className="glow-input"
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label title="Event description">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  className="glow-input"
                  placeholder="Enter event description (optional)"
                />
              </div>
              <div className="form-group">
                <label title="Event date (required)">Date</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                  className="glow-input"
                />
              </div>
              {!isEditingEvent && (
                <div className="form-group">
                  <label title="Select up to 2 collaborators">Collaborators (Max 2)</label>
                  <div className="checkbox-list">
                    {organizers
                      .filter(org => org.id.toString() !== eventForm.organizerId)
                      .map(org => (
                        <label key={org.id} className="checkbox-item glow-checkbox">
                          <input
                            type="checkbox"
                            checked={eventForm.collaboratorIds.includes(org.id)}
                            onChange={() => handleCollaboratorChange(org.id)}
                            disabled={eventForm.collaboratorIds.length >= 2 && !eventForm.collaboratorIds.includes(org.id)}
                          />
                          {org.name} (ID: {org.id})
                        </label>
                      ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label title="Event status">Status</label>
                <select
                  value={eventForm.status}
                  onChange={e => setEventForm({ ...eventForm, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                  required
                  className="glow-input"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
              <div className="form-group">
                <label title="Event location">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  className="glow-input"
                  placeholder="Enter location (optional)"
                />
              </div>
              <div className="form-group">
                <label title="Event category">Category</label>
                <select
                  value={eventForm.category}
                  onChange={e => setEventForm({ ...eventForm, category: e.target.value as 'CS' | 'RAS' | 'IAS' | 'WIE' })}
                  required
                  className="glow-input"
                >
                  <option value="CS">CS</option>
                  <option value="RAS">RAS</option>
                  <option value="IAS">IAS</option>
                  <option value="WIE">WIE</option>
                </select>
              </div>
              <div className="form-group">
                <label title="Event type">Type</label>
                <select
                  value={eventForm.type}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      type: e.target.value as 'CONGRESS' | 'CONFERENCE' | 'HACKATHON' | 'NORMAL' | 'ONLINE',
                    })
                  }
                  required
                  className="glow-input"
                >
                  <option value="CONGRESS">CONGRESS</option>
                  <option value="CONFERENCE">CONFERENCE</option>
                  <option value="HACKATHON">HACKATHON</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </div>
              <div className="form-group">
                <label title="Upload a new event image">Event Image</label>
                <div className="image-input-group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={e => setEventForm({ ...eventForm, image: e.target.files![0] })}
                    className="glow-input"
                  />
                  {isEditingEvent && currentEvent?.image && (
                    <div>
                      <p>Current Image:</p>
                      <img
                        src={`http://localhost:3000${currentEvent.image}`}
                        alt="Current"
                        className="image-preview image-hover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button glow-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="cancel-button glow-button"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickViewModal && currentEvent && (
        <div className="modal">
          <div className="modal-content slide-in glow-modal">
            <h2 className="modal-title">{currentEvent.title}</h2>
            <div className="quick-view-details">
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-badge status-${currentEvent.status.toLowerCase()}`}>
                  {currentEvent.status}
                </span>
              </p>
              <p><strong>Date:</strong> {new Date(currentEvent.date).toLocaleDateString()}</p>
              <p><strong>Description:</strong> {currentEvent.description || 'N/A'}</p>
              <p><strong>Category:</strong> {currentEvent.category}</p>
              <p><strong>Type:</strong> {currentEvent.type}</p>
              <p><strong>Location:</strong> {currentEvent.location || 'N/A'}</p>
              <p><strong>Event Tag:</strong> {currentEvent.eventTag}</p>
              <p>
                <strong>Organizers:</strong>{' '}
                {currentEvent.organizers.map(o => (
                  <span key={o.organizer.id}>
                    {o.organizer.name} ({o.isHost ? 'Host' : 'Collaborator'})
                    {o.pendingConfirmation && ' (Pending)'}
                    {', '}
                  </span>
                ))}
              </p>
              {currentEvent.image && (
                <img
                  src={`http://localhost:3000${currentEvent.image}`}
                  alt={currentEvent.title}
                  className="quick-view-image image-hover"
                />
              )}
            </div>
            <div className="modal-buttons">
              <button className="submit-button glow-button" onClick={() => setShowQuickViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerPanel;
