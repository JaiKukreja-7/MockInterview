/**
 * Helper to get the correct URL for redirects based on environment.
 * Handles Localhost, Vercel Preview/Deployment URLs, and Production.
 */
export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your main domain in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for preview/deployments
    'http://localhost:3000/';

  // Make sure to include `https://` when not localhost
  url = url.includes('http') ? url : `https://${url}`;
  
  // Make sure to include a trailing slash
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  return url;
};
