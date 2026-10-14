import Link from "next/link";
import { Header } from "@/components/header";

export default function NotFound() {
  return <><Header /><main className="infra-page shell" id="main"><p className="eyebrow mono">404 / PAGE NOT FOUND</p><h1>A little<br />off course.</h1><p className="page-lead">Let’s get you back to the work.</p><Link href="/" className="button">Back to portfolio ↗</Link></main></>;
}
