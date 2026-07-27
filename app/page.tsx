import { redirect } from "next/navigation";

// Rota raiz apenas redireciona para o login.
export default function RootPage() {
  redirect("/login");
}
