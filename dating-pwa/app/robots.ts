import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Hide internal APIs from search engines
    },
    sitemap: 'https://lovewithyou.vercel.app/sitemap.xml',
  }
}
