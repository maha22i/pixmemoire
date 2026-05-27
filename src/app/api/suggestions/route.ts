import { NextRequest, NextResponse } from "next/server";

interface SuggestionBody {
  type: string;
  personality_id?: string;
  submitter_name: string;
  submitter_email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SuggestionBody;

    if (!body.submitter_name || !body.submitter_email || !body.message) {
      return NextResponse.json(
        { success: false, message: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Votre suggestion a été enregistrée.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Requête invalide." },
      { status: 400 }
    );
  }
}
