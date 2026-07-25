const Footer = () => {
  return (
    <footer className="bg-[#E7E4D8] border-t border-[#C5C2B4]/80 py-3.5 text-center text-xs text-[#575D58] shrink-0">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="flex items-center gap-1.5 font-medium">
          <span>Built for</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#2A4B3A] hover:text-[#1E372B] underline underline-offset-4 decoration-[#2A4B3A]/30 transition-colors"
          >
            Digital Heroes Training Task
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
