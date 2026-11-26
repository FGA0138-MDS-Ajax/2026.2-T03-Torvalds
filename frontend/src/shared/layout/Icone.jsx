const caminhos = {
  inicio: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  livro: 'M12 6v14M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z',
  notas: 'M6 3h9l4 4v14H6zM9 12h7M9 16h7M9 8h3',
  calendario: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  engrenagem:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-1V5H9v2L7 8 5 7 3 11l2 1v2l-2 1 2 4 2-1 2 1v2h6v-2l2-1 2 1 2-4-2-1z',
  sino: 'M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4',
  lupa: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
}

/** Ícone simples, desenhado em SVG, que herda a cor do texto. */
export default function Icone({ nome, tamanho = 22 }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={caminhos[nome]} />
    </svg>
  )
}
