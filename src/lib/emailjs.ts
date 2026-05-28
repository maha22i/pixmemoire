import emailjs from "@emailjs/browser";

export type PersonalityProposalParams = {
  from_name: string;
  from_email: string;
  personality_name: string;
  category: string;
  message: string;
};

export type ErrorReportParams = {
  from_name: string;
  from_email: string;
  page_url: string;
  description: string;
};

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const proposalTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const errorTemplateId = process.env.NEXT_PUBLIC_EMAILJS_ERROR_TEMPLATE_ID;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

function isBaseConfigured(): boolean {
  return Boolean(serviceId && publicKey);
}

export function isProposalEmailConfigured(): boolean {
  return Boolean(isBaseConfigured() && proposalTemplateId);
}

export function isErrorEmailConfigured(): boolean {
  return Boolean(isBaseConfigured() && errorTemplateId);
}

export async function sendPersonalityProposal(
  params: PersonalityProposalParams,
): Promise<void> {
  if (!isProposalEmailConfigured()) {
    throw new Error(
      "EmailJS (proposition) n'est pas configuré. Vérifiez NEXT_PUBLIC_EMAILJS_TEMPLATE_ID.",
    );
  }

  await emailjs.send(serviceId!, proposalTemplateId!, params, {
    publicKey: publicKey!,
  });
}

export async function sendErrorReport(params: ErrorReportParams): Promise<void> {
  if (!isErrorEmailConfigured()) {
    throw new Error(
      "EmailJS (signalement) n'est pas configuré. Vérifiez NEXT_PUBLIC_EMAILJS_ERROR_TEMPLATE_ID.",
    );
  }

  await emailjs.send(serviceId!, errorTemplateId!, params, {
    publicKey: publicKey!,
  });
}
