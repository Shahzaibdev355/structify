
import { Box } from "lucide-react";
import { Facebook, Instagram, Twitter, Github } from "lucide-react";

const Footer = () => {
    return ( 
        <footer>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="flex items-center justify-between gap-3 max-md:flex-col">
            <div className="text-base-content flex items-center gap-3 text-xl font-bold">
            <Box className="logo" />
              <span>Structify</span>
            </div>
            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <a
                href="#"
                className="link link-animated text-base-content/80 font-medium"
              >
                Product
              </a>
              <a
                href="#"
                className="link link-animated text-base-content/80 font-medium"
              >
                Pricing
              </a>
              <a
                href="#"
                className="link link-animated text-base-content/80 font-medium"
              >
                Community
              </a>
              <a
                href="#"
                className="link link-animated text-base-content/80 font-medium"
              >
                Enterprise
              </a>
            </nav>
            {/* Social Icons */}
            <div className="text-base-content flex h-5 gap-4">
  

  <a href="https://www.instagram.com/_shahzaibb._/" aria-label="Instagram">
    <Instagram className="size-5" />
  </a>

  <a href="https://x.com/_Shahzaib_Dev" aria-label="Twitter">
    <Twitter className="size-5" />
  </a>

  <a href="https://github.com/Shahzaibdev355" aria-label="Github">
    <Github className="size-5" />
  </a>
</div>

          </div>
        </div>
        <div className="divider" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-base-content text-center text-base">
            ©2026 
            {' '}
            <a href="" className="text-primary">
                Structify
            </a>
            {' '}
            <br className="md:hidden" />
            — Building better web experiences!
          </div>
        </div>
      </footer>
      
     );
}
 
export default Footer;