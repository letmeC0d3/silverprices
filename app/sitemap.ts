import { MetadataRoute } from 'next';
import citiesData from '../data/cities.json';
import { CityData } from '../lib/types';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://silverprices.in';
  const now = new Date();

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 2. Programmatic City Pages (30 major Indian cities)
  const cityRoutes: MetadataRoute.Sitemap = (citiesData as CityData[]).map((city) => ({
    url: `${baseUrl}/silver-rate-in-${city.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...cityRoutes];
}
