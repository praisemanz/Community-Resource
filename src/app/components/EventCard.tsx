import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import type { CommunityEvent } from '../models/CommunityEvent.ts';

export type { CommunityEvent };

type EventCardProps = {
  event: CommunityEvent;
};

export function EventCard({ event }: EventCardProps) {
  const typeColors = {
    celebration: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    pride: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
    workshop: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    cultural: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    'support-group': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    'information-session': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  };

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();

  return (
    <div
      className="rounded-xl p-5 transition-all hover:shadow-xl"
      style={{
        backgroundColor: 'var(--surface)',
        border: isUpcoming ? '1px solid var(--primary)' : '1px solid var(--border)',
        opacity: isUpcoming ? 1 : 0.75,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{event.name}</h3>
            {!isUpcoming && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                Past Event
              </span>
            )}
          </div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
            {event.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
        </div>
        {event.isFree && (
          <span className="bg-green-600 dark:bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium ml-2">
            FREE
          </span>
        )}
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>{event.description}</p>

      {event.targetCommunities && event.targetCommunities.length > 0 && (
        <div className="mb-3">
          <div className="flex items-start mb-1">
            <Users size={14} className="mr-1 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">For:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {event.targetCommunities.map((community, idx) => (
              <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                {community}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
        <div className="flex items-center">
          <Calendar size={16} className="mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
          <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center">
          <Clock size={16} className="mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
          <span>{event.time}</span>
        </div>

        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start hover:text-blue-600 dark:hover:text-blue-400 group transition-colors"
        >
          <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="underline-offset-2 group-hover:underline">{event.location}</span>
        </a>

        {event.organizer && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Organized by: <span className="font-medium">{event.organizer}</span>
            </p>
          </div>
        )}

        {event.registration && (
          <a
            href={event.registration}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-3 font-medium"
          >
            <ExternalLink size={16} className="mr-1" />
            Register / Learn More
          </a>
        )}
      </div>
    </div>
  );
}
