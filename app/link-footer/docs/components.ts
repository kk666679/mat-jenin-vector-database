import Features from '@/components/layout/link-footer/docs/features';
import Pricing from '@/components/layout/link-footer/docs/pricing';
import Documentation from '@/components/layout/link-footer/docs/documentation';
import ApiReference from '@/components/layout/link-footer/docs/api-reference';
import About from '@/components/layout/link-footer/docs/about';
import Blog from '@/components/layout/link-footer/docs/blog';
import Career from '@/components/layout/link-footer/docs/career';
import Contact from '@/components/layout/link-footer/docs/contact';
import Community from '@/components/layout/link-footer/docs/community';
import Support from '@/components/layout/link-footer/docs/support';
import Changelog from '@/components/layout/link-footer/docs/changelog';
import PrivacyPolicy from '@/components/layout/link-footer/docs/privacy-policy';
import TermsOfService from '@/components/layout/link-footer/docs/terms-of-service';
import CookiePolicy from '@/components/layout/link-footer/docs/cookie-policy';
import Gdpr from '@/components/layout/link-footer/docs/gdpr';

export const components: Record<string, React.ComponentType> = {
  features: Features,
  pricing: Pricing,
  documentation: Documentation,
  'api-reference': ApiReference,
  about: About,
  blog: Blog,
  career: Career,
  contact: Contact,
  community: Community,
  support: Support,
  changelog: Changelog,
  'privacy-policy': PrivacyPolicy,
  'terms-of-service': TermsOfService,
  'cookie-policy': CookiePolicy,
  gdpr: Gdpr,
};

