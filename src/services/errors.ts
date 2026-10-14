import { isAxiosError } from "axios";

export type ErrorKind =
  | "network"
  | "timeout"
  | "server"
  | "validation"
  | "auth"
  | "forbidden"
  | "notFound"
  | "conflict"
  | "unexpected";

// Erro padronizado da aplicação: telas só lidam com mensagens amigáveis,
// nunca com detalhes internos de rede ou do servidor.
export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly details: string[];
  readonly status?: number;

  constructor(kind: ErrorKind, message: string, details: string[] = [], status?: number) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
    this.details = details;
    this.status = status;
  }
}

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  description: "Descrição",
  genre: "Gênero",
  director: "Diretor",
  releaseYear: "Ano de lançamento",
  rating: "Nota",
  posterUrl: "URL do pôster",
  name: "Nome",
  email: "E-mail",
  password: "Senha",
  minRating: "Nota mínima",
};

// A API devolve mensagens sem acento e com o nome técnico do campo
// (ex.: "rating deve estar entre 0 e 10"); aqui viram texto para o usuário.
function translateDetail(detail: string): string {
  const [field, ...rest] = detail.split(" ");
  const label = FIELD_LABELS[field];
  const text = label ? `${label} ${rest.join(" ")}` : detail;
  return text
    .replace(/\be obrigatorio\b/g, "é obrigatório")
    .replace(/\bnao\b/g, "não")
    .replace(/\bnumero\b/g, "número")
    .replace(/\bvalido\b/g, "válido")
    .replace(/\bminimo\b/g, "mínimo");
}

const DEFAULT_MESSAGES: Record<ErrorKind, string> = {
  network: "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
  timeout: "O servidor demorou para responder. Tente novamente em instantes.",
  server: "O servidor está indisponível no momento. Tente novamente mais tarde.",
  validation: "Alguns dados estão inválidos. Revise os campos e tente novamente.",
  auth: "Sua sessão expirou ou as credenciais são inválidas. Faça login novamente.",
  forbidden: "Você não tem permissão para realizar esta ação.",
  notFound: "O item solicitado não foi encontrado.",
  conflict: "Esta operação conflita com dados já existentes.",
  unexpected: "Ocorreu um erro inesperado. Tente novamente.",
};

const KNOWN_MESSAGES: Record<string, string> = {
  "E-mail ou senha invalidos": "E-mail ou senha inválidos.",
  "E-mail ja esta em uso": "Este e-mail já está em uso.",
  "Filme nao encontrado": "Filme não encontrado. Ele pode ter sido excluído.",
  "Filme ja foi adicionado aos favoritos": "Este filme já está nos seus favoritos.",
  "Filme nao esta nos favoritos": "Este filme não está nos seus favoritos.",
  "E-mail e senha sao obrigatorios": "Informe e-mail e senha.",
};

function kindFromStatus(status: number): ErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 409) return "conflict";
  if (status >= 500) return "server";
  return "unexpected";
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new AppError("timeout", DEFAULT_MESSAGES.timeout);
    }

    // Sem resposta: servidor fora do ar, IP errado ou dispositivo offline.
    if (!error.response) {
      return new AppError("network", DEFAULT_MESSAGES.network);
    }

    const { status, data } = error.response;
    const kind = kindFromStatus(status);
    const body = (data ?? {}) as { message?: unknown; errors?: unknown };
    const apiMessage = typeof body.message === "string" ? body.message : undefined;
    const details = Array.isArray(body.errors)
      ? body.errors.filter((e): e is string => typeof e === "string").map(translateDetail)
      : [];

    // Mensagens 5xx não são repassadas: podem conter detalhes internos.
    const message =
      kind !== "server" && apiMessage && KNOWN_MESSAGES[apiMessage]
        ? KNOWN_MESSAGES[apiMessage]
        : DEFAULT_MESSAGES[kind];

    return new AppError(kind, message, details, status);
  }

  return new AppError("unexpected", DEFAULT_MESSAGES.unexpected);
}

export function unexpectedResponse(): AppError {
  return new AppError(
    "unexpected",
    "O servidor enviou uma resposta inesperada. Tente novamente mais tarde."
  );
}

export function getErrorMessage(error: unknown): string {
  const appError = toAppError(error);
  return appError.details.length
    ? `${appError.message}\n• ${appError.details.join("\n• ")}`
    : appError.message;
}
