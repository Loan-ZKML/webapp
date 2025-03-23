import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
          zKML Credit Loan
        </h1>
        <ul className="space-y-4">
          <li>
            <Link
              href="/request"
              className="block p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <h2 className="text-xl font-semibold mb-2">Request a Loan →</h2>
              <p className="text-blue-200">Apply for a loan using zero-knowledge proofs</p>
            </Link>
          </li>
          <li>
            <Link
              href="/verify"
              className="block p-6 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <h2 className="text-xl font-semibold mb-2">Verify a Loan →</h2>
              <p className="text-blue-200">Check the status of an existing loan request</p>
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
