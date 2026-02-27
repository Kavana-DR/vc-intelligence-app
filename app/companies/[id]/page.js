import { notFound } from "next/navigation";
import companies from "../../../data/companies.json";
import CompanyProfileClient from "../../components/CompanyProfileClient";

export default async function CompanyProfilePage({ params }) {
  const { id } = await params;
  const company = companies.find((item) => String(item.id) === id);

  if (!company) notFound();

  return <CompanyProfileClient company={company} />;
}
