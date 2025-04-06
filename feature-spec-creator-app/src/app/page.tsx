import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Service Specification Creator</h1>
      <p className="mb-6 text-lg text-gray-700">
        This tool helps you define OpenAPI and Entity specifications for your services efficiently.
      </p>
      <p className="mb-8">
        Follow the steps to create your specifications and generate the necessary files for your microservice.
      </p>
      <Link href="/create/setup" className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
        Start Creating Specs
      </Link>
    </div>
  );
}
