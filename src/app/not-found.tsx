import Link from "next/link";

export default function NotFound() {
  return <><main className="infra-page route-page shell" id="content"><p className="eyebrow mono">404 / PAGE NOT FOUND</p><h1>A little<br />off course.</h1><p className="page-lead">Let’s get you back to the work.</p><Link href="/" className="button">Back to portfolio ↗</Link></main></>;
}
