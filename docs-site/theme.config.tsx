import React from 'react';

const config = {
  logo: (
    <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 18 }}>
      Cambia <span style={{ opacity: 0.5, fontWeight: 400 }}>docs</span>
    </span>
  ),
  project: { link: 'https://github.com/epode-studio/cambia' },
  docsRepositoryBase: 'https://github.com/epode-studio/cambia/tree/main/docs-site',
  footer: {
    text: (
      <span>
        MIT · Cambia · built on{' '}
        <a href="https://github.com/google-labs-code/design.md" target="_blank" rel="noreferrer">
          DESIGN.md
        </a>
      </span>
    ),
  },
  useNextSeoProps() {
    return { titleTemplate: '%s – Cambia Docs' };
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Cambia Docs" />
      <meta
        property="og:description"
        content="A DESIGN.md extension and a live, on-device engine: interfaces that personalize per user, with conserved traits that never move."
      />
    </>
  ),
  primaryHue: 200,
  primarySaturation: 28,
  sidebar: { defaultMenuCollapseLevel: 1, toggleButton: true },
  toc: { float: true, title: 'On this page' },
};

export default config;
