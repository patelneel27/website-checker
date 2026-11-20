import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { config } from "./config";

let transporter: Transporter | null = null;

export function mailerEnabled() {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.password);
}

export function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user: config.smtp.user, pass: config.smtp.password },
    pool: true,
    maxConnections: 2,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
  return transporter;
}
