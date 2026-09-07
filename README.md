# MObra Connect — Frontend Piloto

Frontend estático, funcional e responsivo preparado para uma fase piloto e para hospedagem na Vercel.

## Conteúdo da prévia

- **Cliente:** dashboard, lista manual de materiais, comparação de propostas, carrinho e acompanhamento de pedido.
- **Ferragem:** dashboard, catálogo/stock e gestão de pedidos.
- **Motorista:** entrega atribuída, recolha, transporte e confirmação.
- **Administrador:** indicadores, aprovação de ferragens e registo de auditoria.
- Dados simulados e persistência local no navegador (`localStorage`) para demonstrar interações sem backend.
- Rodapé permanente informando que é apenas uma prévia e ainda está em construção.
- Design responsivo para computador, tablet e telemóvel.

## Publicar na Vercel

### Opção A — Git
1. Crie um repositório no GitHub/GitLab/Bitbucket e envie os ficheiros desta pasta.
2. Na Vercel, escolha **Add New → Project** e importe o repositório.
3. Em **Framework Preset**, pode deixar **Other**.
4. Não é necessário comando de build nem variáveis de ambiente.
5. Clique em **Deploy**.

### Opção B — Vercel CLI
```bash
npm i -g vercel
vercel
```

## Testar localmente

Pode abrir `index.html` diretamente ou iniciar um servidor simples:

```bash
python3 -m http.server 8080
```

Depois aceda a `http://localhost:8080`.

## Limites desta fase

Esta entrega é somente frontend de demonstração. Autenticação real, base de dados, API, pagamentos, uploads, mapas, envio de mensagens e outras integrações externas ainda não estão implementados. Os dados da interface são fictícios e servem apenas para validação da experiência do MVP.
