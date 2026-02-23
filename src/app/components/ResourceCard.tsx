import { MapPin, Phone, Clock, ExternalLink, Languages, Users, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Resource } from '../models/Resource.ts';

export type { Resource };

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const [copied, setCopied] = useState(false);

  const categoryColors = {
    food: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    healthcare: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    legal: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    education: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    housing: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    childcare: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
    cultural: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    'mental-health': 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300',
    advocacy: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  };

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(resource.address)}`;

  const handleCopyPhone = () => {
    if (resource.phone) {
      navigator.clipboard.writeText(resource.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl p-5 transition-all hover:shadow-xl flex flex-col"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{resource.name}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryColors[resource.category]}`}>
            {resource.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </span>
        </div>
        {resource.distance && (
          <span className="text-xs ml-2 whitespace-nowrap px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            📍 {resource.distance}
          </span>
        )}
      </div>

      <p className="text-sm mb-4 flex-1" style={{ color: 'var(--foreground-muted)' }}>{resource.description}</p>

      {resource.servingCommunities && resource.servingCommunities.length > 0 && (
        <div className="mb-3">
          <div className="flex items-start mb-1">
            <Users size={14} className="mr-1 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Serving:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {resource.servingCommunities.map((community, idx) => (
              <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                {community}
              </span>
            ))}
          </div>
        </div>
      )}

      {resource.accessibilityFeatures && resource.accessibilityFeatures.length > 0 && (
        <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--teal-light)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--teal)' }}>♿ Accessibility:</p>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{resource.accessibilityFeatures.join(', ')}</p>
        </div>
      )}

      <div className="space-y-2 text-sm mt-auto" style={{ color: 'var(--foreground-muted)' }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start hover:text-blue-600 dark:hover:text-blue-400 group transition-colors"
        >
          <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="underline-offset-2 group-hover:underline">{resource.address}</span>
        </a>

        {resource.phone && (
          <div className="flex items-center gap-2">
            <a href={`tel:${resource.phone}`} className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Phone size={16} className="mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              {resource.phone}
            </a>
            <button
              onClick={handleCopyPhone}
              title="Copy phone number"
              className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {resource.hours && (
          <div className="flex items-center">
            <Clock size={16} className="mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <span>{resource.hours}</span>
          </div>
        )}

        {resource.languages && resource.languages.length > 0 && (
          <div className="flex items-start">
            <Languages size={16} className="mr-2 mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <span>{resource.languages.join(', ')}</span>
          </div>
        )}

        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-3 font-medium"
          >
            <ExternalLink size={16} className="mr-1" />
            Visit Website
          </a>
        )}
      </div>
    </div>
  );
}
