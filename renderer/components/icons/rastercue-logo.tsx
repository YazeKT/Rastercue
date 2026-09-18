import React from 'react';

/** Selected Rastercue R-and-pixel identity, reconstructed as flat vector geometry. */
export default function RastercueLogo(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 256 256" fill="currentColor" role="img" aria-label="Rastercue" {...props}>
    <path fillRule="evenodd" d="M24 48H176V112C176 140 160 158 140 162L196 224H128L72 164V224H24V48ZM72 88V128H124C136 128 144 120 144 108V88H72Z" />
    <path d="M188 20H232V64H188Z" />
  </svg>;
}
