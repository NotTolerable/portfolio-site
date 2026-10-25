/** Cloudflare's email rewrite changes both text and href before React hydrates.
 * Keep this explicitly public, fixed contact block inside its documented exclusion.
 * The HTML is a trusted constant; do not interpolate untrusted content here.
 * https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
 */
const publicContact = '<!--email_off--><a class="contact-email" href="mailto:babisanp@gmail.com">babisanp@gmail.com <span aria-hidden="true">↗</span></a><!--/email_off-->';
export function PublicContact(){
  return <div className="contact-address" dangerouslySetInnerHTML={{__html:publicContact}} />;
}
