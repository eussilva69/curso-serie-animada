# VibeCloner — Instruções para Reprodução

## Site original

| Campo | Valor |
|-------|-------|
| URL | https://serieanimadadozero.netlify.app/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaexg2s2bPjEH66gaP4qKiT8sa0cZzVQmoclLsbLZiMsKDVpAN7DBEGrOemDxQ_aem_q27meIS3qPg9s2UMdHvfxg |
| Título | Série Animada do Zero |
| Capturado em | 2026-11-23T17:49:11.550Z |
| Tecnologias | HTML/CSS |

## Estrutura desta pasta

```
index.html            ← MIRROR rodável (HTML servido + JS). Rode: npx serve .
snapshot.html         ← fallback visual estático (DOM renderizado, sem JS)
mirror/               ← todos os recursos por host (js, css, fontes, imagens, mídia)
  <host>/...          ← estrutura de pastas idêntica à do original
screenshots/          ← 📸 REFERÊNCIA VISUAL — olhe aqui primeiro
DESIGN.md             ← 🎨 cores, tipografia e espaçamentos REAIS (computados)
PROMPT.md             ← este arquivo
```

## 📸 Screenshots (referência visual obrigatória)

A pasta `screenshots/` tem **11 imagems** mostrando cada seção da página como ela aparece no browser.

> **Sempre use essas imagens como referência fiel do design. Elas mostram o resultado final exato que deve ser reproduzido.**

## 🎨 Paleta (CSS custom properties extraídas)

```css
:root {
  --bg: #FFF7F2;
  --paper: #FFE3EC;
  --teal: #20A5A0;
  --sun: #FFCF3D;
  --ink: #16131F;
  --card: #FFFFFF;
  --muted: #4A4458;
  --cta: #FF5D8F;
  --pink: #FF8FB1;
  --green: #7BD389;
  --cream: #FFF3C4;
}
```

## ✒️ Fontes detectadas

- Lilita One

## 🎬 Mídias detectadas

- **1 vídeo(s)**

> Vídeos/áudios pequenos foram baixados para `assets/`; os maiores e os embeds (YouTube, etc.) mantêm a URL original no HTML. Reproduza os mesmos comportamentos (autoplay, loop, mudo) no clone.

## ⚙️ Como este mirror funciona

Este é um **espelho completo e rodável**: o `index.html` é o HTML servido pelo original, com **todo o JavaScript, CSS, fontes e imagens preservados** e as URLs reescritas para os arquivos locais em `mirror/`. Rode com `npx serve .` — o site funciona igual ao original (menus, carrosséis, animações-JS, etc.).

> **Não abra por `file://`** — as URLs são absolutas a partir da raiz e precisam de um servidor local.
>
> `snapshot.html` é um fallback visual estático (sem JS), caso algum script dependa de API ao vivo. Bibliotecas detectadas: nenhuma.

## 🤖 Prompts prontos para Claude Code / Cursor

### ① Reproduzir exatamente igual
Abra esta pasta no Claude Code (`claude .`) e cole:

```
Tenho nesta pasta o clone de um site (https://serieanimadadozero.netlify.app/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaexg2s2bPjEH66gaP4qKiT8sa0cZzVQmoclLsbLZiMsKDVpAN7DBEGrOemDxQ_aem_q27meIS3qPg9s2UMdHvfxg).

Quero que você reproduza este site exatamente igual ao original:

1. Rode o mirror com `npx serve .` e abra no navegador para ver o site funcionando
2. Leia o index.html para entender a estrutura completa (os recursos estão em /mirror/)
3. Analise as imagens em /screenshots/ — elas mostram como cada seção deve ficar visualmente
4. Use o DESIGN.md como fonte de verdade de cores, tipografia e espaçamentos (valores reais computados)
5. Mantenha todos os layouts, animações, hover effects e responsividade
6. Substitua apenas: textos de conteúdo, nome da marca e imagens de placeholder

Tecnologias do original: HTML/CSS
```

### ② Adaptar para o seu produto
```
Tenho nesta pasta o clone de https://serieanimadadozero.netlify.app/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaexg2s2bPjEH66gaP4qKiT8sa0cZzVQmoclLsbLZiMsKDVpAN7DBEGrOemDxQ_aem_q27meIS3qPg9s2UMdHvfxg.

Adapte este site para o meu produto:
- Meu produto: [descreva aqui]
- Minha marca: [seu nome]
- Minhas cores: [suas cores]
- Meu público: [quem é seu cliente]

Mantenha toda a estrutura de layout, UX e hierarquia visual.
Use as screenshots em /screenshots/ para entender o que cada seção comunica.
Reescreva todos os textos para o meu contexto. Substitua as imagens por descrições do que colocar.
```

### ③ Publicar após personalizar
```bash
npx vercel        # deploy em 30 segundos
# ou
npx serve .       # testar localmente na porta 3000
```

---
*Gerado por VibeCloner*
