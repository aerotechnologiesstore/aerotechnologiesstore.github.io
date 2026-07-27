export default function Footer() {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant mt-12 sm:mt-20">
      <div className="py-8 sm:py-12 px-4 sm:px-margin-desktop w-full max-w-container-max-width mx-auto">
        {/* Main footer content - horizontal on all screens */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start justify-between w-full">
          {/* Brand */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="font-accent-playful text-accent-playful text-primary mb-2 text-2xl sm:text-3xl">Aero Store</div>
            <p className="text-on-surface-variant text-sm sm:max-w-md leading-relaxed pr-8 sm:pr-0">Building the future of software discovery, one app at a time. Join our global community of creators and users.</p>
          </div>

          {/* Links */}
          <div className="flex w-full sm:w-auto justify-start sm:justify-end gap-12 sm:gap-16 pr-12 sm:pr-0">
            <div className="flex flex-col gap-2 sm:gap-3">
              <h5 className="font-bold text-on-surface uppercase tracking-widest text-[10px] sm:text-xs">Explore</h5>
              <a href="/" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">Latest Apps</a>
              <a href="/developers" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">Developer Hub</a>
              <a href="/about" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">About Us</a>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
              <h5 className="font-bold text-on-surface uppercase tracking-widest text-[10px] sm:text-xs">Resources</h5>
              <a href="/support" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">Help Center</a>
              <a href="/contact" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">Contact Us</a>
              <a href="/privacy" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">Privacy Policy</a>
              <a href="/terms" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">Terms of Service</a>
              <a href="/dmca" className="text-on-surface-variant text-xs sm:text-sm hover:text-primary transition-all">DMCA & Copyright</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-outline-variant">
          <p className="text-on-surface-variant text-[10px] sm:text-xs">&copy; {new Date().getFullYear()} Aero Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
