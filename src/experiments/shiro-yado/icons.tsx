type IconProps = { className?: string };

export function IconArrow({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconBack({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6 10.5V19h4.5v-5h3v5H18v-8.5" />
    </svg>
  );
}

export function IconBath({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 12h16v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-4Z" />
      <path d="M6 12V7a2 2 0 0 1 2-2h1" />
    </svg>
  );
}

export function IconBed({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18h18M7 10V8a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

export function IconHall({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function IconDoor({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 20V5a1 1 0 0 1 1-1h10v16" />
      <path d="M6 20h14M14 12h.01" />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 12l5 5L19 7" />
    </svg>
  );
}

export function IconMap({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

export function IconIsland({ className }: IconProps) {
  return (
    <svg className={className} width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M3 23.5c3.2-2.2 6.3-2.2 9.5 0s6.3 2.2 9.5 0 5.5-2.2 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 27c2.8-1.7 5.5-1.7 8.3 0s5.5 1.7 8.3 0 4.7-1.7 6.4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".65" />
      <path d="M8.5 21c1.7-4.5 4.2-7.2 7.5-8.2 3.5 1 6 3.7 7.5 8.2" fill="currentColor" opacity=".22" />
      <path d="M8.5 21c1.7-4.5 4.2-7.2 7.5-8.2 3.5 1 6 3.7 7.5 8.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 12.8V6.5M16 6.5h5l-1.4 1.8L21 10h-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.8 17.8c1-1.3 2-2 3.2-2s2.2.7 3.2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconVolume({ className, muted = false }: IconProps & { muted?: boolean }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      {muted ? <path d="m18 9 4 4m0-4-4 4" /> : <path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7 7 0 0 1 0 10" />}
    </svg>
  );
}
