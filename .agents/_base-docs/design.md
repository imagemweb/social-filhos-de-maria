# Convenções de Design

## Stack de Estilo

- **Tailwind CSS v4** — utility-first, sem arquivo CSS separado (exceto globals.css mínimo)
- **Fontes Google** — carregadas dinamicamente via configuração do site
- **Cores** — 3 cores configuráveis: primária, secundária, acento
- **Responsividade** — mobile-first, breakpoints `sm:` `md:` `lg:`

---

## Sistema de Cores

As cores do site são definidas no painel admin e aplicadas via CSS custom properties:

```typescript
// Cores definidas em config.colors
{
  primary: '#c8a84b',    // dourado
  secondary: '#2d6a1f',  // verde
  accent: '#8b1a1a',     // vinho
}
```

Aplicação via style inline:
```tsx
<section style={{ backgroundColor: config.colors.primary }}>
```

Ou via CSS vars no root:
```tsx
// em layout.tsx
<style>{`
  :root {
    --color-primary: ${config.colors.primary};
    --color-secondary: ${config.colors.secondary};
    --color-accent: ${config.colors.accent};
  }
`}</style>
```

---

## Tipografia

3 fontes configuráveis carregadas do Google Fonts:
- `fontHeading` — títulos (ex: Cinzel, Playfair Display, Montserrat)
- `fontBody` — corpo do texto (ex: Lato, Open Sans, Roboto)
- `fontAccent` — destaques/UI (ex: Raleway, Nunito)

```tsx
// Aplicação
<h1 style={{ fontFamily: config.fonts.heading }}>Título</h1>
<p style={{ fontFamily: config.fonts.body }}>Texto</p>
```

---

## Padrões de Layout

### Seção padrão
```tsx
<section className="py-16 px-4">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-12">Título</h2>
    {/* conteúdo */}
  </div>
</section>
```

### Grid de cards
```tsx
// 3 colunas no desktop, 1 no mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Card padrão
```tsx
<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <img src={item.image} alt={item.title} className="w-full aspect-video object-cover" />
  <div className="p-4">
    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
    <p className="text-gray-600 text-sm">{item.description}</p>
  </div>
</div>
```

---

## Backgrounds de Seção

Cada seção suporta 4 tipos de fundo:

```typescript
type SectionBg = {
  type: 'color' | 'gradient' | 'image' | 'youtube';
  color?: string;           // '#ffffff'
  gradient?: string;        // 'linear-gradient(135deg, #c8a84b, #2d6a1f)'
  image?: string;           // '/uploads/bg.webp'
  youtube?: string;         // YouTube video ID
  overlay?: number;         // 0-100 (opacidade da sobreposição escura)
}
```

Aplicação:
```tsx
function getSectionBgStyle(bg: SectionBg): React.CSSProperties {
  if (bg.type === 'color') return { backgroundColor: bg.color };
  if (bg.type === 'gradient') return { background: bg.gradient };
  if (bg.type === 'image') return {
    backgroundImage: `url(${bg.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  return {};
}
```

---

## Imagens

- **Formato:** WebP (comprimido no frontend antes do upload)
- **Compressão:** `compressImage()` em `src/lib/utils.ts` — converte para WebP, máx 1920px, qualidade 85%
- **Aspect ratios configuráveis:** 16/9, 4/3, 1/1, 3/4, livre
- **Lazy loading:** `loading="lazy"` em todas as imagens abaixo do fold

---

## Componentes Reutilizáveis (padrões)

### Botão
```tsx
// Primário
<button className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium">
  Ação
</button>

// Outline
<button className="border-2 border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
  Ação Secundária
</button>
```

### Input
```tsx
<input
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
  type="text"
  placeholder="Placeholder"
/>
```

### Textarea
```tsx
<textarea
  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
  rows={4}
/>
```

---

## Animações

- Transições suaves: `transition-all duration-300`
- Hover em cards: `hover:scale-105` ou `hover:shadow-lg`
- Evitar animações que causam layout shift (reflow)
- `framer-motion` para animações mais complexas (scroll-triggered)

---

## Admin UI

- Sidebar fixa no desktop, drawer no mobile
- Cards editáveis com preview ao vivo
- Upload de imagem com preview antes de confirmar
- Feedback de salvamento: toast ou mensagem inline
- Cores do admin: fundo branco/cinza claro, accent primário do cliente
