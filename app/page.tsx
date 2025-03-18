import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main><h1>zKML Credit Loan</h1>
      <ul>
        <li><Link href="/request">
          Request a Loan
        </Link></li>
        <li><Link href="/verify">
          Verify a Loan
        </Link></li>
      </ul>
    </main>
  );
}
