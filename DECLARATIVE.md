# TSX5 Compose UI - Documentação

Esta é uma documentação rápida para uso dos componentes declarativos da biblioteca `tsx5-compose`.
Todos os componentes utilizam `TSX5Node` e foram projetados para facilitar a composição de interfaces reativas, tanto no lado do cliente quanto no lado do servidor (SSR).

---

## Layout

```ts
Column(() => [
  Text("Linha 1"),
  Text("Linha 2")
])

Row(() => [
  Text("Lado A"),
  Text("Lado B")
])
```

---

## Tipografia

```ts
Title("Dashboard")
Text("Texto comum", {}, { color: "gray" })
```

---

## Formulários

### Campos isolados
```ts
Input({ type: "text", placeholder: "Digite aqui..." })
Textarea({ rows: 4 })
Select(["Sim", "Não"])
```

### Formulário com grupos
```ts
Form(() => [
  FormGroup("Nome", Input({ id: "nome" }), "nome"),
  FormGroup("Email", Input({ id: "email" }), "email", "Campo obrigatório", "Ex: voce@email.com"),
  Button("Enviar", { type: "submit" })
])
```

---

## Listas e Tabelas

```ts
Ul([Text("Item 1"), Text("Item 2")])

Table(
  ["Produto", "Preço"],
  [
    { nome: "Banana", preco: "R$ 5" },
    { nome: "Maçã", preco: "R$ 3" }
  ],
  (row) => [Text(row.nome), Text(row.preco)]
)
```

---

## Utilitários e Lógica

```ts
Spacer("2rem")
Visibility(true, () => Text("Visível"))
Conditional(cond, () => Text("Sim"), () => Text("Não"))
```

---

## Customização JSX

```ts
InjectJSX(() => <CustomComponente />)
```

## Renderização Manual

```ts
render(() => Column(() => [Title("Hello"), Text("World")]))
```

---

## Integração com useForm

```ts
const { values, handleChange, handleSubmit } = useForm({ email: "", senha: "" });

Form(() => [
  FormGroup("E-mail", Input({
    id: "email",
    type: "email",
    value: values.email,
    onInput: (e) => handleChange("email", (e.target as HTMLInputElement).value)
  }), "email"),

  FormGroup("Senha", Input({
    id: "senha",
    type: "password",
    value: values.senha,
    onInput: (e) => handleChange("senha", (e.target as HTMLInputElement).value)
  }), "senha"),

  Button("Entrar", { type: "submit" })
], {
  onSubmit: handleSubmit((formValues) => console.log(formValues))
})
```

---

## Como criar seus próprios componentes declarativos

Você pode criar seu próprio componente declarativo com `createElement` ou reutilizando os já existentes:

```ts
export function DangerText(content: string): TSX5Node {
  return Text(content, {}, { color: "red", fontWeight: "bold" });
}

export function CardTitle(text: string): TSX5Node {
  return Title(text, 2, {}, { marginBottom: "0.5rem" });
}

export function Section(children: () => TSX5Node[]): TSX5Node {
  return Box(children, {}, { backgroundColor: "#f9f9f9" });
}
```

---

## Estrutura modular recomendada

Para organizar bem seus componentes declarativos personalizados, crie uma pasta:

```
/src/
  components/
    ui/
      Button.ts
      Text.ts
      FormGroup.ts
    index.ts
```

### Exemplo de `index.ts`

```ts
export * from './ui/Button';
export * from './ui/Text';
export * from './ui/FormGroup';
```

Assim, você importa tudo centralizado:

```ts
import { Button, Text, FormGroup } from '@/components';
```

---

Se quiser contribuições, temas customizados ou integrações com rotas/SSR, use junto com `tsx5-server` e `tsx5-base`.
