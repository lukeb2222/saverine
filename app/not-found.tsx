import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-marker text-5xl text-red">Wrong turn.</p>
      <h1 className="h-display mt-4 text-2xl">This page doesn&rsquo;t exist</h1>
      <Link href="/" className="btn btn-red mt-8">
        Back to the good stuff
      </Link>
    </div>
  );
}
