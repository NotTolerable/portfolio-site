import Link from "next/link";

export default function NotFound() {
  return <><main className="infra-page route-page shell" id="content"><p className="eyebrow mono">404 / PAGE NOT FOUND</p><h1>Page not found.</h1><p className="page-lead">The page you’re looking for isn’t here.</p><Link href="/" className="button">Back to portfolio ↗</Link></main></>;
}
