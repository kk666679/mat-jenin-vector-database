import { components } from '../components';

export default function Page({ params }: { params: { slug: string } }) {
  const Component = components[params.slug];
  
  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
      </div>
    );
  }
  
  return <Component />;
}

