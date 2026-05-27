import { getAllCategories } from "@/lib/supabase/queries";
import { ContactContent } from "./ContactContent";

export default async function ContactPage() {
  const categories = await getAllCategories();
  const categoryNames = categories.map((c) => c.name);

  return <ContactContent categoryNames={categoryNames} />;
}
